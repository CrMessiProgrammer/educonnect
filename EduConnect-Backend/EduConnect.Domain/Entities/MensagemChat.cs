namespace EduConnect.Domain.Entities;

public class MensagemChat
{
    public Guid Id { get; set; } = Guid.NewGuid();

    // Quem enviou (Pode ser ID de Admin, Prof, Responsavel ou Aluno)
    public Guid RemetenteId { get; set; }

    // Quem recebe
    public Guid DestinatarioId { get; set; }

    public string Conteudo { get; set; } = string.Empty;
    public DateTime DataEnvio { get; set; } = DateTime.UtcNow;

    // Para no futuro fazermos o "check" azul do WhatsApp
    public bool Lida { get; set; } = false;
}