namespace EduConnect.Domain.Entities;

public class Responsavel : User
{
    public string Email { get; set; } = string.Empty;
    public string Telefone { get; set; } = string.Empty;

    // Um responsável pode ter vários alunos vinculados (irmãos na mesma escola)
    public List<Aluno> Alunos { get; set; } = new();
}