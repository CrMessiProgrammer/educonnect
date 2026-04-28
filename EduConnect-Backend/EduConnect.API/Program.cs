using Microsoft.EntityFrameworkCore;
using EduConnect.Infrastructure.Context;
using EduConnect.Application.Services;
using System.Text;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// 1. Configuração do Banco
builder.Services.AddDbContext<EduConnectDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// 2. Registro dos Serviços (Dependency Injection)
builder.Services.AddScoped<EmailService>();
builder.Services.AddScoped<AlunoService>();
builder.Services.AddScoped<MatriculaService>();
builder.Services.AddScoped<ProfessorService>();
builder.Services.AddScoped<TurmaService>();
builder.Services.AddScoped<BoletimService>();
builder.Services.AddScoped<DashboardService>();
builder.Services.AddScoped<RankingService>();
builder.Services.AddScoped<BoletimPdfService>();
builder.Services.AddScoped<ResponsavelService>();
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<VisitaService>();
builder.Services.AddScoped<UniformeService>();
builder.Services.AddScoped<PagamentoService>();
builder.Services.AddScoped<CalendarioService>();
builder.Services.AddScoped<ComunicadoService>();

builder.Services.AddSignalR(); // Habilita o motor de tempo real

// 3. Controllers e Swagger
// Diz ao .NET: "Se você achar um ciclo infinito, ignore e pare de aprofundar"
builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("PermitirFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173") // A porta padrão do Vite
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

builder.Services.AddEndpointsApiExplorer();
// Configuração do Swagger para suportar JWT
// Swagger Config - Usando nomes completos para evitar erro de referência
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo { Title = "EduConnect API", Version = "v1" });

    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Description = "JWT Authorization header usando o esquema Bearer. Exemplo: \"12345abcdef\"",
        Name = "Authorization",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT"
    });

    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// --- CONFIGURAÇÃO DO JWT ---
var key = Encoding.ASCII.GetBytes(builder.Configuration["JwtSettings:SecretKey"] ?? "ChaveSegurancaMuitoLongaPadrao123!");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ValidateIssuer = false,
            ValidateAudience = false
        };

        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                // Se a requisição for para o Hub, pega o token da URL
                var path = context.HttpContext.Request.Path;
                if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/chathub"))
                {
                    context.Token = accessToken;
                }
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("PermitirFrontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Mapeia o túnel de comunicação do Chat
app.MapHub<EduConnect.API.Hubs.ChatHub>("/chathub");

app.Run();