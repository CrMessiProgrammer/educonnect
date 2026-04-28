using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using EduConnect.Application.Services;
using EduConnect.Application.DTOs;

namespace EduConnect.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VisitaController : ControllerBase
{
    private readonly VisitaService _service;

    public VisitaController(VisitaService service) => _service = service;

    [HttpGet("horarios-disponiveis/{data}")]
    [AllowAnonymous] // Endpoint público para o site da escola
    public async Task<IActionResult> ObterHorariosDisponiveis(DateTime data)
    {
        try
        {
            var horarios = await _service.ObterHorariosDisponiveisAsync(data);
            return Ok(horarios);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Erro ao buscar horários.", details = ex.Message });
        }
    }

    [HttpPost("agendar")]
    [AllowAnonymous] // Endpoint público para o site da escola
    public async Task<IActionResult> Agendar([FromBody] AgendarVisitaDto dto)
    {
        try
        {
            await _service.AgendarVisitaAsync(dto);
            return Ok(new { message = "Sua visita foi agendada com sucesso! Em breve entraremos em contato." });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Erro interno ao agendar visita.", details = ex.Message });
        }
    }

    [HttpGet]
    [Authorize(Roles = "Administrador")] // Só o Admin acessa!
    public async Task<IActionResult> ListarTodas()
    {
        var visitas = await _service.ObterTodasVisitasAsync();
        return Ok(visitas);
    }

    [HttpPatch("{id}/status")]
    [Authorize(Roles = "Administrador")] // Só o Admin acessa!
    public async Task<IActionResult> AtualizarStatus(Guid id, [FromBody] AtualizarStatusVisitaDto dto)
    {
        try
        {
            var sucesso = await _service.AtualizarStatusVisitaAsync(id, dto.Status);

            if (!sucesso)
                return NotFound(new { message = "Visita não encontrada." });

            return Ok(new { message = $"Status atualizado para '{dto.Status}' com sucesso." });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}