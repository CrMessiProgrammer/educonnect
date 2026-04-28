using EduConnect.Domain.Entities;
using EduConnect.Infrastructure.Context;
using EduConnect.Application.DTOs;
using Microsoft.EntityFrameworkCore;

namespace EduConnect.Application.Services;

public class AlunoService
{
    private readonly EduConnectDbContext _context;

    public AlunoService(EduConnectDbContext context)
    {
        _context = context;
    }

    public async Task<List<AlunoResponseDto>> GetAllAsync(string? termoBusca = null)
    {
        var query = _context.Alunos
            .Include(a => a.Responsavel)
            .Include(a => a.Turma)
            .AsQueryable(); // Prepara para receber filtros dinâmicos

        // Se o usuário digitou algo, filtra por Nome OU RA OU CPF do Responsável
        if (!string.IsNullOrWhiteSpace(termoBusca))
        {
            string termo = termoBusca;

            // Usa o ! no termoBusca para garantir ao compilador que ele não é nulo
            query = query.Where(a =>
                a.Nome!.Contains(termo) || // O ! aqui diz: "Nome não é nulo"
                a.RA!.Contains(termo) ||
                (a.Responsavel != null && a.Responsavel!.CPF!.Contains(termo)));
        }

        return await query
            .Select(a => new AlunoResponseDto(
                a.Id,
                a.Nome!,
                a.RA!,
                a.Status!.ToString(),
                a.TurmaId,
                a.Turma != null ? a.Turma.Nome! : "Sem Turma",
                a.Responsavel != null ? a.Responsavel.Nome! : "Sem Responsável"
            ))
            .ToListAsync();
    }

    public async Task<Aluno?> GetByIdAsync(Guid id) =>
        await _context.Alunos.Include(a => a.Responsavel).FirstOrDefaultAsync(a => a.Id == id);

    // Método para atualizar dados básicos (usado no PUT)
    public async Task UpdateAsync(Guid id, AlunoUpdateDto dto)
    {
        var aluno = await _context.Alunos.FindAsync(id);
        if (aluno == null) throw new Exception("Aluno não encontrado.");

        aluno.Nome = dto.Nome;
        aluno.TurmaId = dto.TurmaId;

        await _context.SaveChangesAsync();
    }

    // Soft Delete: Apenas desativa o aluno, não apaga o histórico
    public async Task DeactivateAsync(Guid id)
    {
        var aluno = await _context.Alunos.FindAsync(id);
        if (aluno != null)
        {
            aluno.Ativo = false;
            await _context.SaveChangesAsync();
        }
    }
}