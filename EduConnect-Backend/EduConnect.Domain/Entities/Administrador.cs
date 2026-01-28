namespace EduConnect.Domain.Entities;

public class Administrador : User
{
    public string Cargo { get; set; } = "Diretoria"; // Ex: Diretor, Coordenador, TI
}