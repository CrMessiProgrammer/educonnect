using Microsoft.AspNetCore.Mvc;
using EduConnect.Application.Services;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace EduConnect.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Responsavel")] // Trava de segurança: SÓ o perfil Responsável entra aqui
public class ResponsavelController : ControllerBase
{
    private readonly ResponsavelService _service;

    public ResponsavelController(ResponsavelService service) => _service = service;

    [HttpGet("meus-filhos")]
    public async Task<IActionResult> GetMeusFilhos()
    {
        try
        {
            // Pega o ID de quem fez o login lendo direto do Token JWT (Inviolável)
            var usuarioIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("id");

            if (string.IsNullOrEmpty(usuarioIdClaim))
                return Unauthorized(new { message = "ID do usuário não encontrado no token." });

            var responsavelId = Guid.Parse(usuarioIdClaim);

            var filhos = await _service.ObterMeusFilhosAsync(responsavelId);

            return Ok(filhos);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}