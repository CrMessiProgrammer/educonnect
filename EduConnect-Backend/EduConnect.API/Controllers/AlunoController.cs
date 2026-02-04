using Microsoft.AspNetCore.Mvc;
using EduConnect.Domain.Entities;
using EduConnect.Application.Services;

namespace EduConnect.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AlunoController : ControllerBase
{
    private readonly AlunoService _alunoService;

    public AlunoController(AlunoService alunoService)
    {
        _alunoService = alunoService;
    }

    [HttpGet]
    public async Task<IActionResult> Get() => Ok(await _alunoService.GetAllAsync());

    [HttpPost]
    public async Task<IActionResult> Post(Aluno aluno)
    {
        await _alunoService.CreateAsync(aluno);
        return Ok(new { message = "Aluno matriculado com sucesso!" });
    }
}