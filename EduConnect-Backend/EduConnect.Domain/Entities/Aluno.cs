using System.ComponentModel.DataAnnotations;

namespace EduConnect.Domain.Entities;

public class Aluno : User
{
    public string Matricula { get; set; } = string.Empty;

    [DataType(DataType.Date)]
    [DisplayFormat(DataFormatString = "{0:dd/MM/yyyy}", ApplyFormatInEditMode = true)]
    public DateTime DataNascimento { get; set; }

    public TurmaEscolar Turma { get; set; }
    public string? HistoricoEscolarPath { get; set; }
    public string? RA { get; set; } // Registro do Aluno
    public EnrollmentStatus Status { get; set; } = EnrollmentStatus.Pendente;

    public enum EnrollmentStatus { Pendente, Aprovado, Rejeitado }

    // LISTA DE TURMAS (O Swagger vai mostrar essas opções)
    public enum TurmaEscolar
    {
        [Display(Name = "1º Ano")] PrimeiroAno,
        [Display(Name = "2º Ano")] SegundoAno,
        [Display(Name = "3º Ano")] TerceiroAno,
        [Display(Name = "4º Ano")] QuartoAno,
        [Display(Name = "5º Ano")] QuintoAno,
        [Display(Name = "6º Ano")] SextoAno,
        [Display(Name = "7º Ano")] SetimoAno,
        [Display(Name = "8º Ano")] OitavoAno,
        [Display(Name = "9º Ano")] NonoAno,
        [Display(Name = "1ª Série")] PrimeiraSerie,
        [Display(Name = "2ª Série")] SegundaSerie,
        [Display(Name = "3ª Série")] TerceiraSerie
    }

    // Relacionamento com o Responsável
    public Guid ResponsavelId { get; set; }
    public Responsavel Responsavel { get; set; } = null!;
}