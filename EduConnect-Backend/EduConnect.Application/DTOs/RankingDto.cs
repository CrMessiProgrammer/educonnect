namespace EduConnect.Application.DTOs;

public class RankingTurmaDto
{
    public string TurmaNome { get; set; } = string.Empty;
    public List<PosicaoRankingDto> Alunos { get; set; } = new();
}

public class PosicaoRankingDto
{
    public int Posicao { get; set; }
    public string AlunoNome { get; set; } = string.Empty;
    public decimal MediaGeral { get; set; }
}