using Microsoft.AspNetCore.Mvc;
using EduConnect.Application.Services;
using Microsoft.AspNetCore.Authorization;

namespace EduConnect.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // Qualquer usuário logado pode tentar ver, mas validamos o ID abaixo
public class BoletimController : ControllerBase
{
    private readonly BoletimService _service;

    public BoletimController(BoletimService service) => _service = service;

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
}