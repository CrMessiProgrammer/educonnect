using Microsoft.EntityFrameworkCore;
using EduConnect.Infrastructure.Context;

var builder = WebApplication.CreateBuilder(args);

// 1. Configuração do Banco
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<EduConnectDbContext>(options =>
    options.UseSqlServer(connectionString));

// 2. Controllers e Swagger
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// 3. Pipeline (Onde o Swagger é ativado)
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();

app.MapControllers();

app.Run();