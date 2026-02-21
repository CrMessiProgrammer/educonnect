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

        // --- LÓGICA DE REAPROVEITAMENTO DO RESPONSÁVEL ---
        // Tenta encontrar um responsável já cadastrado pelo CPF
        var responsavel = await _context.Responsaveis
            .FirstOrDefaultAsync(r => r.CPF == dto.ResponsavelCPF);

        // Se não existir, aí sim criamos um novo objeto e adicionamos ao banco
        if (responsavel == null)
        {
            // Cria o Responsável com senha protegida por Hash (Boa prática de segurança)
            responsavel = new Responsavel
            {
                Nome = dto.ResponsavelNome,
                Email = dto.ResponsavelEmail,
                CPF = dto.ResponsavelCPF,
                Telefone = dto.ResponsavelTelefone,
                PasswordHash = PasswordHasher.HashPassword(Guid.NewGuid().ToString())
            };

            _context.Responsaveis.Add(responsavel);
        }
        else
        {
            // Atualiza o telefone ou e-mail caso o pai tenha mudado 
            // no momento da nova matrícula
            responsavel.Telefone = dto.ResponsavelTelefone;
            responsavel.Email = dto.ResponsavelEmail;
        }

        // Cria o Aluno com status inicial Pendente e vinculado ao responsável (seja ele novo ou antigo)
        var aluno = new Aluno
        {
            Nome = dto.AlunoNome,
            CPF = dto.AlunoCPF,
            DataNascimento = dto.AlunoDataNascimento,
            TurmaId = null, // Deixa vazio para o Admin decidir depois
            Responsavel = responsavel,
            Status = Aluno.EnrollmentStatus.Pendente,

            // Matricula exibe o estado enquanto não há um número oficial
            // Guarda a série aqui por enquanto
            Matricula = "AGUARDANDO APROVAÇÃO - " + dto.SeriePretendida,
            RA = null, // Fica nulo (melhor prática de mercado para dados inexistentes)

            HistoricoEscolarPath = caminhoArquivo,
            PasswordHash = PasswordHasher.HashPassword(Guid.NewGuid().ToString())
        };

        _context.Alunos.Add(aluno);

        // Salva as alterações (Se o responsável for novo, ele salva o pai e o filho. 
        // Se for antigo, salva apenas o novo filho e o vínculo)
        await _context.SaveChangesAsync();

        // Notifica o Admin via e-mail real
        await _emailService.EnviarEmailAsync("admin@educonnect.com",
            "Nova Matrícula Pendente",
            $"O(A) aluno(a) {aluno.Nome} solicitou matrícula e aguarda sua revisão no painel.");
    }

    // 2: Aprovação (O que o Administrador faz no painel)
    public async Task AprovarMatricula(Guid alunoId, Guid turmaId)
    {
        // Carrega o aluno e o responsável garantindo que os dados estejam vinculados (Include)
        var aluno = await _context.Alunos
            .Include(a => a.Responsavel)
            .FirstOrDefaultAsync(a => a.Id == alunoId);

        // Valida se a aluno existe
        if (aluno == null) throw new Exception("Aluno não encontrado.");

        // Valida se a turma existe
        var turma = await _context.Turmas.FindAsync(turmaId);
        if (turma == null) throw new Exception("Turma não encontrada.");

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

        // Vincula o aluno à turma
        aluno.TurmaId = turmaId;

        await _context.SaveChangesAsync();

        // E-mail de boas-vindas com as credenciais de acesso
        string mensagem = $@"
            <h2>Matrícula Confirmada!</h2>
            <p>Olá! O cadastro do(a) aluno(a) <b>{aluno.Nome}</b> foi aprovado com sucesso.</p>
            <p>A partir de agora, o acesso ao portal deve ser feito com os dados abaixo:</p>
            <ul>
                <li><b>RA (Login):</b> {aluno.RA}</li>
                <li><b>Senha Temporária:</b> {senhaTemporaria}</li>
            </ul>
            <p><i>Dica de segurança: Altere sua senha após o primeiro login.</i></p>";

        await _emailService.EnviarEmailAsync(aluno.Responsavel.Email, "Bem-vindo ao EduConnect - Acesso Liberado", mensagem);
    }
}