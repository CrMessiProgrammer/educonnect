using System.ComponentModel.DataAnnotations;
using EduConnect.Domain.Enums;

namespace EduConnect.Domain.Entities;

public class Turma
{
    public Guid Id { get; set; }

    [Required]
    public string Nome { get; set; } = string.Empty; // Ex: "1º Ano A"

    [Required]
    public int AnoLetivo { get; set; } // Ex: 2026

    public TurnoEscolar Turno { get; set; } // Ex: "Matutino"

    public bool Ativa { get; set; } = true;

    // Relacionamentos
    public ICollection<Aluno> Alunos { get; set; } = new List<Aluno>();
    public ICollection<Professor> Professores { get; set; } = new List<Professor>();
}