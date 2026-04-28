using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using EduConnect.Application.Services;
using EduConnect.Infrastructure.Context;
using System.Security.Claims;

namespace EduConnect.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PagamentoController : ControllerBase
{
    private readonly PagamentoService _service;
    private readonly EduConnectDbContext _context;

    public PagamentoController(PagamentoService service, EduConnectDbContext context)
    {
        _service = service;
        _context = context;
    }

    [HttpPost("gerar-pix-uniforme/{pedidoId}")]
    [Authorize(Roles = "Responsavel")] // O pai clica no botão "Pagar" no app
    public async Task<IActionResult> GerarPixUniforme(Guid pedidoId)
    {
        // Pega o Responsável logado
        var responsavelId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var pedido = await _context.PedidosUniforme.FindAsync(pedidoId);
        if (pedido == null) return NotFound(new { message = "Pedido não encontrado." });
        if (pedido.StatusPagamento == "Pago") return BadRequest(new { message = "Pedido já está pago." });

        // Valor fixo de simulação (No mundo real, cada peça teria seu preço no banco)
        decimal valorUniforme = 89.90m;

        var transacao = await _service.GerarTransacaoPixAsync(
            responsavelId,
            "Uniforme",
            $"Pedido de Uniforme: {pedido.Peca} (Tam: {pedido.Tamanho})",
            valorUniforme,
            pedido.Id
        );

        return Ok(new
        {
            message = "PIX gerado com sucesso.",
            transacaoId = transacao.Id,
            valor = transacao.Valor,
            pixCopiaECola = transacao.CodigoPix
        });
    }

    [HttpPost("gerar-pix-existente/{transacaoId}")]
    public async Task<IActionResult> GerarPixExistente(Guid transacaoId)
    {
        var transacao = await _context.Transacoes.FindAsync(transacaoId);

        if (transacao == null) return NotFound("Transação não encontrada");

        // Se não tiver PIX gerado ainda, gera um simulado
        if (string.IsNullOrEmpty(transacao.CodigoPix))
        {
            transacao.CodigoPix = "00020126330014BR.GOV.BCB.PIX0111" + Guid.NewGuid().ToString().Substring(0, 8);
            await _context.SaveChangesAsync();
        }

        return Ok(new
        {
            pixCopiaECola = transacao.CodigoPix,
            valor = transacao.Valor,
            transacaoId = transacao.Id
        });
    }

    // WEBHOOK: Em um cenário real, este endpoint seria [AllowAnonymous] mas protegido por uma chave secreta no header.
    // O Mercado Pago chamaria essa URL. Para o portfólio, ficou aberto para simulação no Swagger.
    [HttpPost("webhook-simulador/{transacaoId}")]
    [AllowAnonymous]
    public async Task<IActionResult> SimularPagamentoAprovado(Guid transacaoId)
    {
        var sucesso = await _service.ProcessarWebhookPagamentoAsync(transacaoId);

        if (!sucesso) return NotFound(new { message = "Transação não encontrada ou já paga." });

        return Ok(new { message = "Simulação de Webhook recebida! Pagamento aprovado com sucesso." });
    }

    [HttpGet("pendentes")]
    [Authorize(Roles = "Administrador")] // Proteção total!
    public async Task<IActionResult> GetPagamentosPendentes()
    {
        try
        {
            var pendentes = await _service.ListarPagamentosPendentes();
            return Ok(pendentes);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}