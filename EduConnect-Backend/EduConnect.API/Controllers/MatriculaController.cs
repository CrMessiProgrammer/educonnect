using Microsoft.AspNetCore.Mvc;
using EduConnect.Application.Services;
using EduConnect.Application.DTOs;
using EduConnect.Infrastructure.Context;
using Microsoft.AspNetCore.Authorization;

namespace EduConnect.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MatriculaController : ControllerBase
{
    private readonly MatriculaService _service;

    public MatriculaController(MatriculaService service)
    {
        _service = service;
    }

    [HttpPost]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> Post([FromForm] MatriculaDto dto)
    {
        try
        {
            await _service.SolicitarMatricula(dto);
            return Ok(new { message = "Solicitação de matrícula enviada com sucesso! Aguarde a aprovação do administrador." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = "Erro ao processar matrícula.", error = ex.Message });
        }
    }

    [HttpGet("pendentes")] // Lista de matrículas pendentes
    [Authorize(Roles = "Administrador")] // Proteção ativada!
    public async Task<IActionResult> GetPendentes()
    {
        try
        {
            var pendentes = await _service.ObterMatriculasPendentesAsync();
            return Ok(pendentes);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = "Erro ao buscar matrículas pendentes.", error = ex.Message });
        }
    }

    [HttpGet("{id}/detalhes")] // Detalhes das Matrículas
    [Authorize(Roles = "Administrador")] // Proteção ativada!
    public async Task<IActionResult> GetDetalhes(Guid id)
    {
        try
        {
            var detalhes = await _service.ObterDetalhesMatriculaAsync(id);
            return Ok(detalhes);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("{alunoId}/historico")] // Histórico escolar do Aluno
    [Authorize(Roles = "Administrador")] // Apenas o Admin pode ver o histórico dos alunos
    public async Task<IActionResult> BaixarHistorico(Guid alunoId, [FromServices] EduConnectDbContext context)
    {
        var aluno = await context.Alunos.FindAsync(alunoId);
        if (aluno == null || string.IsNullOrEmpty(aluno.HistoricoEscolarPath))
            return NotFound(new { message = "Aluno ou Histórico não encontrado." });

        // Pega o caminho físico no servidor
        var filePath = Path.Combine(Directory.GetCurrentDirectory(), aluno.HistoricoEscolarPath);

        if (!System.IO.File.Exists(filePath))
            return NotFound(new { message = "O arquivo físico não foi encontrado no servidor." });

        // O "application/pdf" faz o navegador ABRIR o PDF ao invés de só fazer download
        return PhysicalFile(filePath, "application/pdf", $"Historico_{aluno.Nome}.pdf");
    }

    [Authorize(Roles = "Administrador")]
    [HttpPut("aprovar/{id}")]
    public async Task<IActionResult> Aprovar(Guid id, [FromBody] AprovarMatriculaDto dto)
    {
        try
        {
            // Passa o ID do aluno e o ID da Turma para o Service
            await _service.AprovarMatricula(id, dto.TurmaId);
            return Ok(new { message = "Matrícula aprovada! Aluno(a) vinculado à turma e credenciais (RA e Senha) enviadas ao responsável." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = "Erro ao aprovar matrícula.", error = ex.Message });
        }
    }
}