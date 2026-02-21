namespace EduConnect.Domain.Entities;

public class Responsavel : User
{
    public string Email { get; set; } = string.Empty;
    public string Telefone { get; set; } = string.Empty;
    public string TelefoneFormatado => long.TryParse(Telefone, out var nr)
        ? nr.ToString(@"(00) 00000\-0000")
        : Telefone;

    // Um responsável pode ter vários alunos vinculados (irmãos na mesma escola)
    public List<Aluno> Alunos { get; set; } = new();
}