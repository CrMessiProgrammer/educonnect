using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EduConnect.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FinalFixSecuritySeed : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "Turma",
                table: "Users",
                type: "int",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Administrador_Email",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Professor_Email",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d"),
                columns: new[] { "Cargo", "Administrador_Email", "PasswordHash" },
                values: new object[] { "Coordenador", "admin@educonnect.com", "$2a$11$R9h/lIPzHZ7fJL6FfPz6eOclM9A3B5Z4G.O9G7P7.G7G7G7G7G7G7" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Administrador_Email",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "Professor_Email",
                table: "Users");

            migrationBuilder.AlterColumn<string>(
                name: "Turma",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d"),
                columns: new[] { "Cargo", "Email", "PasswordHash" },
                values: new object[] { "Diretor", "admin@educonnect.com", "Admin@123" });
        }
    }
}
