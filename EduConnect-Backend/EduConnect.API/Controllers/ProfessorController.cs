using Microsoft.AspNetCore.Mvc;
using EduConnect.Domain.Entities;
using EduConnect.Application.Services;

namespace EduConnect.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProfessorController : ControllerBase
{
    private readonly ProfessorService _service;

    public ProfessorController(ProfessorService service)
    {
        _service = service;
    }

    [HttpPost]
    public async Task<IActionResult> Post([FromBody] Professor professor)
    {
        try
        {
            await _service.CadastrarProfessor(professor);
            return Ok(new { message = "Professor cadastrado com sucesso! RP e Senha enviados por e-mail." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = "Erro ao cadastrar professor.", error = ex.Message });
        }
    }
}