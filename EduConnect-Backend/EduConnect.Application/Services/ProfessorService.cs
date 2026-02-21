using EduConnect.Domain.Entities;
using EduConnect.Infrastructure.Context;
using EduConnect.Application.DTOs;
using EduConnect.Domain.Helpers;
using Microsoft.EntityFrameworkCore;

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

    // Listagem para o Admin
    public async Task<List<ProfessorResponseDto>> ListarTodos()
    {
        return await _context.Professores
            .Include(p => p.Turmas) // Carrega as turmas do banco
            .Select(p => new ProfessorResponseDto(
                p.Id,
                p.Nome,
                p.Email,
                p.CPF,
                p.Disciplina,
                p.RP,
                p.Turmas.Select(t => t.Nome).ToList() // <--- Transforma as Turmas em lista de nomes
            ))
            .ToListAsync();
    }

    public async Task<Professor?> ObterPorId(Guid id) =>
        await _context.Professores
            .Include(p => p.Turmas)
            .FirstOrDefaultAsync(p => p.Id == id);

    // Método de cadastro
    public async Task CadastrarProfessor(ProfessorCreateDto dto)
    {
        // 1. Validação: E-mail já existe?
        if (await _context.Professores.AnyAsync(p => p.Email == dto.Email))
            throw new Exception("Este e-mail já está cadastrado.");

        // 2. Validação da lista pré-definida
        if (!EduConnectConfig.DisciplinasValidas.Contains(dto.Disciplina))
        {
            throw new Exception("Disciplina inválida. Escolha uma das opções permitidas.");
        }

        // 3. Gera o Registro do Professor (RP) - Ex: RP20261234
        string rpGerado = "RP" + DateTime.Now.Year + new Random().Next(1000, 9999);

        // 4. Gera senha inicial temporária (8 caracteres)
        string senhaInicial = Guid.NewGuid().ToString().Substring(0, 8);

        // 5. Mapeia DTO para Entidade e CRIPTOGRAFA a senha
        var professor = new Professor
        {
            Nome = dto.Nome,
            Email = dto.Email,
            CPF = dto.CPF,
            Disciplina = dto.Disciplina,
            RP = rpGerado,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(senhaInicial), // Salva o Hash, mas é enviado a senha limpa por e-mail
            Ativo = true,
            DataCriacao = DateTime.UtcNow
        };

        _context.Professores.Add(professor);
        await _context.SaveChangesAsync();

        // 6. Envia o e-mail com a senha em TEXTO PURO (para o prof saber qual é)
        string mensagem = $@"
            <div style='font-family: sans-serif;'>
                <h2>Bem-vindo ao EduConnect, Prof. {professor.Nome}</h2>
                <p>Seu acesso ao portal foi criado com sucesso!</p>
                <p><strong>RP (Login):</strong> {rpGerado}</p>
                <p><strong>Senha Temporária:</strong> {senhaInicial}</p>
                <br>
                <p><i>Recomendamos alterar sua senha no primeiro acesso.</i></p>
            </div>";

        await _emailService.EnviarEmailAsync(professor.Email, "Seu Acesso ao EduConnect", mensagem);
    }

    // Método de Atualização
    public async Task AtualizarProfessor(Guid id, ProfessorUpdateDto dto)
    {
        var prof = await _context.Professores.FindAsync(id);
        if (prof == null) throw new Exception("Professor não encontrado.");

        prof.Nome = dto.Nome;
        prof.Email = dto.Email;
        prof.Disciplina = dto.Disciplina;

        await _context.SaveChangesAsync();
    }

    // Método de Desativação
    public async Task DesativarProfessor(Guid id)
    {
        var prof = await _context.Professores.FindAsync(id);
        if (prof != null)
        {
            prof.Ativo = false;
            await _context.SaveChangesAsync();
        }
    }

    // =========================================================================
    // --- PORTAL DO PROFESSOR (Lançamento de Notas e Chamada) ---
    // =========================================================================

    // 1. O Professor quer ver quem são os alunos da turma dele
    public async Task<List<Aluno>> ObterAlunosDaTurmaAsync(Guid professorId, Guid turmaId)
    {
        // Verifica se o professor dá aula nessa turma
        var turma = await _context.Turmas
            .Include(t => t.Professores)
            .Include(t => t.Alunos) // Já traz os alunos juntos
            .FirstOrDefaultAsync(t => t.Id == turmaId);

        if (turma == null)
            throw new Exception("Turma não encontrada.");

        if (!turma.Professores.Any(p => p.Id == professorId))
            throw new Exception("Acesso Negado: Você não leciona nesta turma.");

        return turma.Alunos.ToList();
    }

    // 2. O Professor lança a nota
    public async Task LancarNotaAsync(Guid professorId, LancamentoNotaDto dto)
    {
        var professor = await _context.Professores.FindAsync(professorId);
        if (professor == null) throw new Exception("Professor não encontrado.");

        // Validação de Segurança: O aluno pertence a esta turma? O professor dá aula nela?
        await ValidarVinculoProfessorAlunoAsync(professorId, dto.TurmaId, dto.AlunoId);

        // Verifica se já existe nota para este aluno, nesta disciplina e bimestre
        var notaExistente = await _context.Notas
            .FirstOrDefaultAsync(n => n.AlunoId == dto.AlunoId
                                   && n.ProfessorId == professorId
                                   && n.Bimestre == dto.Bimestre);

        if (notaExistente != null)
        {
            // Se já existe, apenas atualiza o valor
            notaExistente.Valor = dto.Valor;
            notaExistente.DataLancamento = DateTime.Now;
        }
        else
        {
            // Se não existe, cria uma nova
            var novaNota = new Nota
            {
                Valor = dto.Valor,
                Bimestre = dto.Bimestre,
                AlunoId = dto.AlunoId,
                ProfessorId = professorId,
                Disciplina = professor.Disciplina // Copia a disciplina do professor
            };
            _context.Notas.Add(novaNota);
        }

        await _context.SaveChangesAsync();
    }

    // 3. O Professor faz a chamada
    public async Task LancarFrequenciaAsync(Guid professorId, LancamentoFrequenciaDto dto)
    {
        var professor = await _context.Professores.FindAsync(professorId);
        if (professor == null) throw new Exception("Professor não encontrado.");

        await ValidarVinculoProfessorAlunoAsync(professorId, dto.TurmaId, dto.AlunoId);

        // Garante que só fique a data (sem a hora) para evitar duplicações no mesmo dia
        var dataAula = dto.DataAula.Date;

        var frequenciaExistente = await _context.Frequencias
            .FirstOrDefaultAsync(f => f.AlunoId == dto.AlunoId
                                   && f.ProfessorId == professorId
                                   && f.DataAula == dataAula);

        if (frequenciaExistente != null)
        {
            frequenciaExistente.Presente = dto.Presente;
        }
        else
        {
            var novaFrequencia = new Frequencia
            {
                Presente = dto.Presente,
                DataAula = dataAula,
                AlunoId = dto.AlunoId,
                ProfessorId = professorId,
                Disciplina = professor.Disciplina
            };
            _context.Frequencias.Add(novaFrequencia);
        }

        await _context.SaveChangesAsync();
    }

    // --- MÉTODO PRIVADO DE APOIO (Reaproveitamento de código) ---
    private async Task ValidarVinculoProfessorAlunoAsync(Guid professorId, Guid turmaId, Guid alunoId)
    {
        var turma = await _context.Turmas
            .Include(t => t.Professores)
            .Include(t => t.Alunos)
            .FirstOrDefaultAsync(t => t.Id == turmaId);

        if (turma == null)
            throw new Exception("Turma não encontrada.");

        if (!turma.Professores.Any(p => p.Id == professorId))
            throw new Exception("Acesso Negado: Você não leciona nesta turma.");

        if (!turma.Alunos.Any(a => a.Id == alunoId))
            throw new Exception("O aluno informado não pertence a esta turma.");
    }
}