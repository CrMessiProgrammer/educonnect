using Microsoft.EntityFrameworkCore;
using EduConnect.Domain.Entities;
using EduConnect.Domain.Helpers;

namespace EduConnect.Infrastructure.Context;

public class EduConnectDbContext : DbContext
{
    public EduConnectDbContext(DbContextOptions<EduConnectDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<Aluno> Alunos { get; set; }
    public DbSet<Professor> Professores { get; set; }
    public DbSet<Responsavel> Responsaveis { get; set; }
    public DbSet<Administrador> Administradores { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Configuração de Herança (TPH)
        modelBuilder.Entity<User>()
            .HasDiscriminator<string>("UserType")
            .HasValue<Aluno>("Aluno")
            .HasValue<Professor>("Professor")
            .HasValue<Responsavel>("Responsavel")
            .HasValue<Administrador>("Administrador");

        // Configura relacionamento Aluno -> Responsavel
        modelBuilder.Entity<Aluno>()
            .HasOne(a => a.Responsavel)
            .WithMany(r => r.Alunos)
            .HasForeignKey(a => a.ResponsavelId)
            .OnDelete(DeleteBehavior.NoAction); // Impedi o "ciclo de deleção"

        // Seed do Administrador Único
        modelBuilder.Entity<Administrador>().HasData(new Administrador
        {
            // ID FIXO (String convertida para Guid)
            Id = Guid.Parse("A1B2C3D4-E5F6-4A7B-8C9D-0E1F2A3B4C5D"),
            Nome = "Administrador Geral",
            Email = "admin@educonnect.com",
            PasswordHash = "$2a$11$R9h/lIPzHZ7fJL6FfPz6eOclM9A3B5Z4G.O9G7P7.G7G7G7G7G7G7", // AGORA COM HASH!
            CPF = "000.000.000-00",
            Cargo = "Coordenador",
            DataCriacao = new DateTime(2026, 1, 1) // Data fixa
        });

        base.OnModelCreating(modelBuilder);
    }
}