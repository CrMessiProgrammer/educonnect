using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EduConnect.Infrastructure.Migrations
{
    public partial class AddStoredProcedureRelatorio : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Comando SQL que cria a Procedure no banco
            var sp = @"
                CREATE PROCEDURE sp_RelatorioDesempenhoGeral
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

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Se precisar reverter a migration, ele apaga a Procedure
            migrationBuilder.Sql("DROP PROCEDURE sp_RelatorioDesempenhoGeral");
        }
    }
}