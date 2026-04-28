using EduConnect.Domain.Entities;
using EduConnect.Infrastructure.Context;
using EduConnect.Application.DTOs;
using Microsoft.EntityFrameworkCore;

namespace EduConnect.Application.Services;

public class CalendarioService
{
    private readonly EduConnectDbContext _context;

    public CalendarioService(EduConnectDbContext context) => _context = context;

    public async Task<EventoCalendario> CriarEventoAsync(CriarEventoCalendarioDto dto)
    {
        var evento = new EventoCalendario
        {
            Titulo = dto.Titulo,
            Descricao = dto.Descricao,
            DataInicio = dto.DataInicio,
            DataFim = dto.DataFim,
            TipoEvento = dto.TipoEvento
        };

        _context.EventosCalendario.Add(evento);
        await _context.SaveChangesAsync();
        return evento;
    }

    // Traz os eventos do mês atual em diante, ordenados pela data
    public async Task<List<EventoCalendario>> ObterProximosEventosAsync()
    {
        var hoje = DateTime.UtcNow.Date;
        return await _context.EventosCalendario
            .Where(e => e.DataInicio >= hoje)
            .OrderBy(e => e.DataInicio)
            .ToListAsync();
    }
}