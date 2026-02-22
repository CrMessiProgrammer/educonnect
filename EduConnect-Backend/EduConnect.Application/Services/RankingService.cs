using EduConnect.Infrastructure.Context;
using EduConnect.Application.DTOs;
using Microsoft.EntityFrameworkCore;

namespace EduConnect.Application.Services;

public class RankingService
{
    private readonly EduConnectDbContext _context;

    public RankingService(EduConnectDbContext context) => _context = context;

    public async Task<RankingTurmaDto> ObterRankingAsync(Guid turmaId, bool visaoRestrita)
    {
        var turma = await _context.Turmas
            .Include(t => t.Alunos)
            .FirstOrDefaultAsync(t => t.Id == turmaId);

        if (turma == null) throw new Exception("Turma não encontrada.");

        var ranking = new RankingTurmaDto { TurmaNome = turma.Nome };
        var listaAlunos = new List<PosicaoRankingDto>();

        // Calcula a média geral de cada aluno daquela turma
        foreach (var aluno in turma.Alunos)
        {
            var notas = await _context.Notas.Where(n => n.AlunoId == aluno.Id).ToListAsync();

            // Se o aluno tiver notas, calcula a média, se não, é 0
            decimal mediaGeral = notas.Any() ? notas.Average(n => n.ValorNota) : 0;

            listaAlunos.Add(new PosicaoRankingDto
            {
                AlunoNome = aluno.Nome,
                MediaGeral = Math.Round(mediaGeral, 2) // Arredonda para 2 casas decimais
            });
        }

        // Ordena da maior nota para a menor
        var alunosOrdenados = listaAlunos.OrderByDescending(a => a.MediaGeral).ToList();

        // Atribui a posição (1º, 2º, 3º...)
        for (int i = 0; i < alunosOrdenados.Count; i++)
        {
            alunosOrdenados[i].Posicao = i + 1;
        }

        // Se for Aluno/Responsável (visaoRestrita = true), pega só os 5 primeiros
        if (visaoRestrita)
        {
            ranking.Alunos = alunosOrdenados.Take(5).ToList();
        }
        else
        {
            ranking.Alunos = alunosOrdenados; // Admin e Professor veem todos
        }

        return ranking;
    }
}