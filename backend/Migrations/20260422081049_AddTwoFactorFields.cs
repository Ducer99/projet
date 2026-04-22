using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FamilyTreeAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddTwoFactorFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "TwoFactorCode",
                table: "Connexion",
                type: "character varying(6)",
                maxLength: 6,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "TwoFactorCodeExpiry",
                table: "Connexion",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "TwoFactorEnabled",
                table: "Connexion",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.UpdateData(
                table: "Family",
                keyColumn: "FamilyID",
                keyValue: 1,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 22, 8, 10, 48, 837, DateTimeKind.Utc).AddTicks(690));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TwoFactorCode",
                table: "Connexion");

            migrationBuilder.DropColumn(
                name: "TwoFactorCodeExpiry",
                table: "Connexion");

            migrationBuilder.DropColumn(
                name: "TwoFactorEnabled",
                table: "Connexion");

            migrationBuilder.UpdateData(
                table: "Family",
                keyColumn: "FamilyID",
                keyValue: 1,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 21, 22, 0, 33, 721, DateTimeKind.Utc).AddTicks(5460));
        }
    }
}
