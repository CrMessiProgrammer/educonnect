using System.ComponentModel.DataAnnotations;

namespace EduConnect.Application.DTOs;

public class AgendarVisitaDto
{
    [Required(ErrorMessage = "O nome é obrigatório.")]
    [RegularExpression(@"^[A-Z][a-z]+( [A-Z][a-z]+)+$", ErrorMessage = "Nome deve ser composto e iniciar com maiúsculas.")]
    public string NomeVisitante { get; set; } = string.Empty;

    [Required(ErrorMessage = "O e-mail é obrigatório.")]
    [EmailAddress(ErrorMessage = "E-mail inválido. Ex: usuario@dominio.com")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "O telefone é obrigatório.")]
    [RegularExpression(@"^\d{10,11}$", ErrorMessage = "Telefone deve ter entre 10 e 11 números, apenas dígitos.")]
    public string Telefone { get; set; } = string.Empty;

    [Required(ErrorMessage = "A data e hora da visita são obrigatórias.")]
    public DateTime DataHoraVisita { get; set; }
}