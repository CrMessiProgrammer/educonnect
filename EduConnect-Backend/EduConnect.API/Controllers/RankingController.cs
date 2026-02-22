using Microsoft.AspNetCore.Mvc;
using EduConnect.Application.Services;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace EduConnect.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // Qualquer usuário logado pode acessar
public class RankingController : ControllerBase
{
    private readonly RankingService _service;

    public RankingController(RankingService service) => _service = service;

    [HttpGet("turma/{turmaId}")]
    public async Task<IActionResult> GetRankingTurma(Guid turmaId)
    {
        try
        {
            // Extrai a Role (perfil) de dentro do Token JWT de quem fez a requisição
            var role = User.FindFirstValue(ClaimTypes.Role);

            // Se for Aluno ou Responsável, a visão é restrita ao Top 5
            bool visaoRestrita = (role == "Aluno" || role == "Responsavel");

            var ranking = await _service.ObterRankingAsync(turmaId, visaoRestrita);
            return Ok(ranking);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}