using Microsoft.AspNetCore.Mvc;
using EduConnect.Application.Services;
using EduConnect.Application.DTOs;
using Microsoft.AspNetCore.Authorization;

namespace EduConnect.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Administrador")]
public class TurmaController : ControllerBase
{
    private readonly TurmaService _service;

    public TurmaController(TurmaService service) => _service = service;

    [HttpGet]
    public async Task<IActionResult> Get() => Ok(await _service.ListarTodas());

    [HttpGet("disponiveis")]
    [AllowAnonymous]
    public async Task<IActionResult> GetTurmasDisponiveis()
    {
        // Chama o SERVICE e não o CONTEXT
        var turmas = await _service.ListarDisponiveis();
        return Ok(turmas);
    }

    [HttpGet("{turmaId}/alunos")]
    public async Task<IActionResult> GetAlunos(Guid turmaId)
    {
        var alunos = await _service.ListarAlunosDaTurma(turmaId);
        return Ok(alunos);
    }

    [HttpPost]
    public async Task<IActionResult> Post([FromBody] TurmaCreateDto dto)
    {
        await _service.Criar(dto);
        return Ok(new { message = "Turma criada com sucesso!" });
    }

    [HttpPost("{turmaId}/vincular-professor/{professorId}")]
    public async Task<IActionResult> VincularProfessor(Guid turmaId, Guid professorId)
    {
        try
        {
            await _service.VincularProfessor(turmaId, professorId);
            return Ok(new { message = "Professor vinculado à turma com sucesso!" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}