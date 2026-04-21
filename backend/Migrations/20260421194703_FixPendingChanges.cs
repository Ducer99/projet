using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FamilyTreeAPI.Migrations
{
    /// <inheritdoc />
    public partial class FixPendingChanges : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Family",
                keyColumn: "FamilyID",
                keyValue: 1,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 21, 19, 47, 3, 48, DateTimeKind.Utc).AddTicks(220));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Family",
                keyColumn: "FamilyID",
                keyValue: 1,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 21, 19, 43, 57, 20, DateTimeKind.Utc).AddTicks(3470));
        }
    }
}
