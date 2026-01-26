using EduConnect.Domain.Enums;

namespace EduConnect.Domain.Entities;

public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Relacionamento para o Responsável (Pai/Mãe)
    // Se for um Aluno, ele pode ter um ResponsávelId
    public Guid? ParentId { get; set; }
    public User? Parent { get; set; }
}