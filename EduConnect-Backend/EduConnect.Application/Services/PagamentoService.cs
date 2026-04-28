using EduConnect.Infrastructure.Context;
using EduConnect.Domain.Entities;
using EduConnect.Application.DTOs;
using Microsoft.EntityFrameworkCore;

namespace EduConnect.Application.Services;

public class PagamentoService
{
    private readonly EduConnectDbContext _context;
    private readonly EmailService _emailService;

    public PagamentoService(EduConnectDbContext context, EmailService emailService)
    {
        _context = context;
        _emailService = emailService;
    }

    // 1. GERA A TRANSAÇÃO E O PIX
    public async Task<Transacao> GerarTransacaoPixAsync(Guid responsavelId, string tipo, string descricao, decimal valor, Guid? referenciaId)
    {
        // Evita gerar 2 PIX para a mesma coisa se já tem um pendente
        var transacaoExistente = await _context.Transacoes
            .FirstOrDefaultAsync(t => t.ReferenciaId == referenciaId && t.Status == "Pendente");

        if (transacaoExistente != null) return transacaoExistente;

        var novaTransacao = new Transacao
        {
            ResponsavelId = responsavelId,
            Tipo = tipo,
            Descricao = descricao,
            Valor = valor,
            ReferenciaId = referenciaId,
            Status = "Pendente"
        };

        // Simula o PIX com o ID da Transação no final
        novaTransacao.CodigoPix = $"00020126580014BR.GOV.BCB.PIX0136educonnect@escola.com.br5204000053039865802BR5925Escola EduConnect LTDA6009SAO PAULO62070503***6304{Guid.NewGuid().ToString().Substring(0, 4).ToUpper()}";

        _context.Transacoes.Add(novaTransacao);
        await _context.SaveChangesAsync();

        return novaTransacao;
    }

    // 2. PROCESSA O PAGAMENTO (O WEBHOOK)
    public async Task<bool> ProcessarWebhookPagamentoAsync(Guid transacaoId)
    {
        var transacao = await _context.Transacoes.FindAsync(transacaoId);
        if (transacao == null || transacao.Status == "Pago") return false;

        // 2.1 Atualiza a Transação Central
        transacao.Status = "Pago";
        transacao.DataPagamento = DateTime.UtcNow;

        // 2.2 INTEGRAÇÃO: Se for pagamento de Uniforme, atualiza o pedido original!
        if (transacao.Tipo == "Uniforme" && transacao.ReferenciaId.HasValue)
        {
            var pedidoUniforme = await _context.PedidosUniforme.FindAsync(transacao.ReferenciaId.Value);
            if (pedidoUniforme != null)
                pedidoUniforme.StatusPagamento = "Pago";
        }

        // 2.3 INTEGRAÇÃO: Matrícula (gatilho automático!)
        if (transacao.Tipo == "Matricula" && transacao.ReferenciaId.HasValue)
        {
            var aluno = await _context.Alunos.FindAsync(transacao.ReferenciaId.Value);
            if (aluno != null)
            {
                aluno.Status = Aluno.EnrollmentStatus.Aprovado;
            }
        }

        await _context.SaveChangesAsync();

        // 2.4 Envia o E-mail de Recibo usando o EmailService de 3 parâmetros
        var responsavel = await _context.Responsaveis.FindAsync(transacao.ResponsavelId);
        if (responsavel != null)
        {
            string assunto = "EduConnect - Pagamento Aprovado!";
            string mensagem = $@"
                <h2>Recibo de Pagamento</h2>
                <p>Olá, {responsavel.Nome}. Confirmamos o recebimento do seu PIX no valor de <strong>R$ {transacao.Valor:N2}</strong>.</p>
                <p>Referente a: {transacao.Descricao}</p>
                <p>Se este pagamento for referente à matrícula, o status do aluno já foi atualizado para ATIVO em nosso sistema!</p>
                <p>Obrigado!</p>";

            await _emailService.EnviarEmailAsync(responsavel.Email, assunto, mensagem);
        }

        return true;
    }

    public async Task<List<PagamentoPendenteDto>> ListarPagamentosPendentes()
    {
        // Usando a sintaxe de LINQ para criar um LEFT JOIN
        var query = from t in _context.Transacoes
                    where t.Status.ToLower() == "pendente"
                    join r in _context.Responsaveis on t.ResponsavelId equals r.Id into respGroup
                    from r in respGroup.DefaultIfEmpty() // Isso garante que a transação venha, mesmo sem responsável!
                    orderby t.DataCriacao ascending // Os mais antigos primeiro
                    select new PagamentoPendenteDto(
                        t.Id,
                        t.Descricao,
                        t.Valor,
                        t.DataCriacao,
                        r != null ? r.Nome : "Responsável Não Encontrado (Dado Órfão)",
                        "N/A",
                        r != null ? r.Telefone : "Sem contato"
                    );

        return await query.ToListAsync();
    }
}