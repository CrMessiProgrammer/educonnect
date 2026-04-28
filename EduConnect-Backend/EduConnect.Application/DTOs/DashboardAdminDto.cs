namespace EduConnect.Application.DTOs;

public class DashboardAdminDto
{
    // Cards de Resumo
    public int TotalAlunos { get; set; }
    public int TotalProfessores { get; set; }
    public int MatriculasPendentes { get; set; }

    public decimal ReceitaMensal { get; set; }
    public int MensalidadesEmAberto { get; set; }
    public int ComunicadosHoje { get; set; }
    public List<ReceitaGraficoDto> EvolucaoReceita { get; set; } = new();

    // Alerta Acadêmico
    public List<AlunoRiscoDto> AlunosEmRisco { get; set; } = new();
}

public class AlunoRiscoDto
{
    public string Nome { get; set; } = string.Empty;
    public string Turma { get; set; } = string.Empty;
    public string Motivo { get; set; } = string.Empty; // "Baixa Frequência", "Nota Baixa" ou "Ambos"
}

public class ReceitaGraficoDto
{
    public string Mes { get; set; } = string.Empty;
    public decimal Receita { get; set; }
}