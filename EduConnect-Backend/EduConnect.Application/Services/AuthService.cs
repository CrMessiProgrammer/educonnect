using EduConnect.Infrastructure.Context;
using EduConnect.Application.DTOs;
using EduConnect.Domain.Entities; // Correção do Erro CS0246
using Microsoft.EntityFrameworkCore;
using MimeKit;
using MailKit.Net.Smtp;

namespace EduConnect.Application.Services;

public class AuthService
{
    private readonly EduConnectDbContext _context;
    public AuthService(EduConnectDbContext context) => _context = context;

    public async Task<bool> SolicitarCodigoResetAsync(SolicitarCodigoDto dto)
    {
        // Busca flexível igual do Login
        var usuario = await _context.Users.FirstOrDefaultAsync(u =>
            (u is Administrador && ((Administrador)u).Email == dto.Identificacao) ||
            (u is Professor && ((Professor)u).Email == dto.Identificacao) ||
            (u is Responsavel && ((Responsavel)u).Email == dto.Identificacao)
        );

        // Se não achou por E-mail, busca por RA (Aluno)
        if (usuario == null)
        {
            usuario = await _context.Alunos
                .Include(a => a.Responsavel)
                .FirstOrDefaultAsync(a => a.RA == dto.Identificacao);
        }

        if (usuario == null) return false;

        // Gera o código de 6 dígitos
        var random = new Random();
        var codigo = random.Next(100000, 999999).ToString();

        usuario.ResetCode = codigo;
        usuario.ResetCodeExpiration = DateTime.UtcNow.AddMinutes(15);
        await _context.SaveChangesAsync();

        // Define para onde vai o e-mail
        string emailDestino = "N/A";
        string nomeDestino = usuario.Nome;

        if (usuario is Aluno aluno && aluno.Responsavel != null)
        {
            emailDestino = aluno.Responsavel.Email;
            nomeDestino = aluno.Responsavel.Nome; // Manda no nome do Pai/Mãe
        }
        else if (usuario is Administrador admin) emailDestino = admin.Email;
        else if (usuario is Professor prof) emailDestino = prof.Email;
        else if (usuario is Responsavel resp) emailDestino = resp.Email;

        // Chama o método que envia o E-mail via Ethereal
        await EnviarEmailEtherealAsync(emailDestino, nomeDestino, codigo);

        return true;
    }

    public async Task<bool> RedefinirSenhaAsync(RedefinirSenhaDto dto)
    {
        var usuario = await _context.Users.FirstOrDefaultAsync(u =>
            (
                (u is Administrador && ((Administrador)u).Email == dto.Identificacao) ||
                (u is Professor && ((Professor)u).Email == dto.Identificacao) ||
                (u is Responsavel && ((Responsavel)u).Email == dto.Identificacao) ||
                (u is Aluno && ((Aluno)u).RA == dto.Identificacao)
            ) &&
            u.ResetCode == dto.Codigo &&
            u.ResetCodeExpiration > DateTime.UtcNow);

        if (usuario == null) return false;

        // Criptografa a nova senha e limpa o código
        usuario.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NovaSenha);
        usuario.ResetCode = null;
        usuario.ResetCodeExpiration = null;

        await _context.SaveChangesAsync();
        return true;
    }

    // MÉTODO PRIVADO PARA ENVIO DE E-MAIL
    private async Task EnviarEmailEtherealAsync(string emailDestino, string nomeDestino, string codigo)
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress("Suporte EduConnect", "suporte@educonnect.com"));
        message.To.Add(new MailboxAddress(nomeDestino, emailDestino));
        message.Subject = "EduConnect - Seu Código de Segurança";

        message.Body = new TextPart("html")
        {
            Text = $@"
            <div style='font-family: Arial, sans-serif; padding: 20px;'>
                <h2>Olá, {nomeDestino}!</h2>
                <p>Você solicitou a redefinição de senha no sistema EduConnect.</p>
                <p>Seu código de verificação é: <strong style='font-size: 24px; color: #2E86C1;'>{codigo}</strong></p>
                <p><em>Este código expira em 15 minutos.</em></p>
                <hr/>
                <p style='font-size: 12px; color: gray;'>Se você não solicitou isso, ignore este e-mail.</p>
            </div>"
        };

        using var client = new SmtpClient();
        await client.ConnectAsync("smtp.ethereal.email", 587, MailKit.Security.SecureSocketOptions.StartTls);

        // CREDENCIAIS DO ETHEREAL
        await client.AuthenticateAsync("doris55@ethereal.email", "JRk8NG2KF7N6xBXFfF");

        await client.SendAsync(message);
        await client.DisconnectAsync(true);
    }
}