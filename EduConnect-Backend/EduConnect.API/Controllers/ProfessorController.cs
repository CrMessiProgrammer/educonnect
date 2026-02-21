using Microsoft.AspNetCore.Mvc;
using EduConnect.Application.Services;
using EduConnect.Application.DTOs;
using Microsoft.AspNetCore.Authorization;

namespace EduConnect.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProfessorController : ControllerBase
{
    private readonly ProfessorService _service;

    public ProfessorController(ProfessorService service) => _service = service;

    // =========================================================================
    // --- ÁREA DO ADMINISTRADOR (Gestão de Professores) ---
    // =========================================================================
    [Authorize(Roles = "Administrador")]
    [HttpPost]
    public async Task<IActionResult> Post([FromBody] ProfessorCreateDto dto)
    {
        try
        {
            await _service.CadastrarProfessor(dto);
            return Ok(new { message = "Professor cadastrado com sucesso!" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [Authorize(Roles = "Administrador")]
    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await _service.ListarTodos());

    [Authorize(Roles = "Administrador")]
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var prof = await _service.ObterPorId(id);
        return prof != null ? Ok(prof) : NotFound();
    }

    [Authorize(Roles = "Administrador")]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] ProfessorUpdateDto dto)
    {
        try
        {
            await _service.AtualizarProfessor(id, dto);
            return Ok(new { message = "Professor atualizado!" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [Authorize(Roles = "Administrador")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _service.DesativarProfessor(id);
        return Ok(new { message = "Professor removido do quadro ativo." });
    }

    // =========================================================================
    // --- PORTAL DO PROFESSOR (Lançamento de Notas e Frequência) ---
    // =========================================================================

    [Authorize(Roles = "Professor")]
    [HttpGet("{professorId}/turma/{turmaId}/alunos")]
    public async Task<IActionResult> GetAlunos(Guid professorId, Guid turmaId)
    {
        try
        {
            var alunos = await _service.ObterAlunosDaTurmaAsync(professorId, turmaId);
            return Ok(alunos);
        }
        catch (Exception ex)
        {
            return Forbid(ex.Message); // Retorna 403 se o prof tentar acessar turma alheia
        }
    }

    [Authorize(Roles = "Professor")]
    [HttpPost("{professorId}/lancar-nota")]
    public async Task<IActionResult> PostNota(Guid professorId, [FromBody] LancamentoNotaDto dto)
    {
        try
        {
            await _service.LancarNotaAsync(professorId, dto);
            return Ok(new { message = "Nota lançada/atualizada com sucesso!" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [Authorize(Roles = "Professor")]
    [HttpPost("{professorId}/fazer-chamada")]
    public async Task<IActionResult> PostChamada(Guid professorId, [FromBody] LancamentoFrequenciaDto dto)
    {
        try
        {
            await _service.LancarFrequenciaAsync(professorId, dto);
            return Ok(new { message = "Chamada registrada com sucesso!" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}