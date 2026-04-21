using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace FamilyTreeAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddBirthdayNotificationLog : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "BirthdayNotificationLog",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    FamilyId = table.Column<int>(type: "integer", nullable: false),
                    PersonId = table.Column<int>(type: "integer", nullable: false),
                    Year = table.Column<int>(type: "integer", nullable: false),
                    SentAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BirthdayNotificationLog", x => x.Id);
                });

            migrationBuilder.UpdateData(
                table: "Family",
                keyColumn: "FamilyID",
                keyValue: 1,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 21, 21, 56, 36, 117, DateTimeKind.Utc).AddTicks(3900));

            migrationBuilder.CreateIndex(
                name: "IX_BirthdayNotificationLog_FamilyId_PersonId_Year",
                table: "BirthdayNotificationLog",
                columns: new[] { "FamilyId", "PersonId", "Year" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BirthdayNotificationLog");

            migrationBuilder.UpdateData(
                table: "Family",
                keyColumn: "FamilyID",
                keyValue: 1,
                column: "CreatedDate",
                value: new DateTime(2026, 4, 21, 19, 47, 3, 48, DateTimeKind.Utc).AddTicks(220));
        }
    }
}
