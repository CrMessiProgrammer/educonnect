namespace EduConnect.Application.DTOs;

public class DashboardProfessorDto
{
    public int TotalTurmas { get; set; }
    public int AlunosImpactados { get; set; }
    public int AvaliacoesPendentes { get; set; }
    public List<TurmaMediaDto> MediaPorTurma { get; set; } = new();
}

public class TurmaMediaDto
{
    public string Nome { get; set; } = string.Empty;
    public decimal Media { get; set; }
}