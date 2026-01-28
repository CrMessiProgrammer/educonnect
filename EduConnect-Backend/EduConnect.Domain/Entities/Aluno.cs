namespace EduConnect.Domain.Entities;

public class Aluno : User
{
    public string Matricula { get; set; } = string.Empty;
    public DateTime DataNascimento { get; set; }
    public string Turma { get; set; } = string.Empty; // Ex: "9º Ano A"

    // Relacionamento com o Responsável
    public Guid ResponsavelId { get; set; }
    public Responsavel Responsavel { get; set; } = null!;
}