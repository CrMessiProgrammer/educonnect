using EduConnect.Infrastructure.Context;
using EduConnect.Application.DTOs;
using Microsoft.EntityFrameworkCore;

namespace EduConnect.Application.Services;

public class ResponsavelService
{
    private readonly EduConnectDbContext _context;

    public ResponsavelService(EduConnectDbContext context) => _context = context;

    public async Task<List<FilhoResumoDto>> ObterMeusFilhosAsync(Guid responsavelId)
    {
        // Vai direto na tabela e filtra apenas os alunos que têm esse responsável (pai/mãe)
        var filhos = await _context.Alunos
            .Include(a => a.Turma)
            .Where(a => a.ResponsavelId == responsavelId)
            .Select(a => new FilhoResumoDto
            {
                Id = a.Id,
                Nome = a.Nome,
                RA = a.RA ?? "Pendente",
                TurmaNome = a.Turma != null ? a.Turma.Nome : "Sem Turma"
            })
            .ToListAsync();

        return filhos;
    }
}