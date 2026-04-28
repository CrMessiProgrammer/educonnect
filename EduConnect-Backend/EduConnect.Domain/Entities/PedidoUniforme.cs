namespace EduConnect.Domain.Entities;

public class PedidoUniforme
{
    public Guid Id { get; set; } = Guid.NewGuid();

    // O pedido está vinculado a um aluno específico
    public Guid AlunoId { get; set; }
    public Aluno? Aluno { get; set; }

    public string Tamanho { get; set; } = string.Empty; // Ex: P, M, G, 10, 12, 14
    public string Peca { get; set; } = string.Empty; // Ex: "Camiseta Padrão", "Agasalho"

    public string TipoEntrega { get; set; } = string.Empty; // "Retirar na Escola" ou "Entregar em Casa"
    public string? EnderecoEntrega { get; set; } // Pode ser nulo se ele for retirar na escola

    // "Pendente", "Separado", "Entregue"
    public string Status { get; set; } = "Pendente";
    public DateTime DataPedido { get; set; } = DateTime.UtcNow;

    public string StatusPagamento { get; set; } = "Aguardando Pagamento"; // Pode ser "Aguardando Pagamento" ou "Pago"
}