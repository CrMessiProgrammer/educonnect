namespace EduConnect.Application.DTOs;

public class BoletimResponseDto
{
    public string AlunoNome { get; set; } = string.Empty;
    public string TurmaNome { get; set; } = string.Empty;
    public List<LinhaBoletimDto> Disciplinas { get; set; } = new();
    public double FrequenciaGeral { get; set; }
}

public class LinhaBoletimDto
{
    public string Disciplina { get; set; } = string.Empty;
    public decimal? Nota1B { get; set; }
    public decimal? Nota2B { get; set; }
    public decimal? Nota3B { get; set; }
    public decimal? Nota4B { get; set; }
    public decimal MediaFinal { get; set; }
    public double PercentualPresenca { get; set; }
    public int TotalFaltas { get; set; }
    public string Status { get; set; } = string.Empty; // Aprovado, Recuperação, etc.
}