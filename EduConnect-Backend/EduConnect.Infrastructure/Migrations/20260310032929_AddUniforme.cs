using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EduConnect.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddUniforme : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PedidosUniforme",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AlunoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Tamanho = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Peca = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TipoEntrega = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    EnderecoEntrega = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DataPedido = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PedidosUniforme", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PedidosUniforme_Users_AlunoId",
                        column: x => x.AlunoId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PedidosUniforme_AlunoId",
                table: "PedidosUniforme",
                column: "AlunoId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PedidosUniforme");
        }
    }
}
