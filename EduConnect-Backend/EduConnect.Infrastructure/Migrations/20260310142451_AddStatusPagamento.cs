using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EduConnect.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddStatusPagamento : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "StatusPagamento",
                table: "PedidosUniforme",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "StatusPagamento",
                table: "PedidosUniforme");
        }
    }
}
