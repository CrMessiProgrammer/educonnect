namespace EduConnect.Domain.Entities;

public class Professor : User
{
    public string Email { get; set; } = string.Empty;
    public string Disciplina { get; set; } = string.Empty; // Ex: "Matemática/Física"
    public string RP { get; set; } = string.Empty; // Registro do Professor

    // Relacionamento N:N com Turmas
    public virtual ICollection<Turma> Turmas { get; set; } = new List<Turma>();
}