using EduConnect.Domain.Enums;
using EduConnect.Domain.Entities;

namespace EduConnect.Domain.Entities;

public class Nota
{
    public Guid Id { get; set; } = Guid.NewGuid();

    // O valor da nota (ex: 8.5)
    public decimal Valor { get; set; }

    // Qual bimestre esta nota se refere
    public Bimestre Bimestre { get; set; }

    // Relacionamentos
    public Guid AlunoId { get; set; }
    public Aluno Aluno { get; set; } = null!;

    public Guid ProfessorId { get; set; }
    public Professor Professor { get; set; } = null!;

    // A disciplina é copiada do Professor no momento do lançamento para histórico
    public string Disciplina { get; set; } = string.Empty;

    public DateTime DataLancamento { get; set; } = DateTime.Now;
}