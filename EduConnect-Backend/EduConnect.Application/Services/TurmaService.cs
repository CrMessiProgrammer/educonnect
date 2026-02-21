using EduConnect.Domain.Entities;
using EduConnect.Infrastructure.Context;
using EduConnect.Application.DTOs;
using EduConnect.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace EduConnect.Application.Services;

public class TurmaService
{
    private readonly EduConnectDbContext _context;

    public TurmaService(EduConnectDbContext context) => _context = context;

    // Retorna DTO para evitar Loop Infinito (Erro 500)
    public async Task<List<TurmaResponseDto>> ListarTodas()
    {
        return await _context.Turmas
            .Include(t => t.Alunos)
            .Select(t => new TurmaResponseDto(
                t.Id,                         // 1. Guid
                t.Nome,                       // 2. string
                t.Turno.ToString(),           // 3. Convertendo Enum para string (sem o "=")
                t.AnoLetivo,                  // 4. int
                t.Alunos.Count                // 5. int
            ))
            .ToListAsync();
    }

    public async Task<object> ListarDisponiveis()
    {
        return await _context.Turmas
            .Where(t => t.Ativa)
            .Select(t => new { t.Id, t.Nome, t.Turno })
            .ToListAsync();
    }

    // Retorna AlunoResponseDto (Segurança e Integridade)
    public async Task<List<AlunoResponseDto>> ListarAlunosDaTurma(Guid turmaId)
    {
        return await _context.Alunos
            .Where(a => a.TurmaId == turmaId)
            .Include(a => a.Responsavel)
            .Include(a => a.Turma)
            .Select(a => new AlunoResponseDto(
                a.Id,
                a.Nome,
                a.RA,
                a.Status.ToString(),
                a.Turma != null ? a.Turma.Nome : "Sem Turma",
                a.Responsavel.Nome
            ))
            .ToListAsync();
    }

    public async Task Criar(TurmaCreateDto dto)
    {
        var turma = new Turma
        {
            Nome = dto.Nome,
            AnoLetivo = dto.AnoLetivo,
            Turno = dto.Turno
        };

        _context.Turmas.Add(turma);
        await _context.SaveChangesAsync();
    }

    public async Task VincularProfessor(Guid turmaId, Guid professorId)
    {
        var turma = await _context.Turmas.Include(t => t.Professores).FirstOrDefaultAsync(t => t.Id == turmaId);
        var professor = await _context.Professores.FindAsync(professorId);

        if (turma == null || professor == null) throw new Exception("Turma ou Professor não encontrado.");

        if (!turma.Professores.Any(p => p.Id == professorId))
        {
            turma.Professores.Add(professor);
            await _context.SaveChangesAsync();
        }
    }
}