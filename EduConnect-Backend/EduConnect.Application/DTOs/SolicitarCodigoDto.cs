namespace EduConnect.Application.DTOs;

public class SolicitarCodigoDto
{
    // Pode ser o E-mail (Pais/Professores) ou o RA (Alunos)
    public string Identificacao { get; set; } = string.Empty;
}