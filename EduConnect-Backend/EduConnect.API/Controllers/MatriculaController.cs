using Microsoft.AspNetCore.Mvc;
using EduConnect.Application.Services;
using EduConnect.Application.DTOs;

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

    // VAMOS ADICIONAR O BOTÃO DE APROVAÇÃO PARA O ADMIN JÁ?
    [HttpPut("aprovar/{id}")]
    public async Task<IActionResult> Aprovar(Guid id)
    {
        await _service.AprovarMatricula(id);
        return Ok(new { message = "Matrícula aprovada! RA e Senha enviados ao responsável." });
    }
}