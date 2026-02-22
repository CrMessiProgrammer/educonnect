using EduConnect.Infrastructure.Context;
using EduConnect.Application.DTOs;
using Microsoft.EntityFrameworkCore;
using EduConnect.Domain.Enums;
using EduConnect.Domain.Entities;

namespace EduConnect.Application.Services;

public class DashboardService
{
	private readonly EduConnectDbContext _context;

	public DashboardService(EduConnectDbContext context) => _context = context;

	public async Task<DashboardAdminDto> ObterDadosDashboardAsync()
	{
		var dashboard = new DashboardAdminDto();

        // 1. Contagens Simples (Cards)
        dashboard.TotalAlunos = await _context.Alunos.CountAsync();
        dashboard.TotalProfessores = await _context.Professores.CountAsync();

        // O pulo do gato: acessando o Enum que está dentro da classe Aluno
        dashboard.MatriculasPendentes = await _context.Alunos
            .CountAsync(a => a.Status == Aluno.EnrollmentStatus.Pendente);

        // 2. Lógica de Alunos em Risco (Simplificada para a Dashboard)
        // Aqui buscamos alunos que tenham notas < 6 ou faltas excessivas
        var alunos = await _context.Alunos
			.Include(a => a.Turma)
			.ToListAsync();

		foreach (var aluno in alunos)
		{
			var notas = await _context.Notas.Where(n => n.AlunoId == aluno.Id).ToListAsync();
			var frequencias = await _context.Frequencias.Where(f => f.AlunoId == aluno.Id).ToListAsync();

			bool temNotaBaixa = notas.Any() && (notas.Average(n => n.ValorNota) < 6);

			double freqTotal = 100;
			if (frequencias.Any())
			{
				freqTotal = (double)frequencias.Count(f => f.Presente) / frequencias.Count * 100;
			}

			if (temNotaBaixa || freqTotal < 75)
			{
				dashboard.AlunosEmRisco.Add(new AlunoRiscoDto
				{
					Nome = aluno.Nome,
					Turma = aluno.Turma?.Nome ?? "Sem Turma",
					Motivo = (temNotaBaixa && freqTotal < 75) ? "Notas e Frequência" :
							 temNotaBaixa ? "Média Baixa" : "Frequência Baixa"
				});
			}
		}

		return dashboard;
	}
}