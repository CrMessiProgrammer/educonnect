namespace EduConnect.Domain.Entities;

public class EventoCalendario
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string Titulo { get; set; } = string.Empty;
    public string Descricao { get; set; } = string.Empty;

    public DateTime DataInicio { get; set; }
    public DateTime DataFim { get; set; }

    // "Feriado", "Prova", "Reuniao de Pais", "Evento Cultural"
    public string TipoEvento { get; set; } = "Evento Cultural";

    public DateTime DataCriacao { get; set; } = DateTime.UtcNow;
}