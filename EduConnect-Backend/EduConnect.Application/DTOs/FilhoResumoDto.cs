namespace EduConnect.Application.DTOs;

public class FilhoResumoDto
{
    public Guid Id { get; set; } // ID que o Front-end vai usar para chamar o Boletim
    public string Nome { get; set; } = string.Empty;
    public string RA { get; set; } = string.Empty;
    public string TurmaNome { get; set; } = string.Empty;
}