using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EduConnect.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateAdminHashFinal : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d"),
                columns: new[] { "CPF", "PasswordHash" },
                values: new object[] { "00000000000", "$2a$11$mC8mByXW8v9O0eS3N6.uP.X7X9IqN6o5A6W8jV7U5F4D3C2B1A0Z." });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d"),
                columns: new[] { "CPF", "PasswordHash" },
                values: new object[] { "000.000.000-00", "$2a$11$K7pIuLp.H.YIq9.kR.S/.O8GjD5R5R5R5R5R5R5R5R5R5R5R5R5R" });
        }
    }
}
