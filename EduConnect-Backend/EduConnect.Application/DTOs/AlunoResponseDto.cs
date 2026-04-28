namespace EduConnect.Application.DTOs;

public record AlunoResponseDto(
    Guid Id,
    string Nome,
    string? RA,
    string Status,
    Guid? TurmaId,
    string? TurmaNome,
    string ResponsavelNome
);