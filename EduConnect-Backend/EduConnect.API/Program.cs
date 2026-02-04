using Microsoft.EntityFrameworkCore;
using EduConnect.Infrastructure.Context;
using EduConnect.Application.Services; // ADICIONE ESTA LINHA PARA RESOLVER OS ERROS

var builder = WebApplication.CreateBuilder(args);

// 1. Configuração do Banco
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<EduConnectDbContext>(options =>
    options.UseSqlServer(connectionString));

// 2. Registro dos Serviços (Dependency Injection)
builder.Services.AddScoped<EmailService>();
builder.Services.AddScoped<AlunoService>();
builder.Services.AddScoped<MatriculaService>();
builder.Services.AddScoped<ProfessorService>();

// 3. Controllers e Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configura os Controllers e as opções de JSON em uma única corrente
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Isso faz com que os Enums (como TurmaEscolar e Status) 
        // apareçam como TEXTO no Swagger, e não como números.
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });

var app = builder.Build();

// 4. Pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();