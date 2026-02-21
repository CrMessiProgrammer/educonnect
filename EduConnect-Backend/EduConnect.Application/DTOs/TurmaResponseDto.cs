namespace EduConnect.Application.DTOs;

public record TurmaResponseDto(
    Guid Id,
    string Nome,
    string Turno, // Precisa ser string para receber o .ToString() do Enum
    int AnoLetivo,
    int TotalAlunos // Mostra quantos alunos tem na turma
);