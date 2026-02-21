using System.ComponentModel.DataAnnotations;

namespace EduConnect.Application.DTOs;

public class LoginDto
{
    [Required(ErrorMessage = "O identificador (E-mail, RA ou RP) é obrigatório.")]
    public string Identificador { get; set; } = string.Empty;

    [Required(ErrorMessage = "A senha é obrigatória.")]
    public string Senha { get; set; } = string.Empty;
}