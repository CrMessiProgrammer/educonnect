using EduConnect.Domain.Enums;

namespace EduConnect.Application.DTOs;

public class TurmaCreateDto
{
    public string Nome { get; set; } = string.Empty;
    public int AnoLetivo { get; set; }
    public TurnoEscolar Turno { get; set; }
}