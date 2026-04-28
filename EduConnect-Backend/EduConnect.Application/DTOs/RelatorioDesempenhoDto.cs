namespace EduConnect.Application.DTOs;

public class RelatorioDesempenhoDto
{
    public Guid AlunoId { get; set; }
    public string AlunoNome { get; set; } = string.Empty;
    public decimal MediaGeral { get; set; }
    public int TotalFaltas { get; set; }
}