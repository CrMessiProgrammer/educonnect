using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using EduConnect.Application.DTOs;

namespace EduConnect.Application.Services;

public class BoletimPdfService
{
    public byte[] GerarBoletimPdf(BoletimResponseDto boletim)
    {
        // Configuração obrigatória para uso gratuito (Community)
        QuestPDF.Settings.License = LicenseType.Community;

        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(2, Unit.Centimetre);
                page.PageColor(Colors.White);
                page.DefaultTextStyle(x => x.FontSize(11));

                // 1. CABEÇALHO DO PDF
                page.Header().Row(row =>
                {
                    row.RelativeItem().Column(column =>
                    {
                        column.Item().Text("EduConnect - Escola Particular").FontSize(20).SemiBold().FontColor(Colors.Blue.Darken2);
                        column.Item().Text($"Boletim Escolar Oficial - {DateTime.Now.Year}").FontSize(14);
                        column.Item().PaddingTop(10).Text($"Aluno: {boletim.AlunoNome}").SemiBold();
                        column.Item().Text($"Turma: {boletim.TurmaNome}");
                    });
                });

                // 2. CORPO DO PDF (A Tabela de Notas)
                page.Content().PaddingVertical(1, Unit.Centimetre).Column(column =>
                {
                    column.Item().Table(table =>
                    {
                        // Definindo as colunas
                        table.ColumnsDefinition(columns =>
                        {
                            columns.RelativeColumn(3); // Disciplina (mais larga)
                            columns.RelativeColumn();  // 1B
                            columns.RelativeColumn();  // 2B
                            columns.RelativeColumn();  // 3B
                            columns.RelativeColumn();  // 4B
                            columns.RelativeColumn();  // Média
                            columns.RelativeColumn();  // Faltas
                            columns.RelativeColumn(2); // Status
                        });

                        // Cabeçalho da Tabela
                        table.Header(header =>
                        {
                            header.Cell().BorderBottom(1).PaddingBottom(5).Text("Disciplina").SemiBold();
                            header.Cell().BorderBottom(1).PaddingBottom(5).Text("1ºB").SemiBold();
                            header.Cell().BorderBottom(1).PaddingBottom(5).Text("2ºB").SemiBold();
                            header.Cell().BorderBottom(1).PaddingBottom(5).Text("3ºB").SemiBold();
                            header.Cell().BorderBottom(1).PaddingBottom(5).Text("4ºB").SemiBold();
                            header.Cell().BorderBottom(1).PaddingBottom(5).Text("Média").SemiBold();
                            header.Cell().BorderBottom(1).PaddingBottom(5).Text("Faltas").SemiBold();
                            header.Cell().BorderBottom(1).PaddingBottom(5).Text("Status").SemiBold();
                        });

                        // Preenchendo os dados
                        foreach (var linha in boletim.Disciplinas)
                        {
                            table.Cell().PaddingVertical(5).Text(linha.Disciplina);
                            table.Cell().PaddingVertical(5).Text(linha.Nota1B?.ToString("F1") ?? "-");
                            table.Cell().PaddingVertical(5).Text(linha.Nota2B?.ToString("F1") ?? "-");
                            table.Cell().PaddingVertical(5).Text(linha.Nota3B?.ToString("F1") ?? "-");
                            table.Cell().PaddingVertical(5).Text(linha.Nota4B?.ToString("F1") ?? "-");
                            table.Cell().PaddingVertical(5).Text(linha.MediaFinal.ToString("F1")).SemiBold();
                            table.Cell().PaddingVertical(5).Text(linha.TotalFaltas.ToString());

                            // Cor verde para aprovado, vermelho para os demais
                            var corStatus = linha.Status == "Aprovado" ? Colors.Green.Medium : Colors.Red.Medium;
                            table.Cell().PaddingVertical(5).Text(linha.Status).FontColor(corStatus).SemiBold();
                        }
                    });

                    // Frequência Geral no rodapé do conteúdo
                    column.Item().PaddingTop(20).Text($"Frequência Geral do Aluno: {boletim.FrequenciaGeral:F1}%").FontSize(12).SemiBold();
                });

                // 3. RODAPÉ DA PÁGINA
                page.Footer().AlignCenter().Text(x =>
                {
                    x.Span("Documento gerado pelo sistema EduConnect - Página ");
                    x.CurrentPageNumber();
                    x.Span(" de ");
                    x.TotalPages();
                });
            });
        });

        // Retorna o PDF como um array de bytes
        return document.GeneratePdf();
    }
}