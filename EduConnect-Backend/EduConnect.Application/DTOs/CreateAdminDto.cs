namespace EduConnect.Application.DTOs;

public record CreateAdminDto(
    string Nome,
    string Email,
    string Password,
    string CPF,
    string Cargo
);