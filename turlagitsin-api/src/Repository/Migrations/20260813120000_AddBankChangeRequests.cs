using System;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Repository;

#nullable disable

namespace Repository.Migrations
{
    /// <summary>
    /// Banka / tahsilat bilgisi değişiklik talebi tablosu ve firmaya eklenen
    /// banka alanları. Panelde form vardı ama "Talebi Kaydet" yalnızca formu
    /// kapatıyor, hiçbir veri kaydedilmiyordu.
    /// </summary>
    [DbContext(typeof(AppDbContext))]
    [Migration("20260813120000_AddBankChangeRequests")]
    public partial class AddBankChangeRequests : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "BankName",
                table: "companies",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BankAccountHolder",
                table: "companies",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Iban",
                table: "companies",
                type: "character varying(34)",
                maxLength: 34,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TaxOffice",
                table: "companies",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TaxNumber",
                table: "companies",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BillingAddress",
                table: "companies",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "bank_change_requests",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CompanyId = table.Column<Guid>(type: "uuid", nullable: false),
                    RequestedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    BankName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    AccountHolder = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Iban = table.Column<string>(type: "character varying(34)", maxLength: 34, nullable: false),
                    TaxOffice = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    TaxNumber = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    BillingAddress = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Reason = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    IbanDocument = table.Column<string>(type: "text", nullable: true),
                    AuthorizationDocument = table.Column<string>(type: "text", nullable: true),
                    TaxCertificate = table.Column<string>(type: "text", nullable: true),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "pending"),
                    ReviewNote = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    ReviewedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ReviewedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_bank_change_requests", x => x.Id);
                    table.ForeignKey(
                        name: "FK_bank_change_requests_companies_CompanyId",
                        column: x => x.CompanyId,
                        principalTable: "companies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_bank_change_requests_CompanyId",
                table: "bank_change_requests",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_bank_change_requests_Status",
                table: "bank_change_requests",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_bank_change_requests_IsDeleted",
                table: "bank_change_requests",
                column: "IsDeleted");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "bank_change_requests");

            migrationBuilder.DropColumn(name: "BankName", table: "companies");
            migrationBuilder.DropColumn(name: "BankAccountHolder", table: "companies");
            migrationBuilder.DropColumn(name: "Iban", table: "companies");
            migrationBuilder.DropColumn(name: "TaxOffice", table: "companies");
            migrationBuilder.DropColumn(name: "TaxNumber", table: "companies");
            migrationBuilder.DropColumn(name: "BillingAddress", table: "companies");
        }
    }
}
