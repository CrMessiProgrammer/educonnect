namespace EduConnect.Application.DTOs;

public class AtualizarStatusVisitaDto
{
    // Os status permitidos serão: "Pendente", "Confirmada", "Cancelada", "Realizada"
    public string Status { get; set; } = string.Empty;
}