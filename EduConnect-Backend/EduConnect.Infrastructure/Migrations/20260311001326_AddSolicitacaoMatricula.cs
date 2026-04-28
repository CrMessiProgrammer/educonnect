using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EduConnect.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddSolicitacaoMatricula : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "SolicitacoesMatricula",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    NomeAluno = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DataNascimentoAluno = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CpfAluno = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    NomeResponsavel = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CpfResponsavel = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    EmailResponsavel = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TelefoneResponsavel = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DataSolicitacao = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SolicitacoesMatricula", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SolicitacoesMatricula");
        }
    }
}
