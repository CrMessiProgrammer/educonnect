namespace EduConnect.Domain.Entities;

public class Transacao
{
    public Guid Id { get; set; } = Guid.NewGuid();

    // Quem está pagando?
    public Guid ResponsavelId { get; set; }

    // O que ele está pagando?
    public string Tipo { get; set; } = string.Empty; // "Uniforme", "Matricula", "Mensalidade"
    public string Descricao { get; set; } = string.Empty; // Ex: "Camisa P - Aluno João"

    // O valor financeiro
    public decimal Valor { get; set; }

    // O ID original do Pedido do Uniforme ou da Matrícula
    // É nullable (Guid?) porque a transação pode não estar atrelada a uma tabela externa
    public Guid? ReferenciaId { get; set; }

    // Controle do PIX
    public string Status { get; set; } = "Pendente"; // "Pendente", "Pago", "Cancelado"
    public string CodigoPix { get; set; } = string.Empty;

    public DateTime DataCriacao { get; set; } = DateTime.UtcNow;
    public DateTime? DataPagamento { get; set; }
}