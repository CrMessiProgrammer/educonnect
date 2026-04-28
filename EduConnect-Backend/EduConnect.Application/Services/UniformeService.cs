using EduConnect.Infrastructure.Context;
using EduConnect.Application.DTOs;
using EduConnect.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduConnect.Application.Services;

public class UniformeService
{
    private readonly EduConnectDbContext _context;
    private readonly EmailService _emailService;

    public UniformeService(EduConnectDbContext context, EmailService emailService)
    {
        _context = context;
        _emailService = emailService;
    }

    public async Task<Guid> SolicitarUniformeAsync(Guid responsavelLogadoId, SolicitarUniformeDto dto)
    {
        // 1. SEGURANÇA: Verifica se o Aluno realmente existe e se é filho deste Responsável
        var aluno = await _context.Alunos
            .FirstOrDefaultAsync(a => a.Id == dto.AlunoId && a.ResponsavelId == responsavelLogadoId);

        if (aluno == null)
            throw new UnauthorizedAccessException("Você não tem permissão para solicitar uniformes para este aluno.");

        // 2. VALIDAÇÃO DE REGRA DE NEGÓCIO: Se for "Entrega em Domicílio", tem que ter endereço!
        if (dto.TipoEntrega == "Entrega em Domicílio" && string.IsNullOrWhiteSpace(dto.EnderecoEntrega))
            throw new ArgumentException("Para entregas em domicílio, o endereço é obrigatório.");

        // 3. Cria o pedido
        var pedido = new PedidoUniforme
        {
            AlunoId = dto.AlunoId,
            Tamanho = dto.Tamanho,
            Peca = dto.Peca,
            TipoEntrega = dto.TipoEntrega,
            EnderecoEntrega = dto.TipoEntrega == "Entrega em Domicílio" ? dto.EnderecoEntrega : null,
            Status = "Pendente",
            StatusPagamento = "Aguardando Pagamento", // Garantindo o status inicial
            DataPedido = DateTime.UtcNow
        };

        _context.PedidosUniforme.Add(pedido);
        await _context.SaveChangesAsync();

        return pedido.Id; // Retorna o ID gerado
    }

    public async Task<List<PedidoUniforme>> ObterTodosPedidosAsync()
    {
        return await _context.PedidosUniforme
            .Include(p => p.Aluno) // Traz os dados do Aluno para o Front-end mostrar
            .Where(p => p.StatusPagamento == "Pago") // <-- Regra: Admin só vê o que já foi pago!
            .OrderByDescending(p => p.DataPedido) // Mais recentes primeiro
            .ToListAsync();
    }

    public async Task<bool> AtualizarStatusPedidoAsync(Guid pedidoId, string novoStatus)
    {
        // Dá um "Include" para consegui acessar o e-mail do Responsável
        var pedido = await _context.PedidosUniforme
            .Include(p => p.Aluno)
            .ThenInclude(a => a.Responsavel)
            .FirstOrDefaultAsync(p => p.Id == pedidoId);

        if (pedido == null) return false;

        pedido.Status = novoStatus;
        await _context.SaveChangesAsync();

        // 📧 ENVIO DE E-MAIL PARA O RESPONSÁVEL
        var responsavel = pedido.Aluno?.Responsavel; // Cria uma variável local para o compilador ter certeza

        if (responsavel != null)
        {
            string assunto = "EduConnect - Atualização do Pedido de Uniforme";
            string mensagem = $@"
            <h3>Olá, {responsavel.Nome}!</h3>
            <p>O pedido de uniforme ({pedido.Peca}, Tamanho: {pedido.Tamanho}) do(a) aluno(a) <b>{pedido.Aluno!.Nome}</b> teve o status atualizado para: <span style='font-size: 18px;'><strong>{novoStatus}</strong></span>.</p>";

            await _emailService.EnviarEmailAsync(responsavel.Email, assunto, mensagem);
        }

        return true;
    }
}