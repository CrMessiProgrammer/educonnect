using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using EduConnect.Application.Services;
using EduConnect.Application.DTOs;
using System.Security.Claims;

namespace EduConnect.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ComunicadoController : ControllerBase
{
    private readonly ComunicadoService _service;

    public ComunicadoController(ComunicadoService service) => _service = service;

    [HttpPost]
    [Authorize(Roles = "Administrador,Professor")] // Só a escola e o professor publica avisos
    public async Task<IActionResult> PublicarComunicado([FromBody] CriarComunicadoDto dto)
    {
        try
        {
            var autorId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var comunicado = await _service.CriarComunicadoAsync(autorId, dto);

            return Ok(new { message = "Comunicado publicado no mural com sucesso!", id = comunicado.Id });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = "Erro ao publicar comunicado.", details = ex.Message });
        }
    }

    [HttpGet("mural")]
    [Authorize] // Qualquer pessoa logada vê o mural
    public async Task<IActionResult> ObterMural()
    {
        var mural = await _service.ObterMuralAsync();
        return Ok(mural);
    }
}