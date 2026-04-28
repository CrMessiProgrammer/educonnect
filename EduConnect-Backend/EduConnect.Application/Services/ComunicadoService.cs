using EduConnect.Domain.Entities;
using EduConnect.Infrastructure.Context;
using EduConnect.Application.DTOs;
using Microsoft.EntityFrameworkCore;

namespace EduConnect.Application.Services;

public class ComunicadoService
{
    private readonly EduConnectDbContext _context;
    private readonly EmailService _emailService;

    public ComunicadoService(EduConnectDbContext context, EmailService emailService)
    {
        _context = context;
        _emailService = emailService;
    }

    public async Task<Comunicado> CriarComunicadoAsync(Guid autorId, CriarComunicadoDto dto)
    {
        var comunicado = new Comunicado
        {
            Titulo = dto.Titulo,
            Mensagem = dto.Mensagem,
            PublicoAlvo = dto.PublicoAlvo,
            TurmaId = dto.TurmaId,
            AutorId = autorId
        };

        _context.Comunicados.Add(comunicado);
        await _context.SaveChangesAsync();

        // 🚀 LÓGICA DE DISPARO DE E-MAIL (BROADCAST INTELIGENTE - transmissão de conteúdo para um público amplo)
        var emailsDestino = new List<string>();

        if (dto.TurmaId.HasValue)
        {
            // Se for para uma turma específica, pega apenas os pais dessa turma
            var emailsPaisTurma = await _context.Alunos
                .Include(a => a.Responsavel)
                .Where(a => a.TurmaId == dto.TurmaId && a.Responsavel != null)
                .Select(a => a.Responsavel!.Email)
                .ToListAsync();

            emailsDestino.AddRange(emailsPaisTurma);

            // Se houver uma forma de ligar o Professor à Turma, adicionaria o e-mail dele aqui.
        }
        else
        {
            // Se NÃO for para uma turma específica, avalia o "PublicoAlvo"
            if (dto.PublicoAlvo == "Todos" || dto.PublicoAlvo == "Responsaveis")
            {
                var todosPais = await _context.Responsaveis.Select(r => r.Email).ToListAsync();
                emailsDestino.AddRange(todosPais);
            }

            if (dto.PublicoAlvo == "Todos" || dto.PublicoAlvo == "Professores")
            {
                var todosProfessores = await _context.Professores.Select(p => p.Email).ToListAsync();
                emailsDestino.AddRange(todosProfessores);
            }
        }

        // Remove e-mails duplicados (ex: um pai com dois filhos na mesma turma)
        emailsDestino = emailsDestino.Distinct().ToList();

        if (emailsDestino.Any())
        {
            string assunto = $"📢 Comunicado EduConnect: {comunicado.Titulo}";
            string mensagemHtml = $@"
            <div style='font-family: Arial, sans-serif; color: #333;'>
                <h2 style='color: #1976d2;'>{comunicado.Titulo}</h2>
                <p style='font-size: 16px;'>{comunicado.Mensagem}</p>
                <hr>
                <p><small>Acesse à plataforma EduConnect para ver o mural completo.</small></p>
            </div>";

            // Envia o e-mail para todos os envolvidos
            foreach (var email in emailsDestino)
            {
                await _emailService.EnviarEmailAsync(email, assunto, mensagemHtml);
            }
        }

        return comunicado;
    }

    public async Task<List<Comunicado>> ObterMuralAsync()
    {
        // Traz os comunicados mais recentes primeiro
        return await _context.Comunicados
            .OrderByDescending(c => c.DataPublicacao)
            .Take(20) // Paginação simples: traz os últimos 20 avisos
            .ToListAsync();
    }
}