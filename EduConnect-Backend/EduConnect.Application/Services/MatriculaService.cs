using EduConnect.Domain.Entities;
using EduConnect.Infrastructure.Context;
using EduConnect.Application.DTOs;
using Microsoft.EntityFrameworkCore;
using EduConnect.Domain.Helpers;

namespace EduConnect.Application.Services;

public class MatriculaService
{
    private readonly EduConnectDbContext _context;
    private readonly EmailService _emailService; // Serviço de e-mail

    public MatriculaService(EduConnectDbContext context, EmailService emailService)
    {
        _context = context;
        _emailService = emailService;
    }

    // 1: Solicitação (O que o Aluno/Responsável faz)
    public async Task SolicitarMatricula(MatriculaDto dto)
    {
        var responsavel = new Responsavel
        {
            Nome = dto.ResponsavelNome,
            Email = dto.ResponsavelEmail,
            CPF = dto.ResponsavelCPF,
            Telefone = dto.ResponsavelTelefone,
            PasswordHash = PasswordHasher.HashPassword(Guid.NewGuid().ToString()) // Gera um hash aleatório só para não ficar vazio
        };

        var aluno = new Aluno
        {
            Nome = dto.AlunoNome,
            CPF = dto.AlunoCPF,
            DataNascimento = dto.AlunoDataNascimento,
            Turma = dto.AlunoTurma,
            Responsavel = responsavel,
            Status = Aluno.EnrollmentStatus.Pendente, // O STATUS já diz que está pendente
            PasswordHash = PasswordHasher.HashPassword(Guid.NewGuid().ToString()) // Gera um hash aleatório só para não ficar vazio
        };

        _context.Responsaveis.Add(responsavel);
        _context.Alunos.Add(aluno);
        await _context.SaveChangesAsync();

        // Notifica o Admin (E-mail Real)
        await _emailService.EnviarEmailAsync("admin@educonnect.com",
            "Nova Matrícula Pendente",
            $"O aluno {aluno.Nome} solicitou matrícula e aguarda sua aprovação.");
    }

    // 2: Aprovação (O que o Administrador faz)
    public async Task AprovarMatricula(Guid alunoId)
    {
        var aluno = await _context.Alunos.Include(a => a.Responsavel).FirstOrDefaultAsync(a => a.Id == alunoId);
        if (aluno == null) return;

        // Gera RA e Senha Aleatória
        aluno.RA = "RA" + DateTime.Now.Year + new Random().Next(1000, 9999);
        string senhaGerada = Guid.NewGuid().ToString().Substring(0, 8);
        aluno.PasswordHash = PasswordHasher.HashPassword(senhaGerada); // HASH AQUI
        aluno.Status = Aluno.EnrollmentStatus.Aprovado;
        // O e-mail continua enviando a 'senhaGerada' (texto puro), mas o banco guarda o Hash.

        await _context.SaveChangesAsync();

        // Envia E-mail para o Responsável com os dados de acesso
        string mensagem = $@"
            <h2>Matrícula Aprovada!</h2>
            <p>Olá, os dados de acesso do aluno {aluno.Nome} foram gerados:</p>
            <p><strong>Login (RA):</strong> {aluno.RA}</p>
            <p><strong>Senha Temporária:</strong> {senhaGerada}</p>";

        await _emailService.EnviarEmailAsync(aluno.Responsavel.Email, "Bem-vindo ao EduConnect - Acesso Liberado", mensagem);
    }
}