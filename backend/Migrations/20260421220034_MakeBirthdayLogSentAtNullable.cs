using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FamilyTreeAPI.Migrations
{
    /// <inheritdoc />
    public partial class MakeBirthdayLogSentAtNullable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<DateTime>(
                name: "SentAt",
                table: "BirthdayNotificationLog",
                type: "timestamp with time zone",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            migrationBuilder.UpdateData(
                table: "Family",
                keyColumn: "FamilyID",
                keyValue: 1,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 21, 22, 0, 33, 721, DateTimeKind.Utc).AddTicks(5460));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<DateTime>(
                name: "SentAt",
                table: "BirthdayNotificationLog",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldNullable: true);

            migrationBuilder.UpdateData(
                table: "Family",
                keyColumn: "FamilyID",
                keyValue: 1,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 21, 21, 56, 36, 117, DateTimeKind.Utc).AddTicks(3900));
        }
    }
}
