namespace EduConnect.Application.DTOs;

public class DashboardAdminDto
{
    // Cards de Resumo
    public int TotalAlunos { get; set; }
    public int TotalProfessores { get; set; }
    public int MatriculasPendentes { get; set; }

    // Alerta Acadêmico
    public List<AlunoRiscoDto> AlunosEmRisco { get; set; } = new();
}

public class AlunoRiscoDto
{
    public string Nome { get; set; } = string.Empty;
    public string Turma { get; set; } = string.Empty;
    public string Motivo { get; set; } = string.Empty; // "Baixa Frequência", "Nota Baixa" ou "Ambos"
}