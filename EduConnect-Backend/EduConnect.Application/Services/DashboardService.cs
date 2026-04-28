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

    // DASHBOARD DO ADMINISTRADOR
    public async Task<DashboardAdminDto> ObterDadosDashboardAsync()
	{
		var dashboard = new DashboardAdminDto();

        // 1. CONTAGENS SIMPLES (CARDS)
        dashboard.TotalAlunos = await _context.Alunos.CountAsync();
        dashboard.TotalProfessores = await _context.Professores.CountAsync();

        // O pulo do gato: acessando o Enum que está dentro da classe Aluno
        dashboard.MatriculasPendentes = await _context.Alunos
            .CountAsync(a => a.Status == Aluno.EnrollmentStatus.Pendente);

        // 2. LÓGICA DE ALUNOS EM RISCO (SIMPLIFICADA PARA A DASHBOARD)
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

        // 3. FINANCEIRO REAL (Tabela Transacao)
        var mesAtual = DateTime.UtcNow.Month;
        var anoAtual = DateTime.UtcNow.Year;

        dashboard.ReceitaMensal = await _context.Transacoes
            .Where(t => t.Status == "Pago" && t.DataPagamento.HasValue
                     && t.DataPagamento.Value.Month == mesAtual
                     && t.DataPagamento.Value.Year == anoAtual)
            .SumAsync(t => t.Valor);

        dashboard.MensalidadesEmAberto = await _context.Transacoes
            .CountAsync(t => t.Status == "Pendente"); // Pega tudo que não foi pago ainda

        // 4. COMUNICADOS REAIS
        var dataHoje = DateTime.UtcNow.Date;
        dashboard.ComunicadosHoje = await _context.Comunicados
            .CountAsync(c => c.DataPublicacao.Date == dataHoje);

        // 5. GRÁFICO DE EVOLUÇÃO (Últimos 6 meses)
        var dataCorte = DateTime.UtcNow.AddMonths(-5).Date;
        var transacoesSemestre = await _context.Transacoes
            .Where(t => t.Status == "Pago" && t.DataPagamento >= dataCorte)
            .ToListAsync(); // Traze para a memória para agrupar com segurança

        var mesesNomes = new[] { "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez" };

        for (int i = 5; i >= 0; i--)
        {
            var mesAlvo = DateTime.UtcNow.AddMonths(-i);
            var valorMes = transacoesSemestre
                .Where(t => t.DataPagamento.Value.Month == mesAlvo.Month && t.DataPagamento.Value.Year == mesAlvo.Year)
                .Sum(t => t.Valor);

            dashboard.EvolucaoReceita.Add(new ReceitaGraficoDto
            {
                Mes = mesesNomes[mesAlvo.Month - 1],
                Receita = valorMes
            });
        }

        return dashboard;
	}

    public async Task<List<RelatorioDesempenhoDto>> ObterRelatorioDesempenhoGeralAsync()
    {
        // Executa o SQL puro e mapea pro DTO
        var relatorio = await _context.Database
            .SqlQueryRaw<RelatorioDesempenhoDto>("EXEC sp_RelatorioDesempenhoGeral")
            .ToListAsync();

        // Arredondando a média para 2 casas decimais no C#
        foreach (var item in relatorio)
        {
            item.MediaGeral = Math.Round(item.MediaGeral, 2);
        }

        return relatorio;
    }

    // DASHBOARD DO PROFESSOR
    public async Task<DashboardProfessorDto> ObterDadosProfessorAsync(Guid professorId)
    {
        var professor = await _context.Professores
            .Include(p => p.Turmas)
            .ThenInclude(t => t.Alunos)
        .FirstOrDefaultAsync(p => p.Id == professorId);

        if (professor == null) throw new Exception("Professor não encontrado");

        var dashboard = new DashboardProfessorDto
        {
            TotalTurmas = professor.Turmas.Count,
            AlunosImpactados = professor.Turmas.SelectMany(t => t.Alunos).Distinct().Count(),
            AvaliacoesPendentes = 0
        };

        // Lógica para o Gráfico: Média de cada turma na disciplina deste professor
        foreach (var turma in professor.Turmas)
        {
            // Pega as notas dos alunos desta turma lançadas por este professor
            var notasTurma = await _context.Notas
                .Where(n => n.ProfessorId == professorId &&
                            turma.Alunos.Select(a => a.Id).Contains(n.AlunoId))
                .ToListAsync();

            decimal media = notasTurma.Any() ? notasTurma.Average(n => n.ValorNota) : 0;

            dashboard.MediaPorTurma.Add(new TurmaMediaDto
            {
                Nome = turma.Nome,
                Media = Math.Round(media, 1)
            });
        }

        return dashboard;
    }

    // DASHBOARD DO ALUNO
    public async Task<DashboardAlunoDto> ObterDadosAlunoAsync(Guid alunoId)
    {
        var dashboard = new DashboardAlunoDto();

        // Puxa as notas reais do aluno
        var notas = await _context.Notas.Where(n => n.AlunoId == alunoId).ToListAsync();
        dashboard.MediaGeral = notas.Any() ? Math.Round(notas.Average(n => n.ValorNota), 2) : 0;

        // Puxa apenas as faltas reais (onde Presente == false)
        dashboard.FaltasAcumuladas = await _context.Frequencias
            .CountAsync(f => f.AlunoId == alunoId && !f.Presente);

        // Pega as 5 últimas notas lançadas
        dashboard.UltimasNotas = notas
            .OrderByDescending(n => n.DataLancamento) // Se não tiver DataLancamento, pode tirar o OrderBy
            .Take(5)
            .Select(n => new NotaResumoDto
            {
                Disciplina = n.Disciplina,
                Bimestre = n.Bimestre.ToString(),
                Valor = n.ValorNota
            }).ToList();

        return dashboard;
    }
}