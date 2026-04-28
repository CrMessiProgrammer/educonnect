using System.ComponentModel.DataAnnotations;

namespace EduConnect.Application.DTOs;

public class AtualizarStatusUniformeDto
{
    [Required]
    [RegularExpression(@"^(Pendente|Separado|Entregue)$", ErrorMessage = "Status inválido. Use: Pendente, Separado ou Entregue.")]
    public string Status { get; set; } = string.Empty;
}