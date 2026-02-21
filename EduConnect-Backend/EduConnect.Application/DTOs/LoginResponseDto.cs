namespace EduConnect.Application.DTOs;

// Este record serve para devolver apenas o necessário para o Front-end
public record LoginResponseDto(
    string Token,
    string Nome,
    string Tipo // Administrador, Professor ou Aluno
);