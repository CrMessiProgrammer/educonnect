using Microsoft.AspNetCore.Mvc;
using EduConnect.Application.Services;
using Microsoft.AspNetCore.Authorization;

namespace EduConnect.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Administrador")] // Apenas o "chefão" acessa essa visão
public class DashboardController : ControllerBase
{
    private readonly DashboardService _service;

    public DashboardController(DashboardService service) => _service = service;

    [HttpGet("admin")]
    public async Task<IActionResult> GetAdminDashboard()
    {
        try
        {
            var dados = await _service.ObterDadosDashboardAsync();
            return Ok(dados);
        }
        catch (Exception ex)
        {
            // Log do erro aqui seria ideal
            return BadRequest(new { message = "Erro ao carregar indicadores.", details = ex.Message });
        }
    }
}