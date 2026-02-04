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
        // 1. Configuração de Herança (TPH)
        modelBuilder.Entity<User>()
            .HasDiscriminator<string>("UserType")
            .HasValue<Aluno>("Aluno")
            .HasValue<Professor>("Professor")
            .HasValue<Responsavel>("Responsavel")
            .HasValue<Administrador>("Administrador");

        // 2. Padronização de Datas (Somente Data, sem Hora)
        // Isso afeta a data de criação de TODOS os usuários
        modelBuilder.Entity<User>()
            .Property(u => u.DataCriacao)
            .HasColumnType("date");

        modelBuilder.Entity<Aluno>()
            .Property(a => a.DataNascimento)
            .HasColumnType("date");

        // 3. Relacionamento Aluno -> Responsavel
        modelBuilder.Entity<Aluno>()
            .HasOne(a => a.Responsavel)
            .WithMany(r => r.Alunos)
            .HasForeignKey(a => a.ResponsavelId)
            .OnDelete(DeleteBehavior.NoAction);

        // 4. Conversão de Enums para String no Banco
        // Assim ficará "Ativo" ou "Pendente" direto no SQL Server
        modelBuilder.Entity<Aluno>()
            .Property(a => a.Status)
            .HasConversion<string>();

        // 5. PADRONIZAÇÃO DE NOMES DE COLUNA
        // Força o EF a usar apenas "Email" para todos, sem o prefixo da classe
        modelBuilder.Entity<Professor>().Property(p => p.Email).HasColumnName("Email");
        modelBuilder.Entity<Administrador>().Property(a => a.Email).HasColumnName("Email");
        modelBuilder.Entity<Responsavel>().Property(r => r.Email).HasColumnName("Email");

        // 6. Seed do Administrador (Dados iniciais do sistema)
        modelBuilder.Entity<Administrador>().HasData(new Administrador
        {
            Id = Guid.Parse("A1B2C3D4-E5F6-4A7B-8C9D-0E1F2A3B4C5D"),
            Nome = "Administrador Geral",
            Email = "admin@educonnect.com",
            PasswordHash = "$2a$11$R9h/lIPzHZ7fJL6FfPz6eOclM9A3B5Z4G.O9G7P7.G7G7G7G7G7G7", // Hash de Admin@123
            CPF = "000.000.000-00",
            Cargo = "Coordenador",
            DataCriacao = new DateTime(2026, 1, 1)
        });

        base.OnModelCreating(modelBuilder);
    }
}