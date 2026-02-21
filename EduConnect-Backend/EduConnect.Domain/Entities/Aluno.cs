using System.ComponentModel.DataAnnotations;

namespace EduConnect.Domain.Entities;

public class Aluno : User
{
    public string Matricula { get; set; } = string.Empty;

    [DataType(DataType.Date)]
    [DisplayFormat(DataFormatString = "{0:dd/MM/yyyy}", ApplyFormatInEditMode = true)]
    public DateTime DataNascimento { get; set; }

    public string? HistoricoEscolarPath { get; set; }
    public string? RA { get; set; }
    public EnrollmentStatus Status { get; set; } = EnrollmentStatus.Pendente;

    public enum EnrollmentStatus { Pendente, Aprovado, Rejeitado }

    // Relacionamento com Turma
    public Guid? TurmaId { get; set; } // Chave Estrangeira
    public Turma? Turma { get; set; }   // Propriedade de Navegação

    // Relacionamento com o Responsável
    public Guid ResponsavelId { get; set; }
    public Responsavel Responsavel { get; set; } = null!;
}