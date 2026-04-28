using System.ComponentModel.DataAnnotations;

namespace EduConnect.Application.DTOs;

public class SolicitarUniformeDto
{
    [Required]
    public Guid AlunoId { get; set; }

    [Required]
    [RegularExpression(@"^(P|M|G|10|12|14)$", ErrorMessage = "Tamanho inválido. Opções: P, M, G, 10, 12 ou 14.")]
    public string Tamanho { get; set; } = string.Empty;

    [Required]
    [RegularExpression(@"^(Camisa|Bermuda|Calça|Agasalho)$", ErrorMessage = "Peça inválida. Opções: Camisa, Bermuda, Calça ou Agasalho.")]
    public string Peca { get; set; } = string.Empty;

    [Required]
    [RegularExpression(@"^(Retirada na Escola|Entrega em Domicílio)$", ErrorMessage = "Tipo de entrega inválido. Opções: Retirada na Escola ou Entrega em Domicílio.")]
    public string TipoEntrega { get; set; } = string.Empty;

    public string? EnderecoEntrega { get; set; }
}