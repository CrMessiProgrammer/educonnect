namespace EduConnect.Application.DTOs;

public record ProfessorResponseDto(
    Guid Id,
    string Nome,
    string Email,
    string CPF,
    string Disciplina,
    string RP,
    List<string> Turmas
);