namespace EduConnect.Application.DTOs;

public record PagamentoPendenteDto(
    Guid TransacaoId,
    string Descricao, // Ex: "Taxa de Matrícula", "Uniforme"
    decimal Valor,
    DateTime DataVencimento,
    string ResponsavelNome,
    string AlunoNome, // Se a transação estiver ligada a uma matrícula que tem aluno
    string TelefoneContato // Importante para o Admin poder cobrar
);