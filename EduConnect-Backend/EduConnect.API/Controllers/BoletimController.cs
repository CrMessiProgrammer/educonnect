using Microsoft.AspNetCore.Mvc;
using EduConnect.Application.Services;
using Microsoft.AspNetCore.Authorization;

namespace EduConnect.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // Qualquer usuário logado pode tentar ver, mas valida o ID abaixo
public class BoletimController : ControllerBase
{
    private readonly BoletimService _service;
    private readonly BoletimPdfService _pdfService;

    public BoletimController(BoletimService service, BoletimPdfService pdfService)
    {
        _service = service;
        _pdfService = pdfService;
    }

    [HttpGet("{alunoId}")]
    public async Task<IActionResult> Get(Guid alunoId)
    {
        try
        {
            // Nota: Em um sistema real, aqui checaríamos se o ID logado 
            // é o próprio Aluno ou o seu Responsável.
            var boletim = await _service.GerarBoletimAsync(alunoId);
            return Ok(boletim);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // Retorna o arquivo PDF para download
    [HttpGet("{alunoId}/pdf")]
    public async Task<IActionResult> GerarBoletimPdf(Guid alunoId)
    {
        try
        {
            // Busca os dados do boletim usando o serviço de JSON...
            var dadosBoletim = await _service.GerarBoletimAsync(alunoId);

            // ...e passa esses dados para a nossa "fábrica" de PDF
            var pdfBytes = _pdfService.GerarBoletimPdf(dadosBoletim);

            // Retorna como um arquivo executável para o navegador baixar
            return File(pdfBytes, "application/pdf", $"Boletim_{dadosBoletim.AlunoNome.Replace(" ", "_")}.pdf");
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}