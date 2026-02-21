using Microsoft.AspNetCore.Http;
using EduConnect.Domain.Entities;
using System.ComponentModel.DataAnnotations;

namespace EduConnect.Application.DTOs;

public class MatriculaDto
{
    // --- Dados do Aluno ---
    [Required(ErrorMessage = "O nome do aluno é obrigatório.")]
    [RegularExpression(@"^[A-Z][a-z]+( [A-Z][a-z]+)+$", ErrorMessage = "Nome deve ser composto e iniciar com maiúsculas.")]
    public string AlunoNome { get; set; } = string.Empty;

    [Required]
    [RegularExpression(@"^\d{11}$", ErrorMessage = "CPF deve ter exatamente 11 números, sem pontos ou traços.")]
    public string AlunoCPF { get; set; } = string.Empty;

    [Required]
    public DateTime AlunoDataNascimento { get; set; }

    [Required]
    public string SeriePretendida { get; set; } = string.Empty; // Ex: "1º Ano Fundamental", "3º Ano Médio"

    [Required(ErrorMessage = "O arquivo do histórico escolar é obrigatório.")]
    public IFormFile ArquivoHistorico { get; set; } = default!; // O arquivo PDF

    // --- Dados do Responsável ---
    [Required(ErrorMessage = "O nome do responsável é obrigatório.")]
    [RegularExpression(@"^[A-Z][a-z]+( [A-Z][a-z]+)+$", ErrorMessage = "Nome deve ser composto e iniciar com maiúsculas.")]
    public string ResponsavelNome { get; set; } = string.Empty;

    [Required]
    [EmailAddress(ErrorMessage = "E-mail inválido. Ex: usuario@dominio.com")]
    public string ResponsavelEmail { get; set; } = string.Empty;

    [Required]
    [RegularExpression(@"^\d{11}$", ErrorMessage = "CPF deve ter exatamente 11 números, sem pontos ou traços.")]
    public string ResponsavelCPF { get; set; } = string.Empty;

    [Required]
    [RegularExpression(@"^\d{10,11}$", ErrorMessage = "Telefone deve ter entre 10 e 11 números, apenas dígitos.")]
    public string ResponsavelTelefone { get; set; } = string.Empty;
}