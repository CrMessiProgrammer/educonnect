namespace EduConnect.Domain.Entities;

public class Professor : User
{
    public string Formacao { get; set; } = string.Empty; // Ex: "Licenciatura em Matemática"
    public string Especialidade { get; set; } = string.Empty; // Ex: "Matemática/Física"

    // Lista de matérias ou turmas que ele leciona (implementar mais tarde)
}