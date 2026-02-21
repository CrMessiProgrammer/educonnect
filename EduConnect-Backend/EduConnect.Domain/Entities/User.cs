namespace EduConnect.Domain.Entities;

public abstract class User // 'abstract' para ninguém criar um "User" puro, deve ser um tipo específico
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Nome { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string CPF { get; set; } = string.Empty; // Documento base para todos
    // Esta propriedade não vai para o banco, serve apenas para o seu Front-end/Swagger
    public string CPFFormatado => long.TryParse(CPF, out var nr)
        ? nr.ToString(@"000\.000\.000\-00")
        : CPF;

    public bool Ativo { get; set; } = true;
    public DateTime DataCriacao { get; set; } = DateTime.UtcNow;
}