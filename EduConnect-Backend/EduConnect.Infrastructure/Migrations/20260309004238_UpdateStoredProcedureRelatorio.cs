using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EduConnect.Infrastructure.Migrations
{
    public partial class UpdateStoredProcedureRelatorio : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            var sp = @"
                ALTER PROCEDURE sp_RelatorioDesempenhoGeral
                AS
                BEGIN
                    SELECT 
                        u.Id AS AlunoId,
                        u.Nome AS AlunoNome,
                        ISNULL(AVG(n.ValorNota), 0) AS MediaGeral,
                        (SELECT COUNT(Id) FROM Frequencias f WHERE f.AlunoId = u.Id AND f.Presente = 0) AS TotalFaltas
                    FROM Users u
                    LEFT JOIN Notas n ON u.Id = n.AlunoId
                    WHERE u.UserType = 'Aluno' AND u.Ativo = 1
                    GROUP BY u.Id, u.Nome
                END";

            migrationBuilder.Sql(sp);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // O down volta para a versão errada caso precise desfazer
            var sp = @"
                ALTER PROCEDURE sp_RelatorioDesempenhoGeral
                AS
                BEGIN
                    SELECT 
                        a.Id AS AlunoId,
                        a.Nome AS AlunoNome,
                        ISNULL(AVG(n.ValorNota), 0) AS MediaGeral,
                        (SELECT COUNT(Id) FROM Frequencias f WHERE f.AlunoId = a.Id AND f.Presente = 0) AS TotalFaltas
                    FROM Alunos a
                    LEFT JOIN Notas n ON a.Id = n.AlunoId
                    GROUP BY a.Id, a.Nome
                END";

            migrationBuilder.Sql(sp);
        }
    }
}