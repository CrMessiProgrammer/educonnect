namespace EduConnect.Domain.Entities;

public class Visita
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string NomeVisitante { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Telefone { get; set; } = string.Empty;
    public DateTime DataHoraVisita { get; set; }

    // Status pode ser: "Pendente", "Confirmada", "Realizada" ou "Cancelada"
    public string Status { get; set; } = "Pendente";
    public DateTime DataSolicitacao { get; set; } = DateTime.UtcNow;
}