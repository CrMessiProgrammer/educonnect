using EduConnect.Domain.Entities;
using EduConnect.Infrastructure.Context;

namespace EduConnect.Application.Services;

public class ProfessorService
{
    private readonly EduConnectDbContext _context;
    private readonly EmailService _emailService;

    public ProfessorService(EduConnectDbContext context, EmailService emailService)
    {
        _context = context;
        _emailService = emailService;
    }

    public async Task CadastrarProfessor(Professor professor)
    {
        // 1. Gera o Registro do Professor (RP)
        professor.RP = "RP" + DateTime.Now.Year + new Random().Next(1000, 9999);

        // 2. Gera senha inicial
        string senhaInicial = Guid.NewGuid().ToString().Substring(0, 8);
        professor.PasswordHash = senhaInicial;

        _context.Professores.Add(professor);
        await _context.SaveChangesAsync();

        // 3. Envia e-mail real com o acesso
        string mensagem = $@"
            <h2>Bem-vindo ao EduConnect, Prof. {professor.Nome}</h2>
            <p>Seu acesso ao portal foi criado:</p>
            <p><strong>Login (RP):</strong> {professor.RP}</p>
            <p><strong>Senha:</strong> {senhaInicial}</p>";

        await _emailService.EnviarEmailAsync(professor.Email!, "Seu Acesso - EduConnect", mensagem);
    }
}