namespace EduConnect.Domain.Entities;

public class Responsavel : User
{
    public string Telefone { get; set; } = string.Empty;
    public string Parentesco { get; set; } = string.Empty; // Ex: Pai, Mãe, Tutor

    // Um responsável pode ter vários alunos vinculados (irmãos na mesma escola)
    public List<Aluno> Alunos { get; set; } = new();
}