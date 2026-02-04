using Microsoft.AspNetCore.Mvc;
using EduConnect.Domain.Entities;
using EduConnect.Infrastructure.Context;
using EduConnect.Application.DTOs; // Importante para achar o DTO

namespace EduConnect.API.Controllers;

[ApiController] // OBRIGATÓRIO para o Swagger achar
[Route("api/[controller]")] // OBRIGATÓRIO: Define a URL como /api/admin
public class AdminController : ControllerBase // Tem que herdar de ControllerBase
{
    private readonly EduConnectDbContext _context;

    public AdminController(EduConnectDbContext context)
    {
        _context = context;
    }

    [HttpPost] // OBRIGATÓRIO: Diz que é um POST
    public async Task<IActionResult> Create([FromBody] CreateAdminDto dto)
    {
        // Mapeamento simples (Manual) - Depois usar AutoMapper
        var admin = new Administrador
        {
            Nome = dto.Nome,
            Email = dto.Email,
            PasswordHash = dto.Password,
            CPF = dto.CPF,
            Cargo = dto.Cargo
        };

        _context.Administradores.Add(admin);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(Create), new { id = admin.Id }, admin);
    }
}