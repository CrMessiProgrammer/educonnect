using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using EduConnect.Application.Services;
using EduConnect.Application.DTOs;

namespace EduConnect.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CalendarioController : ControllerBase
{
    private readonly CalendarioService _service;

    public CalendarioController(CalendarioService service) => _service = service;

    [HttpPost]
    [Authorize(Roles = "Administrador,Professor")] // Só a escola e o professor cria evento
    public async Task<IActionResult> CriarEvento([FromBody] CriarEventoCalendarioDto dto)
    {
        try
        {
            var evento = await _service.CriarEventoAsync(dto);
            return CreatedAtAction(nameof(ObterEventos), new { id = evento.Id }, evento);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = "Erro ao criar evento.", details = ex.Message });
        }
    }

    [HttpGet]
    [Authorize] // Qualquer pessoa logada (Aluno, Pai, Prof, Admin) pode ver a agenda
    public async Task<IActionResult> ObterEventos()
    {
        var eventos = await _service.ObterProximosEventosAsync();
        return Ok(eventos);
    }
}