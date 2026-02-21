using Microsoft.AspNetCore.Mvc;
using EduConnect.Application.Services;
using EduConnect.Application.DTOs;
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