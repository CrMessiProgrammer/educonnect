namespace EduConnect.Application.DTOs;

public class DashboardAlunoDto
{
    public decimal MediaGeral { get; set; }
    public int FaltasAcumuladas { get; set; }
    public List<NotaResumoDto> UltimasNotas { get; set; } = new();
}

public class NotaResumoDto
{
    public string Disciplina { get; set; } = string.Empty;
    public string Bimestre { get; set; } = string.Empty;
    public decimal Valor { get; set; }
}