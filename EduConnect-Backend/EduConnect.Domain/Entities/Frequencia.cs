namespace EduConnect.Domain.Entities;

public class Frequencia
{
    public Guid Id { get; set; } = Guid.NewGuid();

    // Indica se o aluno foi na aula ou faltou
    public bool Presente { get; set; }

    // Data exata da aula
    public DateTime DataAula { get; set; } = DateTime.Now;

    // A disciplina que o professor estava lecionando no dia
    public string Disciplina { get; set; } = string.Empty;

    // Relacionamentos
    public Guid AlunoId { get; set; }
    public Aluno Aluno { get; set; } = null!;

    public Guid ProfessorId { get; set; }
    public Professor Professor { get; set; } = null!;
}