using EduConnect.Domain.Entities;
using EduConnect.Infrastructure.Context;
using EduConnect.Application.DTOs;
using Microsoft.EntityFrameworkCore;
using EduConnect.Domain.Helpers;

namespace EduConnect.Application.Services;

public class MatriculaService
{
    private readonly EduConnectDbContext _context;
    private readonly EmailService _emailService;

    public MatriculaService(EduConnectDbContext context, EmailService emailService)
    {
        _context = context;
        _emailService = emailService;
    }

    // 1: Solicitação (O que o Aluno/Responsável faz no Front-end)
    public async Task SolicitarMatricula(MatriculaDto dto)
    {
        // Validação de segurança: Impede o upload de arquivos maliciosos (apenas PDF)
        var extensao = Path.GetExtension(dto.ArquivoHistorico.FileName).ToLower();
        if (extensao != ".pdf")
        {
            throw new Exception("Vulnerabilidade detectada: Apenas arquivos PDF são permitidos.");
        }

        // Simulação de salvamento de arquivo (Gera um nome único para o PDF)
        string caminhoArquivo = $"uploads/historicos/{Guid.NewGuid()}.pdf";

        // Cria o Responsável com senha protegida por Hash (Boa prática de segurança)
        var responsavel = new Responsavel
        {
            Nome = dto.ResponsavelNome,
            Email = dto.ResponsavelEmail,
            CPF = dto.ResponsavelCPF,
            Telefone = dto.ResponsavelTelefone,
            PasswordHash = PasswordHasher.HashPassword(Guid.NewGuid().ToString())
        };

        // Cria o Aluno com status inicial Pendente
        var aluno = new Aluno
        {
            Nome = dto.AlunoNome,
            CPF = dto.AlunoCPF,
            DataNascimento = dto.AlunoDataNascimento,
            Turma = dto.AlunoTurma,
            Responsavel = responsavel,
            Status = Aluno.EnrollmentStatus.Pendente,

            // Matricula exibe o estado enquanto não há um número oficial
            Matricula = "AGUARDANDO APROVAÇÃO",
            RA = null, // Fica nulo (melhor prática de mercado para dados inexistentes)

            HistoricoEscolarPath = caminhoArquivo,
            PasswordHash = PasswordHasher.HashPassword(Guid.NewGuid().ToString())
        };

        _context.Responsaveis.Add(responsavel);
        _context.Alunos.Add(aluno);
        await _context.SaveChangesAsync();

        // Notifica o Admin via e-mail real
        await _emailService.EnviarEmailAsync("admin@educonnect.com",
            "Nova Matrícula Pendente",
            $"O aluno {aluno.Nome} solicitou matrícula e aguarda sua revisão no painel.");
    }

    // 2: Aprovação (O que o Administrador faz no painel)
    public async Task AprovarMatricula(Guid alunoId)
    {
        // Carrega o aluno e o responsável garantindo que os dados estejam vinculados (Include)
        var aluno = await _context.Alunos
            .Include(a => a.Responsavel)
            .FirstOrDefaultAsync(a => a.Id == alunoId);

        if (aluno == null) return;

        // Gera o número oficial de identificação (Pode ser o mesmo para RA e Matrícula)
        string numeroOficial = "RA" + DateTime.Now.Year + new Random().Next(1000, 9999);

        // Gera uma senha temporária segura para o primeiro acesso
        string senhaTemporaria = Guid.NewGuid().ToString().Substring(0, 8);

        // --- ATUALIZAÇÃO DOS DADOS ---

        // O status muda para Aprovado (ou Ativo)
        aluno.Status = Aluno.EnrollmentStatus.Aprovado;

        // A matrícula deixa de ser "AGUARDANDO" e recebe o número oficial
        aluno.Matricula = numeroOficial;

        // O RA é preenchido, permitindo o login do aluno
        aluno.RA = numeroOficial;

        // A senha temporária é transformada em Hash antes de ir para o banco
        aluno.PasswordHash = PasswordHasher.HashPassword(senhaTemporaria);

        await _context.SaveChangesAsync();

        // E-mail de boas-vindas com as credenciais de acesso
        string mensagem = $@"
            <h2>Matrícula Confirmada!</h2>
            <p>Olá! O cadastro do aluno <b>{aluno.Nome}</b> foi aprovado com sucesso.</p>
            <p>A partir de agora, o acesso ao portal deve ser feito com os dados abaixo:</p>
            <ul>
                <li><b>RA (Login):</b> {aluno.RA}</li>
                <li><b>Senha Temporária:</b> {senhaTemporaria}</li>
            </ul>
            <p><i>Dica de segurança: Altere sua senha após o primeiro login.</i></p>";

        await _emailService.EnviarEmailAsync(aluno.Responsavel.Email, "Bem-vindo ao EduConnect - Acesso Liberado", mensagem);
    }
}