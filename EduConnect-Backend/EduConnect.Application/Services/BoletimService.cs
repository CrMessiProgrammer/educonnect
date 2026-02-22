using EduConnect.Domain.Entities;
using EduConnect.Infrastructure.Context;
using EduConnect.Application.DTOs;
using Microsoft.EntityFrameworkCore;
using EduConnect.Domain.Enums;

namespace EduConnect.Application.Services;

public class BoletimService
{
    private readonly EduConnectDbContext _context;

    public BoletimService(EduConnectDbContext context) => _context = context;

    public async Task<BoletimResponseDto> GerarBoletimAsync(Guid alunoId)
    {
        var aluno = await _context.Alunos
            .Include(a => a.Turma)
            .FirstOrDefaultAsync(a => a.Id == alunoId);

        if (aluno == null) throw new Exception("Aluno não encontrado.");

        var notas = await _context.Notas.Where(n => n.AlunoId == alunoId).ToListAsync();
        var frequencias = await _context.Frequencias.Where(f => f.AlunoId == alunoId).ToListAsync();

        // Agrupa por disciplina para montar as linhas do boletim
        var disciplinas = notas.Select(n => n.Disciplina).Distinct().ToList();

        var boletim = new BoletimResponseDto
        {
            AlunoNome = aluno.Nome,
            TurmaNome = aluno.Turma?.Nome ?? "Sem Turma",
            Disciplinas = new List<LinhaBoletimDto>()
        };

        foreach (var disc in disciplinas)
        {
            var notasDaDisc = notas.Where(n => n.Disciplina == disc).ToList();
            var freqDaDisc = frequencias.Where(f => f.Disciplina == disc).ToList();

            var linha = new LinhaBoletimDto
            {
                Disciplina = disc,
                Nota1B = notasDaDisc.FirstOrDefault(n => n.Bimestre == Bimestre.Primeiro)?.ValorNota,
                Nota2B = notasDaDisc.FirstOrDefault(n => n.Bimestre == Bimestre.Segundo)?.ValorNota,
                Nota3B = notasDaDisc.FirstOrDefault(n => n.Bimestre == Bimestre.Terceiro)?.ValorNota,
                Nota4B = notasDaDisc.FirstOrDefault(n => n.Bimestre == Bimestre.Quarto)?.ValorNota
            };

            // Cálculo da Média
            var somaNotas = (linha.Nota1B ?? 0) + (linha.Nota2B ?? 0) + (linha.Nota3B ?? 0) + (linha.Nota4B ?? 0);
            linha.MediaFinal = somaNotas / 4;

            // Cálculo de Presença por Disciplina
            if (freqDaDisc.Any())
            {
                var presencas = freqDaDisc.Count(f => f.Presente);
                linha.PercentualPresenca = (double)presencas / freqDaDisc.Count * 100;

                // Conta todos os registros onde 'Presente' é falso
                linha.TotalFaltas = freqDaDisc.Count(f => !f.Presente);
            }

            // Regra de Status (MEC: 75% presença e média 6.0)
            if (linha.PercentualPresenca < 75) linha.Status = "Reprovado por Falta";
            else if (linha.MediaFinal >= 6) linha.Status = "Aprovado";
            else linha.Status = "Recuperação";

            boletim.Disciplinas.Add(linha);
        }

        // Frequência Geral do Aluno
        if (frequencias.Any())
        {
            boletim.FrequenciaGeral = (double)frequencias.Count(f => f.Presente) / frequencias.Count * 100;
        }

        return boletim;
    }
}