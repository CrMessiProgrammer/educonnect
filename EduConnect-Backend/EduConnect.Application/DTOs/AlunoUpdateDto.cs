using System.ComponentModel.DataAnnotations;

namespace EduConnect.Application.DTOs;

public class AlunoUpdateDto
{
    [Required(ErrorMessage = "O nome é obrigatório.")]
    [RegularExpression(@"^[A-Z][a-z]+( [A-Z][a-z]+)+$", ErrorMessage = "Nome inválido.")]
    public string Nome { get; set; } = string.Empty;

    public Guid? TurmaId { get; set; }
}