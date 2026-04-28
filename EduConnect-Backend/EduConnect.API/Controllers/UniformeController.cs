using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using EduConnect.Application.Services;
using EduConnect.Application.DTOs;
using System.Security.Claims;

namespace EduConnect.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UniformeController : ControllerBase
{
    private readonly UniformeService _service;

    public UniformeController(UniformeService service) => _service = service;

    [HttpPost("solicitar")]
    [Authorize(Roles = "Responsavel")] // Só o Responsável solicita
    public async Task<IActionResult> Solicitar([FromBody] SolicitarUniformeDto dto)
    {
        try
        {
            // Extrai o ID do pai logado direto do Token JWT
            var usuarioIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("id");
            var responsavelId = Guid.Parse(usuarioIdClaim!);

            // Pega o ID do pedido criado
            var pedidoId = await _service.SolicitarUniformeAsync(responsavelId, dto);

            // Retorna ele no JSON para o React usar
            return Ok(new { message = "Pedido de uniforme realizado com sucesso!", pedidoId = pedidoId });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message); // 403 Forbidden (Pai tentando pedir pra filho dos outros)
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message }); // 400 (Esqueceu o endereço)
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Erro interno ao processar pedido.", details = ex.Message });
        }
    }

    [HttpGet]
    [Authorize(Roles = "Administrador")] // Só o Admin enxerga tudo
    public async Task<IActionResult> ListarTodos()
    {
        try
        {
            var pedidos = await _service.ObterTodosPedidosAsync();
            return Ok(pedidos);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Erro ao buscar pedidos.", details = ex.Message });
        }
    }

    [HttpPatch("{id}/status")]
    [Authorize(Roles = "Administrador")] // Só a escola (Admin) atualiza o status
    public async Task<IActionResult> AtualizarStatus(Guid id, [FromBody] AtualizarStatusUniformeDto dto)
    {
        try
        {
            var sucesso = await _service.AtualizarStatusPedidoAsync(id, dto.Status);

            if (!sucesso)
                return NotFound(new { message = "Pedido de uniforme não encontrado." });

            return Ok(new { message = $"Status do pedido atualizado para '{dto.Status}' e e-mail enviado ao responsável com sucesso!" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Erro interno ao atualizar status.", details = ex.Message });
        }
    }
}