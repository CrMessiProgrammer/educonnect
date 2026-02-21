using System.ComponentModel.DataAnnotations;
using EduConnect.Domain.Enums;

namespace EduConnect.Application.DTOs;

public class LancamentoNotaDto
{
    [Required]
    public Guid AlunoId { get; set; }

    [Required]
    public Guid TurmaId { get; set; }

    [Required]
    [Range(0, 10, ErrorMessage = "A nota deve ser entre 0 e 10.")]
    public decimal Valor { get; set; }

    [Required]
    public Bimestre Bimestre { get; set; }
}

public class LancamentoFrequenciaDto
{
    [Required]
    public Guid AlunoId { get; set; }

    [Required]
    public Guid TurmaId { get; set; }

    [Required]
    public bool Presente { get; set; }

    [Required]
    public DateTime DataAula { get; set; }
}