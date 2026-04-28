namespace EduConnect.Domain.Entities;

public class Comunicado
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string Titulo { get; set; } = string.Empty;
    public string Mensagem { get; set; } = string.Empty;

    // Quem publicou? (Será o ID do Admin ou Professor)
    public Guid AutorId { get; set; }

    // Para quem é? Pode ser "Todos", "Responsaveis", "Professores", "Alunos"
    public string PublicoAlvo { get; set; } = "Todos";

    // Se for um aviso específico de uma Turma, uso este campo
    public Guid? TurmaId { get; set; }
    public Turma? Turma { get; set; }

    public DateTime DataPublicacao { get; set; } = DateTime.UtcNow;
}