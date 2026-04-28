using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using EduConnect.Infrastructure.Context;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace EduConnect.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Responsavel")] // Apenas o responsável tem carteira financeira
public class FinanceiroController : ControllerBase
{
    private readonly EduConnectDbContext _context;

    public FinanceiroController(EduConnectDbContext context) => _context = context;

    [HttpGet("meu-extrato")]
    public async Task<IActionResult> ObterMeuExtrato()
    {
        try
        {
            var responsavelId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var transacoes = await _context.Transacoes
                .Where(t => t.ResponsavelId == responsavelId)
                .OrderByDescending(t => t.DataCriacao) // Mais recentes no topo
                .Select(t => new
                {
                    t.Id,
                    t.Tipo,
                    t.Descricao,
                    Valor = t.Valor.ToString("C"), // Já formata para "R$ 89,90"
                    t.Status,
                    Data = t.DataCriacao.ToString("dd/MM/yyyy HH:mm"),
                    t.CodigoPix
                })
                .ToListAsync();

            return Ok(transacoes);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Erro ao buscar histórico financeiro.", details = ex.Message });
        }
    }
}