using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EduConnect.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SeedAdmin : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d"),
                column: "PasswordHash",
                value: "$2a$11$K7pIuLp.H.YIq9.kR.S/.O8GjD5R5R5R5R5R5R5R5R5R5R5R5R5R");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d"),
                column: "PasswordHash",
                value: "$2a$11$R9h/lIPzHZ7fJL6FfPz6eOclM9A3B5Z4G.O9G7P7.G7G7G7G7G7G7");
        }
    }
}
