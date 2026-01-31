namespace EduConnect.Domain.Entities;

public class Administrador : User
{
    public string Cargo { get; set; } = "Coordenador"; // Ex: Diretor, Coordenador, TI
    public string Email { get; set; } = string.Empty;
}