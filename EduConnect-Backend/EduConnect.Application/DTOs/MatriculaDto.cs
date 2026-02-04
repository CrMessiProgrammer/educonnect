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
    [RegularExpression(@"^\d{11,15}$", ErrorMessage = "CPF deve conter apenas números (11-15 dígitos).")]
    public string AlunoCPF { get; set; } = string.Empty;

    [Required]
    public DateTime AlunoDataNascimento { get; set; }

    [Required]
    public Aluno.TurmaEscolar AlunoTurma { get; set; }

    [Required]
    public IFormFile ArquivoHistorico { get; set; } // O arquivo PDF

    // --- Dados do Responsável ---
    [Required]
    public string ResponsavelNome { get; set; } = string.Empty;

    [Required]
    [EmailAddress(ErrorMessage = "E-mail inválido.")]
    public string ResponsavelEmail { get; set; } = string.Empty;

    [Required]
    [RegularExpression(@"^\d{11,15}$", ErrorMessage = "CPF deve conter apenas números.")]
    public string ResponsavelCPF { get; set; } = string.Empty;

    [Required]
    [RegularExpression(@"^\d{11,15}$", ErrorMessage = "Telefone deve conter apenas números.")]
    public string ResponsavelTelefone { get; set; } = string.Empty;
}