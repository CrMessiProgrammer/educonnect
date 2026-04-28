using System.ComponentModel.DataAnnotations;

namespace EduConnect.Application.DTOs;

public class CriarComunicadoDto
{
    [Required(ErrorMessage = "O título é obrigatório.")]
    public string Titulo { get; set; } = string.Empty;

    [Required(ErrorMessage = "A mensagem é obrigatória.")]
    public string Mensagem { get; set; } = string.Empty;

    // Pode ser: "Todos", "Responsaveis", "Alunos"
    public string PublicoAlvo { get; set; } = "Todos";

    // Opcional: Se preenchido, o aviso é só para esta turma
    public Guid? TurmaId { get; set; }
}