using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EduConnect.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class CreateTurmaStructure : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Turma",
                table: "Users");

            migrationBuilder.AddColumn<Guid>(
                name: "TurmaId",
                table: "Users",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Turmas",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Nome = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AnoLetivo = table.Column<int>(type: "int", nullable: false),
                    Turno = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Ativa = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Turmas", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ProfessorTurmas",
                columns: table => new
                {
                    ProfessoresId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TurmasId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProfessorTurmas", x => new { x.ProfessoresId, x.TurmasId });
                    table.ForeignKey(
                        name: "FK_ProfessorTurmas_Turmas_TurmasId",
                        column: x => x.TurmasId,
                        principalTable: "Turmas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProfessorTurmas_Users_ProfessoresId",
                        column: x => x.ProfessoresId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Users_TurmaId",
                table: "Users",
                column: "TurmaId");

            migrationBuilder.CreateIndex(
                name: "IX_ProfessorTurmas_TurmasId",
                table: "ProfessorTurmas",
                column: "TurmasId");

            migrationBuilder.AddForeignKey(
                name: "FK_Users_Turmas_TurmaId",
                table: "Users",
                column: "TurmaId",
                principalTable: "Turmas",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Users_Turmas_TurmaId",
                table: "Users");

            migrationBuilder.DropTable(
                name: "ProfessorTurmas");

            migrationBuilder.DropTable(
                name: "Turmas");

            migrationBuilder.DropIndex(
                name: "IX_Users_TurmaId",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "TurmaId",
                table: "Users");

            migrationBuilder.AddColumn<int>(
                name: "Turma",
                table: "Users",
                type: "int",
                nullable: true);
        }
    }
}
