namespace EduConnect.Application.DTOs;

public record AlunoResponseDto(
    Guid Id,
    string Nome,
    string? RA,
    string Status,
    string? TurmaNome,
    string ResponsavelNome
);