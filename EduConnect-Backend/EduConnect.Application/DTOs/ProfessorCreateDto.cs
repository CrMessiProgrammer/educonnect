using System.ComponentModel.DataAnnotations;

namespace EduConnect.Application.DTOs;

public class ProfessorCreateDto
{
    [Required(ErrorMessage = "O nome é obrigatório.")]
    [RegularExpression(@"^[A-Z][a-z]+( [A-Z][a-z]+)+$", ErrorMessage = "Nome deve ser composto e iniciar com maiúsculas.")]
    public string Nome { get; set; } = string.Empty;

    [Required]
    [EmailAddress(ErrorMessage = "E-mail inválido. Ex: usuario@dominio.com")]
    public string Email { get; set; } = string.Empty;

    [Required]
    [RegularExpression(@"^\d{11}$", ErrorMessage = "CPF deve ter exatamente 11 números, sem pontos ou traços.")]
    public string CPF { get; set; } = string.Empty;

    [Required]
    public string Disciplina { get; set; } = string.Empty;
}