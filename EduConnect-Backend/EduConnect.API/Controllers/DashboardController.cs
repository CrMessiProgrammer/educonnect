using Microsoft.AspNetCore.Mvc;
using EduConnect.Application.Services;
using Microsoft.AspNetCore.Authorization;

namespace EduConnect.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly DashboardService _service;

    public DashboardController(DashboardService service) => _service = service;

    [HttpGet("admin")]
    [Authorize(Roles = "Administrador")] // Apenas o Admin acessa essa visão
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

    [HttpGet("relatorio-geral")]
    [Authorize(Roles = "Administrador")] // Apenas o Admin acessa essa visão
    public async Task<IActionResult> GetRelatorioGeral()
    {
        try
        {
            var relatorio = await _service.ObterRelatorioDesempenhoGeralAsync();
            return Ok(relatorio);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = "Erro ao executar a Stored Procedure.", details = ex.Message });
        }
    }

    [HttpGet("professor/{id}")]
    [Authorize(Roles = "Professor")] // Protege a rota do professor
    public async Task<IActionResult> GetProfessorDashboard(Guid id)
    {
        try
        {
            var dados = await _service.ObterDadosProfessorAsync(id);
            return Ok(dados);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("aluno/{id}")]
    [Authorize(Roles = "Aluno,Responsavel")] // Alunos e Pais podem ver
    public async Task<IActionResult> GetAlunoDashboard(Guid id)
    {
        try
        {
            var dados = await _service.ObterDadosAlunoAsync(id);
            return Ok(dados);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}