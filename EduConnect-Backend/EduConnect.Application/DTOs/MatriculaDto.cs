using Microsoft.AspNetCore.Http; // Garante que o IFormFile seja reconhecido
using EduConnect.Domain.Entities;

namespace EduConnect.Application.DTOs;

public class MatriculaDto
{
    // Dados do Aluno
    public string AlunoNome { get; set; } = null!;
    public string AlunoCPF { get; set; } = null!;
    public DateTime AlunoDataNascimento { get; set; }
    public Aluno.TurmaEscolar AlunoTurma { get; set; } // Agora usa o Enum
    public IFormFile? ArquivoHistorico { get; set; }

    // Dados do Responsável
    public string ResponsavelNome { get; set; } = null!;
    public string ResponsavelEmail { get; set; } = null!;
    public string ResponsavelCPF { get; set; } = null!;
    public string ResponsavelTelefone { get; set; } = null!;
}