using Microsoft.AspNetCore.Mvc;
using EduConnect.Application.Services;
using EduConnect.Application.DTOs;
using Microsoft.AspNetCore.Authorization;

namespace EduConnect.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Administrador")] // Proteção total para este controller
public class AlunoController : ControllerBase
{
    private readonly AlunoService _alunoService;

    public AlunoController(AlunoService alunoService)
    {
        _alunoService = alunoService;
    }

    // Se não vier nada na busca, ele traz tudo. Se vier, ele filtra.
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? busca)
    {
        var alunos = await _alunoService.GetAllAsync(busca);
        return Ok(alunos);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var aluno = await _alunoService.GetByIdAsync(id);

        if (aluno == null) return NotFound(new { message = "Aluno não encontrado." });

        // Mapeamento manual para DTO para evitar Loop Infinito (Erro 500)
        // O ideal seria o Service já devolver DTO, mas para não mexer lá agora,
        // resolvemos aqui rapidinho:
        var response = new AlunoResponseDto(
            aluno.Id,
            aluno.Nome,
            aluno.RA,
            aluno.Status.ToString(),
            aluno.Turma != null ? aluno.Turma.Nome : "Sem Turma",
            aluno.Responsavel != null ? aluno.Responsavel.Nome : "Responsável não vinculado"
        );

        return Ok(response);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] AlunoUpdateDto dto)
    {
        try
        {
            await _alunoService.UpdateAsync(id, dto);
            return Ok(new { message = "Dados do aluno atualizados com sucesso!" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        // Usa o Soft Delete (Desativar) em vez de remover do banco
        await _alunoService.DeactivateAsync(id);
        return Ok(new { message = "Aluno desativado do sistema." });
    }
}