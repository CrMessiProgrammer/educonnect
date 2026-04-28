using Microsoft.AspNetCore.SignalR;
using EduConnect.Infrastructure.Context;
using EduConnect.Domain.Entities;
using System.Security.Claims; // Adicione isso
using Microsoft.AspNetCore.Authorization; // Adicione isso

namespace EduConnect.API.Hubs;

[Authorize] // Garante que só logados conectem no WebSocket
public class ChatHub : Hub // O Hub é o "Roteador" do WebSocket. Ele recebe a mensagem de um e dispara para o outro.
{
    private readonly EduConnectDbContext _context;

    public ChatHub(EduConnectDbContext context)
    {
        _context = context;
    }

    // Método que o Front-end vai chamar para enviar uma mensagem
    public async Task EnviarMensagem(string destinatarioId, string conteudo)
    {
        // Pega o ID direto do Token de quem abriu a conexão WebSocket
        var remetenteId = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(remetenteId)) return;

        // 1. Salva a mensagem no banco de dados para manter o histórico
        var mensagem = new MensagemChat
        {
            RemetenteId = Guid.Parse(remetenteId),
            DestinatarioId = Guid.Parse(destinatarioId),
            Conteudo = conteudo
        };

        _context.MensagensChat.Add(mensagem);
        await _context.SaveChangesAsync();

        // 2. Dispara a mensagem em TEMPO REAL para o destinatário
        // Aqui estou usando um grupo simples com o ID do destinatário para rotear a mensagem
        await Clients.User(destinatarioId).SendAsync("ReceberMensagem", remetenteId, conteudo, mensagem.DataEnvio);
    }
}