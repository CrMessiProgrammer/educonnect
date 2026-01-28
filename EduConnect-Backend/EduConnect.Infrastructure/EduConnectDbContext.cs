using Microsoft.EntityFrameworkCore;
using EduConnect.Domain.Entities;

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

        // SOLUÇÃO PARA O ERRO: Configurar relacionamento Aluno -> Responsavel
        modelBuilder.Entity<Aluno>()
            .HasOne(a => a.Responsavel)
            .WithMany(r => r.Alunos)
            .HasForeignKey(a => a.ResponsavelId)
            .OnDelete(DeleteBehavior.NoAction); // Impedi o "ciclo de deleção"

        base.OnModelCreating(modelBuilder);
    }
}