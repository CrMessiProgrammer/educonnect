using System.ComponentModel.DataAnnotations;

namespace EduConnect.Application.DTOs;

public class CriarEventoCalendarioDto
{
    [Required]
    public string Titulo { get; set; } = string.Empty;

    public string Descricao { get; set; } = string.Empty;

    [Required]
    public DateTime DataInicio { get; set; }

    [Required]
    public DateTime DataFim { get; set; }

    [Required]
    public string TipoEvento { get; set; } = "Evento Escolar";
}