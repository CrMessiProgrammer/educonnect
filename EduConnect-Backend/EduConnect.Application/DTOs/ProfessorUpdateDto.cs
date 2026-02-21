using System.ComponentModel.DataAnnotations;

namespace EduConnect.Application.DTOs;

public class ProfessorUpdateDto
{
    [Required]
    [RegularExpression(@"^[A-Z][a-z]+( [A-Z][a-z]+)+$", ErrorMessage = "Nome inválido.")]
    public string Nome { get; set; } = string.Empty;

    [Required]
    [EmailAddress(ErrorMessage = "E-mail inválido.")]
    public string Email { get; set; } = string.Empty;

    public string Disciplina { get; set; } = string.Empty;
}