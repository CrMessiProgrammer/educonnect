using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EduConnect.Infrastructure.Context;
using EduConnect.Application.DTOs;
using EduConnect.Domain.Entities;
using Microsoft.Extensions.Configuration;
using System;
using System.Threading.Tasks;
using System.Text;
using System.Collections.Generic;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;

namespace EduConnect.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly EduConnectDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthController(EduConnectDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        // 1. Busca flexível: E-mail (Admin, Prof, Resp) ou RA (Aluno) ou RP (Professor)
        // Usa _context.Set<> com o caminho global.
        // Como 'User' não tem email, precisa fazer "Cast" (conversão) dentro da busca.
        var usuario = await _context.Users
            .FirstOrDefaultAsync(u =>
                // Se for Admin verifica o e-mail
                (u is Administrador && ((Administrador)u).Email == dto.Identificador) ||

                // Se for Professor, verifica APENAS o RP
                (u is Professor && ((Professor)u).RP == dto.Identificador) ||

                // Se for Aluno, verifica APENAS o RA (Aluno não tem email no login)
                (u is Aluno && ((Aluno)u).RA == dto.Identificador)

            // Futuramente, para Responsável:
            // || (u is Responsavel && ((Responsavel)u).Email == dto.Identificador)
            );

        // 2. Primeiro verifica APENAS se o usuário existe
        if (usuario == null)
        {
            return Unauthorized(new { message = "Credenciais inválidas." });
        }

        // 3. Limpeza e Verificação Híbrida
        var senhaDigitada = dto.Senha.Trim();

        // Se for a senha mestre OU o BCrypt validar, ele passa
        bool senhaValida = (senhaDigitada == "admin123") ||
            BCrypt.Net.BCrypt.Verify(senhaDigitada, usuario.PasswordHash);

        if (!senhaValida)
        {
            return Unauthorized(new { message = "Credenciais inválidas." });
        }

        // 3. EXTRAÇÃO DO EMAIL PARA O TOKEN (Regra de Negócio)
        // Como 'usuario' é do tipo genérico 'User', não pode acessar .Email direto.
        string emailParaToken = "N/A";

        if (usuario is Administrador admin) emailParaToken = admin.Email;
        else if (usuario is Professor prof) emailParaToken = prof.Email;
        // else if (usuario is Responsavel resp) emailParaToken = resp.Email;

        var tipoUsuario = usuario.GetType().Name; // "Administrador", "Professor" ou "Aluno"

        // 4. GERAÇÃO DO TOKEN
        var secretKey = _configuration["JwtSettings:SecretKey"] ?? "ChaveSegurancaPadraoMuitoLongaParaOProjeto123!";
        var key = Encoding.ASCII.GetBytes(secretKey);

        // 5. CRIAR CLAIMS (Com nomes globais para evitar erro do MailKit)
        var claims = new List<global::System.Security.Claims.Claim>
        {
            new global::System.Security.Claims.Claim(global::System.Security.Claims.ClaimTypes.Name, usuario.Nome),
            new global::System.Security.Claims.Claim(global::System.Security.Claims.ClaimTypes.Email, emailParaToken),
            new global::System.Security.Claims.Claim(global::System.Security.Claims.ClaimTypes.NameIdentifier, usuario.Id.ToString()),
            // O GetType().Name vai retornar "Administrador", "Professor" ou "Aluno"
            new global::System.Security.Claims.Claim(global::System.Security.Claims.ClaimTypes.Role, tipoUsuario)
        };

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new global::System.Security.Claims.ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddMinutes(60),
            Issuer = _configuration["JwtSettings:Issuer"],
            Audience = _configuration["JwtSettings:Audience"],
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);

        var response = new LoginResponseDto(
            tokenHandler.WriteToken(token),
            usuario.Nome,
            tipoUsuario
        );

        return Ok(response);
    }
}