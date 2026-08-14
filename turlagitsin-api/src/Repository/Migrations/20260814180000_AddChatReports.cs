using System;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Repository;

#nullable disable

namespace Repository.Migrations
{
    /// <summary>
    /// Sohbet şikayeti tablosu. Uygulamadaki "Sohbeti Bildir" penceresinde
    /// metin kutusu ve "Bildir" düğmesi vardı ama düğme hiçbir şey yapmıyordu.
    ///
    /// Yalnızca yeni tablo ekliyor; mevcut tablolara dokunmuyor.
    /// </summary>
    [DbContext(typeof(AppDbContext))]
    [Migration("20260814180000_AddChatReports")]
    public partial class AddChatReports : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "chat_reports",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ChatGroupId = table.Column<Guid>(type: "uuid", nullable: false),
                    CompanyId = table.Column<Guid>(type: "uuid", nullable: true),
                    ReportedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    Reason = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValue: "pending"),
                    ResolutionNote = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    ReviewedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ReviewedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_chat_reports", x => x.Id);
                    table.ForeignKey(
                        name: "FK_chat_reports_chat_groups_ChatGroupId",
                        column: x => x.ChatGroupId,
                        principalTable: "chat_groups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_chat_reports_ChatGroupId",
                table: "chat_reports",
                column: "ChatGroupId");

            migrationBuilder.CreateIndex(
                name: "IX_chat_reports_CompanyId",
                table: "chat_reports",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_chat_reports_Status",
                table: "chat_reports",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_chat_reports_IsDeleted",
                table: "chat_reports",
                column: "IsDeleted");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "chat_reports");
        }
    }
}
