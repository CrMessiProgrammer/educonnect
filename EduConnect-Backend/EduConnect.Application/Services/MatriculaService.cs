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
    private readonly PagamentoService _pagamentoService;

    public MatriculaService(EduConnectDbContext context, EmailService emailService, PagamentoService pagamentoService)
    {
        _context = context;
        _emailService = emailService;
        _pagamentoService = pagamentoService;
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

        // Salva o arquivo no físico
        var diretorio = Path.Combine(Directory.GetCurrentDirectory(), "uploads", "historicos");
        if (!Directory.Exists(diretorio)) Directory.CreateDirectory(diretorio); // Cria a pasta se não existir

        var caminhoCompleto = Path.Combine(Directory.GetCurrentDirectory(), caminhoArquivo);
        using (var stream = new FileStream(caminhoCompleto, FileMode.Create))
        {
            await dto.ArquivoHistorico.CopyToAsync(stream);
        }

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

    // 2: Listagem de Pendentes (Visão do Administrador)
    public async Task<object> ObterMatriculasPendentesAsync()
    {
        var pendentes = await _context.Alunos
            .Include(a => a.Responsavel) // Garante que vai ter o nome do pai/mãe
            .Where(a => a.Status == Aluno.EnrollmentStatus.Pendente)
            .Select(a => new
            {
                Id = a.Id,
                NomeAluno = a.Nome,
                DataNascimento = a.DataNascimento,
                NomeResponsavel = a.Responsavel.Nome,
                // Limpamos a string para mostrar só a série no frontend
                SeriePretendida = a.Matricula.Replace("AGUARDANDO APROVAÇÃO - ", ""),
                DataSolicitacao = a.DataCriacao
            })
            .ToListAsync();

        return pendentes;
    }

    // 3: Informações detalhadas das Matrículas (Admin visualiza no painel)
    public async Task<object> ObterDetalhesMatriculaAsync(Guid alunoId)
    {
        var aluno = await _context.Alunos
            .Include(a => a.Responsavel)
            .FirstOrDefaultAsync(a => a.Id == alunoId);

        if (aluno == null) throw new Exception("Matrícula não encontrada.");

        return new
        {
            AlunoNome = aluno.Nome,
            AlunoCPF = aluno.CPF,
            AlunoDataNascimento = aluno.DataNascimento,
            SeriePretendida = aluno.Matricula.Replace("AGUARDANDO APROVAÇÃO - ", ""),
            ResponsavelNome = aluno.Responsavel.Nome,
            ResponsavelEmail = aluno.Responsavel.Email,
            ResponsavelCPF = aluno.Responsavel.CPF,
            ResponsavelTelefone = aluno.Responsavel.Telefone,
            DataSolicitacao = aluno.DataCriacao
        };
    }

    // 4: Aprovação (O que o Administrador faz no painel)
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

        // Gera a cobrança da taxa de matrícula
        var transacao = await _pagamentoService.GerarTransacaoPixAsync(
            aluno.Responsavel.Id,
            "Matricula",
            $"Taxa de Matrícula - Aluno {aluno.Nome}",
            350.00m, // Valor fictício da matrícula
            aluno.Id // O ID do aluno fica como referência
        );

        // E-mail com credenciais e pix
        string mensagem = $@"
            <div style='font-family: Arial, sans-serif; color: #333;'>
                <h2>Matrícula Pré-Aprovada! &#x0001F389</h2>
                <p>Olá! O cadastro do(a) aluno(a) <b>{aluno.Nome}</b> foi aprovado academicamente em nossa instituição.</p>
        
                <div style='background-color: #f9f9f9; padding: 15px; border-left: 5px solid #2196f3; margin: 20px 0;'>
                    <h4 style='margin-top: 0;'>&#x0001F511 Acesso do Aluno (Portal)</h4>
                    <p><b>Login (RA):</b> {aluno.RA}<br>
                    <b>Senha Temporária:</b> {senhaTemporaria}</p>
                </div>

                <div style='background-color: #f9f9f9; padding: 15px; border-left: 5px solid #ff9800; margin: 20px 0;'>
                    <h4 style='margin-top: 0;'>&#x0001F464 Seu Acesso (Área do Responsável)</h4>
                    <p>Para acompanhar o financeiro, notas e recados, acesse com seu e-mail: <b>{aluno.Responsavel.Email}</b>.</p>
                    <p><i>Caso seja seu primeiro acesso, clique em <b>'Primeiro Acesso / Esqueci a Senha'</b> na tela de login para definir sua senha pessoal.</i></p>
                </div>

                <hr>
                <h3>&#x0001F4B0 Passo Final: Taxa de Matrícula</h3>
                <p>Para oficializar a matrícula e ativar o acesso do aluno, realize o pagamento via PIX (Valor: R$ 350,00):</p>
                <div style='background-color: #eee; padding: 10px; border-radius: 5px; font-family: monospace; word-break: break-all;'>
                    {transacao.CodigoPix}
                </div>
                <p style='font-size: 0.9em; color: #666;'>O sistema reconhecerá o pagamento em até 5 minutos e ativará o aluno automaticamente.</p>
            </div>";

        await _emailService.EnviarEmailAsync(aluno.Responsavel.Email, "EduConnect - Aprovação e Pagamento da Matrícula", mensagem);
    }
}