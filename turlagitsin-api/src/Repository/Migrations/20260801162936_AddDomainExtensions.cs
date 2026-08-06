using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Repository.Migrations
{
    /// <inheritdoc />
    public partial class AddDomainExtensions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "CompanyId",
                schema: "public",
                table: "users",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PasswordResetToken",
                schema: "public",
                table: "users",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "PasswordResetTokenExpiresAt",
                schema: "public",
                table: "users",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Role",
                schema: "public",
                table: "users",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "User");

            migrationBuilder.AddColumn<Guid>(
                name: "DepartureId",
                schema: "public",
                table: "reservations",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "coupons",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    CompanyId = table.Column<Guid>(type: "uuid", nullable: true),
                    Type = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Value = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    StartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UsedCount = table.Column<int>(type: "integer", nullable: false),
                    MaxUsage = table.Column<int>(type: "integer", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_coupons", x => x.Id);
                    table.ForeignKey(
                        name: "FK_coupons_companies_CompanyId",
                        column: x => x.CompanyId,
                        principalSchema: "public",
                        principalTable: "companies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "hotels",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CompanyId = table.Column<Guid>(type: "uuid", nullable: true),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Website = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    City = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    District = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Address = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Category = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Image = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    DetailsJson = table.Column<string>(type: "text", nullable: true),
                    IsDraft = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_hotels", x => x.Id);
                    table.ForeignKey(
                        name: "FK_hotels_companies_CompanyId",
                        column: x => x.CompanyId,
                        principalSchema: "public",
                        principalTable: "companies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "payments",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ReservationId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Amount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    Currency = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    Method = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    TransactionId = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    PaidAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_payments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_payments_reservations_ReservationId",
                        column: x => x.ReservationId,
                        principalSchema: "public",
                        principalTable: "reservations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_payments_users_UserId",
                        column: x => x.UserId,
                        principalSchema: "public",
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "refund_requests",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ReservationId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Amount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    Currency = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Reason = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    AdminNote = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    ProcessedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_refund_requests", x => x.Id);
                    table.ForeignKey(
                        name: "FK_refund_requests_reservations_ReservationId",
                        column: x => x.ReservationId,
                        principalSchema: "public",
                        principalTable: "reservations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_refund_requests_users_UserId",
                        column: x => x.UserId,
                        principalSchema: "public",
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "review_reports",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ReviewId = table.Column<Guid>(type: "uuid", nullable: false),
                    ReportedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    Category = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Details = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_review_reports", x => x.Id);
                    table.ForeignKey(
                        name: "FK_review_reports_reviews_ReviewId",
                        column: x => x.ReviewId,
                        principalSchema: "public",
                        principalTable: "reviews",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_review_reports_users_ReportedByUserId",
                        column: x => x.ReportedByUserId,
                        principalSchema: "public",
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "seat_layouts",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CompanyId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Rows = table.Column<int>(type: "integer", nullable: false),
                    SeatsLeft = table.Column<int>(type: "integer", nullable: false),
                    SeatsRight = table.Column<int>(type: "integer", nullable: false),
                    TotalSeats = table.Column<int>(type: "integer", nullable: false),
                    SeatMapJson = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_seat_layouts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_seat_layouts_companies_CompanyId",
                        column: x => x.CompanyId,
                        principalSchema: "public",
                        principalTable: "companies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "vehicles",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CompanyId = table.Column<Guid>(type: "uuid", nullable: false),
                    Plate = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Model = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    BusType = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Capacity = table.Column<int>(type: "integer", nullable: false),
                    HasWifi = table.Column<bool>(type: "boolean", nullable: false),
                    HasAirCondition = table.Column<bool>(type: "boolean", nullable: false),
                    HasPowerOutlet = table.Column<bool>(type: "boolean", nullable: false),
                    CoverImage = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    SeatLayoutId = table.Column<Guid>(type: "uuid", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_vehicles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_vehicles_companies_CompanyId",
                        column: x => x.CompanyId,
                        principalSchema: "public",
                        principalTable: "companies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_vehicles_seat_layouts_SeatLayoutId",
                        column: x => x.SeatLayoutId,
                        principalSchema: "public",
                        principalTable: "seat_layouts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "trip_departures",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TripId = table.Column<Guid>(type: "uuid", nullable: false),
                    VehicleId = table.Column<Guid>(type: "uuid", nullable: true),
                    DepartureDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DepartureTime = table.Column<TimeSpan>(type: "interval", nullable: true),
                    Price = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    Currency = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    Capacity = table.Column<int>(type: "integer", nullable: false),
                    SoldCount = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Notes = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_trip_departures", x => x.Id);
                    table.ForeignKey(
                        name: "FK_trip_departures_trips_TripId",
                        column: x => x.TripId,
                        principalSchema: "public",
                        principalTable: "trips",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_trip_departures_vehicles_VehicleId",
                        column: x => x.VehicleId,
                        principalSchema: "public",
                        principalTable: "vehicles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_users_Role",
                schema: "public",
                table: "users",
                column: "Role");

            migrationBuilder.CreateIndex(
                name: "IX_reservations_DepartureId",
                schema: "public",
                table: "reservations",
                column: "DepartureId");

            migrationBuilder.CreateIndex(
                name: "IX_coupons_Code",
                schema: "public",
                table: "coupons",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_coupons_CompanyId",
                schema: "public",
                table: "coupons",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_coupons_IsActive",
                schema: "public",
                table: "coupons",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_coupons_IsDeleted",
                schema: "public",
                table: "coupons",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_hotels_City",
                schema: "public",
                table: "hotels",
                column: "City");

            migrationBuilder.CreateIndex(
                name: "IX_hotels_CompanyId",
                schema: "public",
                table: "hotels",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_hotels_IsDeleted",
                schema: "public",
                table: "hotels",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_hotels_IsDraft",
                schema: "public",
                table: "hotels",
                column: "IsDraft");

            migrationBuilder.CreateIndex(
                name: "IX_payments_CreatedAt",
                schema: "public",
                table: "payments",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_payments_IsDeleted",
                schema: "public",
                table: "payments",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_payments_ReservationId",
                schema: "public",
                table: "payments",
                column: "ReservationId");

            migrationBuilder.CreateIndex(
                name: "IX_payments_Status",
                schema: "public",
                table: "payments",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_payments_UserId",
                schema: "public",
                table: "payments",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_refund_requests_IsDeleted",
                schema: "public",
                table: "refund_requests",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_refund_requests_ReservationId",
                schema: "public",
                table: "refund_requests",
                column: "ReservationId");

            migrationBuilder.CreateIndex(
                name: "IX_refund_requests_Status",
                schema: "public",
                table: "refund_requests",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_refund_requests_UserId",
                schema: "public",
                table: "refund_requests",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_review_reports_IsDeleted",
                schema: "public",
                table: "review_reports",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_review_reports_ReportedByUserId",
                schema: "public",
                table: "review_reports",
                column: "ReportedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_review_reports_ReviewId",
                schema: "public",
                table: "review_reports",
                column: "ReviewId");

            migrationBuilder.CreateIndex(
                name: "IX_review_reports_Status",
                schema: "public",
                table: "review_reports",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_seat_layouts_CompanyId",
                schema: "public",
                table: "seat_layouts",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_seat_layouts_IsDeleted",
                schema: "public",
                table: "seat_layouts",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_trip_departures_DepartureDate",
                schema: "public",
                table: "trip_departures",
                column: "DepartureDate");

            migrationBuilder.CreateIndex(
                name: "IX_trip_departures_IsDeleted",
                schema: "public",
                table: "trip_departures",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_trip_departures_Status",
                schema: "public",
                table: "trip_departures",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_trip_departures_TripId",
                schema: "public",
                table: "trip_departures",
                column: "TripId");

            migrationBuilder.CreateIndex(
                name: "IX_trip_departures_VehicleId",
                schema: "public",
                table: "trip_departures",
                column: "VehicleId");

            migrationBuilder.CreateIndex(
                name: "IX_vehicles_CompanyId",
                schema: "public",
                table: "vehicles",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_vehicles_IsDeleted",
                schema: "public",
                table: "vehicles",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_vehicles_Plate",
                schema: "public",
                table: "vehicles",
                column: "Plate");

            migrationBuilder.CreateIndex(
                name: "IX_vehicles_SeatLayoutId",
                schema: "public",
                table: "vehicles",
                column: "SeatLayoutId");

            migrationBuilder.CreateIndex(
                name: "IX_vehicles_Status",
                schema: "public",
                table: "vehicles",
                column: "Status");

            migrationBuilder.AddForeignKey(
                name: "FK_reservations_trip_departures_DepartureId",
                schema: "public",
                table: "reservations",
                column: "DepartureId",
                principalSchema: "public",
                principalTable: "trip_departures",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_reservations_trip_departures_DepartureId",
                schema: "public",
                table: "reservations");

            migrationBuilder.DropTable(
                name: "coupons",
                schema: "public");

            migrationBuilder.DropTable(
                name: "hotels",
                schema: "public");

            migrationBuilder.DropTable(
                name: "payments",
                schema: "public");

            migrationBuilder.DropTable(
                name: "refund_requests",
                schema: "public");

            migrationBuilder.DropTable(
                name: "review_reports",
                schema: "public");

            migrationBuilder.DropTable(
                name: "trip_departures",
                schema: "public");

            migrationBuilder.DropTable(
                name: "vehicles",
                schema: "public");

            migrationBuilder.DropTable(
                name: "seat_layouts",
                schema: "public");

            migrationBuilder.DropIndex(
                name: "IX_users_Role",
                schema: "public",
                table: "users");

            migrationBuilder.DropIndex(
                name: "IX_reservations_DepartureId",
                schema: "public",
                table: "reservations");

            migrationBuilder.DropColumn(
                name: "CompanyId",
                schema: "public",
                table: "users");

            migrationBuilder.DropColumn(
                name: "PasswordResetToken",
                schema: "public",
                table: "users");

            migrationBuilder.DropColumn(
                name: "PasswordResetTokenExpiresAt",
                schema: "public",
                table: "users");

            migrationBuilder.DropColumn(
                name: "Role",
                schema: "public",
                table: "users");

            migrationBuilder.DropColumn(
                name: "DepartureId",
                schema: "public",
                table: "reservations");
        }
    }
}
