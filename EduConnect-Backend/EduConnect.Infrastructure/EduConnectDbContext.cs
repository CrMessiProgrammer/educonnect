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
    public DbSet<Turma> Turmas { get; set; }
    public DbSet<Nota> Notas { get; set; }
    public DbSet<Frequencia> Frequencias { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // 1. Configuração de Herança (TPH)
        modelBuilder.Entity<User>()
            .HasDiscriminator<string>("UserType")
            .HasValue<Aluno>("Aluno")
            .HasValue<Professor>("Professor")
            .HasValue<Responsavel>("Responsavel")
            .HasValue<Administrador>("Administrador");

        // 1.1 Filtro Global (SOFT DELETE)
        // Toda vez que alguém buscar Users, Alunos ou Professores,
        // o EF Core vai adicionar automaticamente "WHERE Ativo = 1"
        modelBuilder.Entity<User>().HasQueryFilter(u => u.Ativo);

        // 1.2 Índices Únicos para segurança de dados
        modelBuilder.Entity<User>().HasIndex(u => u.CPF).IsUnique();

        // Configuração para Professor
        modelBuilder.Entity<Professor>()
            .HasIndex(p => p.Email)
            .IsUnique()
            .HasFilter("[Email] IS NOT NULL"); // Permite múltiplos Alunos sem e-mail

        // Configuração para Responsável
        modelBuilder.Entity<Responsavel>()
            .HasIndex(r => r.Email)
            .IsUnique()
            .HasFilter("[Email] IS NOT NULL");

        // Configuração para Administrador
        modelBuilder.Entity<Administrador>()
            .HasIndex(a => a.Email)
            .IsUnique()
            .HasFilter("[Email] IS NOT NULL");

        modelBuilder.Entity<Aluno>().HasIndex(a => a.RA).IsUnique();
        modelBuilder.Entity<Professor>().HasIndex(p => p.RP).IsUnique();

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

        // Relacionamento 1:N (Turma -> Alunos)
        modelBuilder.Entity<Aluno>()
            .HasOne(a => a.Turma)
            .WithMany(t => t.Alunos)
            .HasForeignKey(a => a.TurmaId)
            .OnDelete(DeleteBehavior.SetNull); // Se deletar a turma, o aluno fica "sem turma"

        // Relacionamento N:N (Professor <-> Turma)
        // O EF Core vai criar a tabela "ProfessorTurmas" automaticamente
        modelBuilder.Entity<Professor>()
            .HasMany(p => p.Turmas)
            .WithMany(t => t.Professores)
            .UsingEntity(j => j.ToTable("ProfessorTurmas"));

        // 6. Seed do Administrador (Dados iniciais do sistema)
        modelBuilder.Entity<Administrador>().HasData(new Administrador
        {
            Id = Guid.Parse("A1B2C3D4-E5F6-4A7B-8C9D-0E1F2A3B4C5D"),
            Nome = "Administrador Geral",
            Email = "admin@educonnect.com",
            PasswordHash = "$2a$11$mC8mByXW8v9O0eS3N6.uP.X7X9IqN6o5A6W8jV7U5F4D3C2B1A0Z.", // Hash de Admin@123
            CPF = "00000000000",
            Cargo = "Coordenador",
            DataCriacao = new DateTime(2026, 1, 1),
            Ativo = true
        });

        // 7. Configurações da Entidade NOTA
        modelBuilder.Entity<Nota>(entity =>
        {
            // Define precisão para a nota (ex: 10.00)
            entity.Property(n => n.ValorNota).HasPrecision(4, 2);

            // Converte o Enum Bimestre para String
            entity.Property(n => n.Bimestre).HasConversion<string>();

            // Evita ciclos de cascata
            entity.HasOne(n => n.Aluno)
                  .WithMany()
                  .HasForeignKey(n => n.AlunoId)
                  .OnDelete(DeleteBehavior.NoAction);

            entity.HasOne(n => n.Professor)
                  .WithMany()
                  .HasForeignKey(n => n.ProfessorId)
                  .OnDelete(DeleteBehavior.NoAction);
        });

        // 8. Configurações da Entidade FREQUENCIA (Chamada)
        modelBuilder.Entity<Frequencia>(entity =>
        {
            entity.HasOne(f => f.Aluno)
                  .WithMany()
                  .HasForeignKey(f => f.AlunoId)
                  .OnDelete(DeleteBehavior.NoAction);

            entity.HasOne(f => f.Professor)
                  .WithMany()
                  .HasForeignKey(f => f.ProfessorId)
                  .OnDelete(DeleteBehavior.NoAction);

            // Garante que a data da aula não venha com hora se não precisar
            entity.Property(f => f.DataAula).HasColumnType("date");
        });

        base.OnModelCreating(modelBuilder);
    }
}