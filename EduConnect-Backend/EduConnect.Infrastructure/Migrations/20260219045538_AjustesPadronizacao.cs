using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EduConnect.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AjustesPadronizacao : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "AreaAtuacao",
                table: "Users",
                newName: "Disciplina");

            // 1. 'Manhã' agora é '0', 'Tarde' é '1', Noturno é '2'.
            // É feito isso enquanto a coluna ainda é texto (string)
            migrationBuilder.Sql("UPDATE Turmas SET Turno = '0' WHERE Turno LIKE 'Manhã%' OR Turno LIKE 'Matutino%'");
            migrationBuilder.Sql("UPDATE Turmas SET Turno = '1' WHERE Turno LIKE 'Tarde%' OR Turno LIKE 'Vespertino%'");
            migrationBuilder.Sql("UPDATE Turmas SET Turno = '2' WHERE Turno LIKE 'Noite%' OR Turno LIKE 'Noturno%'");

            // Se sobrar algum valor que não seja 0, 1 ou 2, defini um padrão (0) para não dar erro
            migrationBuilder.Sql("UPDATE Turmas SET Turno = '0' WHERE Turno NOT IN ('0', '1', '2')");

            // 2. O comando que já estava de alterar a coluna para INT vai funcionar!
            migrationBuilder.AlterColumn<int>(
                name: "Turno",
                table: "Turmas",
                type: "int",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Disciplina",
                table: "Users",
                newName: "AreaAtuacao");

            migrationBuilder.AlterColumn<string>(
                name: "Turno",
                table: "Turmas",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int");
        }
    }
}
