using System;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Repository;

#nullable disable

namespace Repository.Migrations
{
    /// <summary>
    /// Araç işlem geçmişi tablosu. Panelin "Geçmiş İşlemler" ekranının
    /// karşılığı olan tablo yoktu; ekran sabit örnek satırlarla doluydu.
    /// </summary>
    [DbContext(typeof(AppDbContext))]
    [Migration("20260812210000_AddVehicleOperations")]
    public partial class AddVehicleOperations : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "vehicle_operations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    VehicleId = table.Column<Guid>(type: "uuid", nullable: false),
                    OperationType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    DriverName = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: true),
                    OccurredAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Cost = table.Column<decimal>(type: "numeric(18,2)", nullable: true),
                    Currency = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false, defaultValue: "TRY"),
                    Notes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_vehicle_operations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_vehicle_operations_vehicles_VehicleId",
                        column: x => x.VehicleId,
                        principalTable: "vehicles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_vehicle_operations_VehicleId",
                table: "vehicle_operations",
                column: "VehicleId");

            migrationBuilder.CreateIndex(
                name: "IX_vehicle_operations_OperationType",
                table: "vehicle_operations",
                column: "OperationType");

            migrationBuilder.CreateIndex(
                name: "IX_vehicle_operations_OccurredAt",
                table: "vehicle_operations",
                column: "OccurredAt");

            migrationBuilder.CreateIndex(
                name: "IX_vehicle_operations_IsDeleted",
                table: "vehicle_operations",
                column: "IsDeleted");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "vehicle_operations");
        }
    }
}
