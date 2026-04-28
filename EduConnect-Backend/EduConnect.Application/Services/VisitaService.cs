using EduConnect.Infrastructure.Context;
using EduConnect.Application.DTOs;
using EduConnect.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduConnect.Application.Services;

public class VisitaService
{
    private readonly EduConnectDbContext _context;
    private readonly EmailService _emailService;

    public VisitaService(EduConnectDbContext context, EmailService emailService)
    {
        _context = context;
        _emailService = emailService;
    }

    public async Task<List<string>> ObterHorariosDisponiveisAsync(DateTime dataSolicitada)
    {
        // Pega a data atual no fuso horário do Brasil (UTC -3) para evitar bugs de madrugada
        var dataLocal = DateTime.UtcNow.AddHours(-3).Date;

        // 1. Se a data pedida for no passado, retorna lista vazia
        if (dataSolicitada.Date < dataLocal)
            return new List<string>();

        // 2. Fim de semana não tem visita (retorna lista vazia)
        if (dataSolicitada.DayOfWeek == DayOfWeek.Saturday || dataSolicitada.DayOfWeek == DayOfWeek.Sunday)
            return new List<string>();

        // 3. Defini o Horário Comercial (08:00 às 17:00, de 1 em 1 hora)
        var inicioExpediente = new TimeSpan(8, 0, 0);
        var fimExpediente = new TimeSpan(17, 0, 0);
        var intervaloVisita = TimeSpan.FromHours(1);

        // 4. Pega o início e fim do dia para a consulta no banco (Melhor performance no SQL)
        var inicioDoDia = dataSolicitada.Date;
        var fimDoDia = inicioDoDia.AddDays(1);

        // 5. Busca no banco de dados todas as visitas daquele DIA que NÃO foram canceladas
        var visitasDoDia = await _context.Visitas
            .Where(v => v.DataHoraVisita >= inicioDoDia && v.DataHoraVisita < fimDoDia && v.Status != "Cancelada")
            .ToListAsync(); // Traz para a memória

        // 6. Formata tudo para string (ex: "10:00") para garantir a comparação exata
        var horariosOcupados = visitasDoDia.Select(v => v.DataHoraVisita.ToString("HH:mm")).ToList();

        var horariosLivres = new List<string>();
        var horarioAtual = inicioExpediente;

        // 7. Monta a grade de horários disponíveis
        while (horarioAtual < fimExpediente)
        {
            var horaString = horarioAtual.ToString(@"hh\:mm");

            // Compara texto com texto
            if (!horariosOcupados.Contains(horaString))
            {
                horariosLivres.Add(horaString);
            }

            // Pula para o próximo horário (+ 1 hora)
            horarioAtual = horarioAtual.Add(intervaloVisita);
        }

        // Se a data for HOJE, não mostrar horários que já passaram
        if (dataSolicitada.Date == dataLocal)
        {
            var horaAtualNoBrasil = DateTime.UtcNow.AddHours(-3).TimeOfDay;
            horariosLivres = horariosLivres.Where(h => TimeSpan.Parse(h) > horaAtualNoBrasil).ToList();
        }

        return horariosLivres;
    }

    public async Task<bool> AgendarVisitaAsync(AgendarVisitaDto dto)
    {
        var dataHoraLocal = DateTime.UtcNow.AddHours(-3);
        if (dto.DataHoraVisita < dataHoraLocal)
            throw new ArgumentException("A data da visita não pode estar no passado.");

        // Blinda horários fora da grade ou "quebrados" (ex: 07:00 ou 10:15)
        var hora = dto.DataHoraVisita.TimeOfDay;
        if (hora < TimeSpan.FromHours(8) || hora >= TimeSpan.FromHours(17) || hora.Minutes != 0)
            throw new ArgumentException("Horário inválido. Escolha um horário comercial exato (ex: 08:00, 09:00).");

        var horarioOcupado = await _context.Visitas.AnyAsync(v =>
            v.DataHoraVisita == dto.DataHoraVisita &&
            v.Status != "Cancelada");

        if (horarioOcupado)
            throw new ArgumentException("Poxa, este horário acabou de ser reservado. Por favor, escolha outro.");

        var novaVisita = new Visita
        {
            NomeVisitante = dto.NomeVisitante,
            Email = dto.Email,
            Telefone = dto.Telefone,
            DataHoraVisita = dto.DataHoraVisita
        };

        _context.Visitas.Add(novaVisita);
        await _context.SaveChangesAsync();

        return true;
    }

    // Método para listar todas as visitas (ordena da mais próxima para a mais distante)
    public async Task<List<Visita>> ObterTodasVisitasAsync()
    {
        return await _context.Visitas
            .OrderByDescending(v => v.DataSolicitacao)
            .ToListAsync();
    }

    // Método para alterar o status
    public async Task<bool> AtualizarStatusVisitaAsync(Guid id, string novoStatus)
    {
        var visita = await _context.Visitas.FindAsync(id);
        if (visita == null) return false;

        var statusPermitidos = new[] { "Pendente", "Confirmada", "Cancelada", "Realizada" };
        if (!statusPermitidos.Contains(novoStatus))
            throw new ArgumentException("Status inválido. Use: Pendente, Confirmada, Cancelada ou Realizada.");

        visita.Status = novoStatus;
        await _context.SaveChangesAsync();

        // 📧 ENVIO DO E-MAIL APÓS SALVAR NO BANCO:
        string assunto = $"EduConnect - Atualização da Sua Visita";
        string mensagem = $@"
            <h3>Olá, {visita.NomeVisitante}!</h3>
            <p>O status da sua visita agendada para <strong>{visita.DataHoraVisita:dd/MM/yyyy às HH:mm}</strong> foi atualizado para: <span style='font-size: 18px;'><strong>{novoStatus}</strong></span>.</p>
            <p>Em caso de dúvidas, entre em contato com a secretaria.</p>";

        await _emailService.EnviarEmailAsync(visita.Email, assunto, mensagem);

        return true;
    }
}