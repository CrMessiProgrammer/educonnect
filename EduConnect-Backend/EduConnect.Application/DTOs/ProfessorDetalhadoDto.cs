namespace EduConnect.Application.DTOs;

public class ProfessorDetalhadoDto
{
    public Guid Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string CPF { get; set; } = string.Empty; // Apenas o formatado aqui
    public string Disciplina { get; set; } = string.Empty;
    public string RP { get; set; } = string.Empty;
    public List<string> Turmas { get; set; } = new(); // Apenas os nomes das turmas para o perfil
}