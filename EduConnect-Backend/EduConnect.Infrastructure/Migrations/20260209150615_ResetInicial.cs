using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EduConnect.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ResetInicial : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Nome = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CPF = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Ativo = table.Column<bool>(type: "bit", nullable: false),
                    DataCriacao = table.Column<DateTime>(type: "date", nullable: false),
                    UserType = table.Column<string>(type: "nvarchar(13)", maxLength: 13, nullable: false),
                    Cargo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Matricula = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DataNascimento = table.Column<DateTime>(type: "date", nullable: true),
                    Turma = table.Column<int>(type: "int", nullable: true),
                    HistoricoEscolarPath = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RA = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ResponsavelId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    AreaAtuacao = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RP = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Telefone = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Users_Users_ResponsavelId",
                        column: x => x.ResponsavelId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "Ativo", "CPF", "Cargo", "DataCriacao", "Email", "Nome", "PasswordHash", "UserType" },
                values: new object[] { new Guid("a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d"), true, "000.000.000-00", "Coordenador", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "admin@educonnect.com", "Administrador Geral", "$2a$11$R9h/lIPzHZ7fJL6FfPz6eOclM9A3B5Z4G.O9G7P7.G7G7G7G7G7G7", "Administrador" });

            migrationBuilder.CreateIndex(
                name: "IX_Users_ResponsavelId",
                table: "Users",
                column: "ResponsavelId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
