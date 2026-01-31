using EduConnect.Domain.Entities;
using EduConnect.Infrastructure.Context;
using Microsoft.EntityFrameworkCore;

namespace EduConnect.Application.Services;

public class AlunoService
{
    private readonly EduConnectDbContext _context;

    public AlunoService(EduConnectDbContext context)
    {
        _context = context;
    }

    public async Task<List<Aluno>> GetAllAsync() => await _context.Alunos.Include(a => a.Responsavel).ToListAsync();

    public async Task<Aluno?> GetByIdAsync(Guid id) => await _context.Alunos.Include(a => a.Responsavel).FirstOrDefaultAsync(a => a.Id == id);

    public async Task CreateAsync(Aluno aluno)
    {
        _context.Alunos.Add(aluno);
        await _context.SaveChangesAsync();
    }
}