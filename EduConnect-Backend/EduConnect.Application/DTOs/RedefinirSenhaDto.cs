using System.ComponentModel.DataAnnotations;

namespace EduConnect.Application.DTOs;

public class RedefinirSenhaDto
{
    // Será o E-mail para Professor/Pais, e o RA para Alunos
    public string Identificacao { get; set; } = string.Empty;
    public string Codigo { get; set; } = string.Empty;

    [Required]
    [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$",
    ErrorMessage = "A senha deve ter no mínimo 8 caracteres, incluir letras maiúsculas, minúsculas, números e um caractere especial (@$!%*?&).")]
    public required string NovaSenha { get; set; } = string.Empty;
}