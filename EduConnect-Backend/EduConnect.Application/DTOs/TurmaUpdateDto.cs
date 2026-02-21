namespace EduConnect.Application.DTOs;

public record TurmaUpdateDto(
    string Nome,
    int AnoLetivo,
    string Turno,
    bool Ativa
);