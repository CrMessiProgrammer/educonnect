using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using EduConnect.Infrastructure.Context;
using EduConnect.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace EduConnect.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // Qualquer usuário logado pode usar o chat
public class ChatController : ControllerBase
{
    private readonly EduConnectDbContext _context;

    public ChatController(EduConnectDbContext context)
    {
        _context = context;
    }

    [HttpGet("contatos")]
    public async Task<IActionResult> ObterContatos()
    {
        try
        {
            // 1. Pega o ID do usuário logado (usando o Claim)
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                              ?? User.FindFirst("nameid")?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out Guid meuId))
            {
                return BadRequest(new { message = "Usuário não autenticado ou ID inválido." });
            }

            // 2. Busca os contatos usando o nome da coluna: "UserType"
            var contatos = await _context.Users
                .Where(u => u.Id != meuId && u.Ativo)
                .Select(u => new
                {
                    u.Id,
                    u.Nome,

                    // Exatamente o nome definido no OnModelCreating
                    Papel = EF.Property<string>(u, "UserType"),

                    // Mágica do EF Core: Ele traduz isso para um "CASE WHEN" no SQL!
                    // Se for Aluno, pega o RA. Se não for, pega o Email.
                    Identificador = u is Aluno ? ((Aluno)u).RA :
                        u is Professor ? ((Professor)u).Email :
                        u is Responsavel ? ((Responsavel)u).Email :
                        u is Administrador ? ((Administrador)u).Email : "Sem identificação"
                })
                .OrderBy(u => u.Nome)
                .ToListAsync();

            return Ok(contatos);
        }
        catch (Exception ex)
        {
            // Se ainda der erro, o detalhe aparecerá aqui
            return BadRequest(new
            {
                message = "Erro ao carregar contatos.",
                detalhe = ex.Message
            });
        }
    }

    [HttpGet("historico/{outroUsuarioId}")]
    public async Task<IActionResult> ObterHistorico(Guid outroUsuarioId)
    {
        try
        {
            // Pega o ID de quem está logado (O seu token JWT tem essa informação)
            var meuId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            // Busca as mensagens onde EU enviei para ELE, ou ELE enviou para MIM
            var historico = await _context.MensagensChat
                .Where(m =>
                    (m.RemetenteId == meuId && m.DestinatarioId == outroUsuarioId) ||
                    (m.RemetenteId == outroUsuarioId && m.DestinatarioId == meuId)
                )
                .OrderBy(m => m.DataEnvio) // Ordena da mais antiga para a mais nova
                .Select(m => new
                {
                    m.Id,
                    m.RemetenteId,
                    m.DestinatarioId,
                    m.Conteudo,
                    m.DataEnvio,
                    SouRemetente = m.RemetenteId == meuId // Facilita a vida do Front-end (pra colocar o balãozinho na direita ou esquerda)
                })
                .ToListAsync();

            return Ok(historico);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = "Erro ao carregar o histórico de chat.", error = ex.Message });
        }
    }
}