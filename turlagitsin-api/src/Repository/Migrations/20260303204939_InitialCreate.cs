using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Repository.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "public");

            migrationBuilder.CreateTable(
                name: "companies",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Logo = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Rating = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    ReviewCount = table.Column<int>(type: "integer", nullable: false),
                    Location = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    About = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    FullAbout = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    TripsLabel = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    ParticipantsLabel = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    IsVerified = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_companies", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "users",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Email = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    PasswordHash = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Location = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Phone = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Avatar = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    IsEmailVerified = table.Column<bool>(type: "boolean", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    LastLoginAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "trips",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CompanyId = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    Location = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    City = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Region = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Rating = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    ReviewCount = table.Column<int>(type: "integer", nullable: false),
                    Price = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    PeopleCountLabel = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    DateRange = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    DateStart = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DateEnd = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Capacity = table.Column<int>(type: "integer", nullable: false),
                    JoinedCount = table.Column<int>(type: "integer", nullable: false),
                    Image = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    HeaderImage = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Description = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    IsFeatured = table.Column<bool>(type: "boolean", nullable: false),
                    IsPublished = table.Column<bool>(type: "boolean", nullable: false),
                    ViewCount = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_trips", x => x.Id);
                    table.ForeignKey(
                        name: "FK_trips_companies_CompanyId",
                        column: x => x.CompanyId,
                        principalSchema: "public",
                        principalTable: "companies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "company_reviews",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CompanyId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    TripName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Rating = table.Column<int>(type: "integer", nullable: false),
                    Comment = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    IsAnonymous = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_company_reviews", x => x.Id);
                    table.ForeignKey(
                        name: "FK_company_reviews_companies_CompanyId",
                        column: x => x.CompanyId,
                        principalSchema: "public",
                        principalTable: "companies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_company_reviews_users_UserId",
                        column: x => x.UserId,
                        principalSchema: "public",
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "user_notifications",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Message = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    Type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    IsRead = table.Column<bool>(type: "boolean", nullable: false),
                    IsArchived = table.Column<bool>(type: "boolean", nullable: false),
                    ActionUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    ActionLabel = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_user_notifications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_user_notifications_users_UserId",
                        column: x => x.UserId,
                        principalSchema: "public",
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "calendar_trips",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsCanceled = table.Column<bool>(type: "boolean", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: true),
                    TripId = table.Column<Guid>(type: "uuid", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_calendar_trips", x => x.Id);
                    table.ForeignKey(
                        name: "FK_calendar_trips_trips_TripId",
                        column: x => x.TripId,
                        principalSchema: "public",
                        principalTable: "trips",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_calendar_trips_users_UserId",
                        column: x => x.UserId,
                        principalSchema: "public",
                        principalTable: "users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "chat_groups",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    GroupName = table.Column<string>(type: "text", nullable: false),
                    TripId = table.Column<Guid>(type: "uuid", nullable: false),
                    Avatar = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    LastMessage = table.Column<string>(type: "text", nullable: true),
                    LastMessageTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_chat_groups", x => x.Id);
                    table.ForeignKey(
                        name: "FK_chat_groups_trips_TripId",
                        column: x => x.TripId,
                        principalSchema: "public",
                        principalTable: "trips",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "reservations",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    TripId = table.Column<Guid>(type: "uuid", nullable: false),
                    CompanyId = table.Column<Guid>(type: "uuid", nullable: false),
                    SeatNumbers = table.Column<string>(type: "text", nullable: false),
                    TotalAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    Currency = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    PaymentMethod = table.Column<string>(type: "text", nullable: true),
                    TransactionId = table.Column<string>(type: "text", nullable: true),
                    PaymentDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CancellationDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CancellationReason = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_reservations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_reservations_companies_CompanyId",
                        column: x => x.CompanyId,
                        principalSchema: "public",
                        principalTable: "companies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_reservations_trips_TripId",
                        column: x => x.TripId,
                        principalSchema: "public",
                        principalTable: "trips",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_reservations_users_UserId",
                        column: x => x.UserId,
                        principalSchema: "public",
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "reviews",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TripId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Rating = table.Column<int>(type: "integer", nullable: false),
                    Comment = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    IsApproved = table.Column<bool>(type: "boolean", nullable: false),
                    IsVerifiedPurchase = table.Column<bool>(type: "boolean", nullable: false),
                    HelpfulCount = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_reviews", x => x.Id);
                    table.ForeignKey(
                        name: "FK_reviews_trips_TripId",
                        column: x => x.TripId,
                        principalSchema: "public",
                        principalTable: "trips",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_reviews_users_UserId",
                        column: x => x.UserId,
                        principalSchema: "public",
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "trip_details",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TripId = table.Column<Guid>(type: "uuid", nullable: false),
                    SpecialNote = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_trip_details", x => x.Id);
                    table.ForeignKey(
                        name: "FK_trip_details_trips_TripId",
                        column: x => x.TripId,
                        principalSchema: "public",
                        principalTable: "trips",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "trip_galleries",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TripId = table.Column<Guid>(type: "uuid", nullable: false),
                    ImageUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    DisplayOrder = table.Column<int>(type: "integer", nullable: false),
                    Caption = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_trip_galleries", x => x.Id);
                    table.ForeignKey(
                        name: "FK_trip_galleries_trips_TripId",
                        column: x => x.TripId,
                        principalSchema: "public",
                        principalTable: "trips",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "trip_hotels",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TripId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Stars = table.Column<int>(type: "integer", nullable: false),
                    Address = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CheckIn = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    CheckOut = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    Phone = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Website = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    MapLink = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    DisplayOrder = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_trip_hotels", x => x.Id);
                    table.ForeignKey(
                        name: "FK_trip_hotels_trips_TripId",
                        column: x => x.TripId,
                        principalSchema: "public",
                        principalTable: "trips",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "trip_itineraries",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TripId = table.Column<Guid>(type: "uuid", nullable: false),
                    Day = table.Column<int>(type: "integer", nullable: false),
                    Title = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    DateLabel = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    HotelIndex = table.Column<int>(type: "integer", nullable: true),
                    Note = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    DisplayOrder = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_trip_itineraries", x => x.Id);
                    table.ForeignKey(
                        name: "FK_trip_itineraries_trips_TripId",
                        column: x => x.TripId,
                        principalSchema: "public",
                        principalTable: "trips",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "trip_policies",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TripId = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_trip_policies", x => x.Id);
                    table.ForeignKey(
                        name: "FK_trip_policies_trips_TripId",
                        column: x => x.TripId,
                        principalSchema: "public",
                        principalTable: "trips",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "trip_pricings",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TripId = table.Column<Guid>(type: "uuid", nullable: false),
                    Currency = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    BasePrice = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    DiscountLabel = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    DiscountAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_trip_pricings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_trip_pricings_trips_TripId",
                        column: x => x.TripId,
                        principalSchema: "public",
                        principalTable: "trips",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "user_saved_trips",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    TripId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_user_saved_trips", x => x.Id);
                    table.ForeignKey(
                        name: "FK_user_saved_trips_trips_TripId",
                        column: x => x.TripId,
                        principalSchema: "public",
                        principalTable: "trips",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_user_saved_trips_users_UserId",
                        column: x => x.UserId,
                        principalSchema: "public",
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "chat_group_members",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    GroupId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Role = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    JoinedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastSeenAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_chat_group_members", x => x.Id);
                    table.ForeignKey(
                        name: "FK_chat_group_members_chat_groups_GroupId",
                        column: x => x.GroupId,
                        principalSchema: "public",
                        principalTable: "chat_groups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_chat_group_members_users_UserId",
                        column: x => x.UserId,
                        principalSchema: "public",
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "chat_messages",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    GroupId = table.Column<Guid>(type: "uuid", nullable: false),
                    SenderId = table.Column<Guid>(type: "uuid", nullable: false),
                    Text = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    IsDelivered = table.Column<bool>(type: "boolean", nullable: false),
                    IsRead = table.Column<bool>(type: "boolean", nullable: false),
                    AttachmentUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    AttachmentType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_chat_messages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_chat_messages_chat_groups_GroupId",
                        column: x => x.GroupId,
                        principalSchema: "public",
                        principalTable: "chat_groups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_chat_messages_users_SenderId",
                        column: x => x.SenderId,
                        principalSchema: "public",
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "trip_excludeds",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    DetailsId = table.Column<Guid>(type: "uuid", nullable: false),
                    Item = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    DisplayOrder = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_trip_excludeds", x => x.Id);
                    table.ForeignKey(
                        name: "FK_trip_excludeds_trip_details_DetailsId",
                        column: x => x.DetailsId,
                        principalSchema: "public",
                        principalTable: "trip_details",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "trip_includeds",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    DetailsId = table.Column<Guid>(type: "uuid", nullable: false),
                    Item = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    DisplayOrder = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_trip_includeds", x => x.Id);
                    table.ForeignKey(
                        name: "FK_trip_includeds_trip_details_DetailsId",
                        column: x => x.DetailsId,
                        principalSchema: "public",
                        principalTable: "trip_details",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "hotel_amenities",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    HotelId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    DisplayOrder = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_hotel_amenities", x => x.Id);
                    table.ForeignKey(
                        name: "FK_hotel_amenities_trip_hotels_HotelId",
                        column: x => x.HotelId,
                        principalSchema: "public",
                        principalTable: "trip_hotels",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "itinerary_activities",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ItineraryId = table.Column<Guid>(type: "uuid", nullable: false),
                    Time = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Label = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    DisplayOrder = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_itinerary_activities", x => x.Id);
                    table.ForeignKey(
                        name: "FK_itinerary_activities_trip_itineraries_ItineraryId",
                        column: x => x.ItineraryId,
                        principalSchema: "public",
                        principalTable: "trip_itineraries",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "trip_policy_paragraphs",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PolicyId = table.Column<Guid>(type: "uuid", nullable: false),
                    Content = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    DisplayOrder = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_trip_policy_paragraphs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_trip_policy_paragraphs_trip_policies_PolicyId",
                        column: x => x.PolicyId,
                        principalSchema: "public",
                        principalTable: "trip_policies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "trip_pricing_extras",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PricingId = table.Column<Guid>(type: "uuid", nullable: false),
                    Label = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Amount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    DisplayOrder = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_trip_pricing_extras", x => x.Id);
                    table.ForeignKey(
                        name: "FK_trip_pricing_extras_trip_pricings_PricingId",
                        column: x => x.PricingId,
                        principalSchema: "public",
                        principalTable: "trip_pricings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_calendar_trips_Date",
                schema: "public",
                table: "calendar_trips",
                column: "Date");

            migrationBuilder.CreateIndex(
                name: "IX_calendar_trips_TripId",
                schema: "public",
                table: "calendar_trips",
                column: "TripId");

            migrationBuilder.CreateIndex(
                name: "IX_calendar_trips_UserId",
                schema: "public",
                table: "calendar_trips",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_chat_group_members_GroupId",
                schema: "public",
                table: "chat_group_members",
                column: "GroupId");

            migrationBuilder.CreateIndex(
                name: "IX_chat_group_members_GroupId_UserId",
                schema: "public",
                table: "chat_group_members",
                columns: new[] { "GroupId", "UserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_chat_group_members_UserId",
                schema: "public",
                table: "chat_group_members",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_chat_groups_CreatedAt",
                schema: "public",
                table: "chat_groups",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_chat_groups_IsActive",
                schema: "public",
                table: "chat_groups",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_chat_groups_TripId",
                schema: "public",
                table: "chat_groups",
                column: "TripId");

            migrationBuilder.CreateIndex(
                name: "IX_chat_messages_CreatedAt",
                schema: "public",
                table: "chat_messages",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_chat_messages_GroupId",
                schema: "public",
                table: "chat_messages",
                column: "GroupId");

            migrationBuilder.CreateIndex(
                name: "IX_chat_messages_SenderId",
                schema: "public",
                table: "chat_messages",
                column: "SenderId");

            migrationBuilder.CreateIndex(
                name: "IX_companies_IsActive",
                schema: "public",
                table: "companies",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_companies_IsDeleted",
                schema: "public",
                table: "companies",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_companies_Name",
                schema: "public",
                table: "companies",
                column: "Name");

            migrationBuilder.CreateIndex(
                name: "IX_companies_Rating",
                schema: "public",
                table: "companies",
                column: "Rating");

            migrationBuilder.CreateIndex(
                name: "IX_company_reviews_CompanyId",
                schema: "public",
                table: "company_reviews",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_company_reviews_CreatedAt",
                schema: "public",
                table: "company_reviews",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_company_reviews_IsAnonymous",
                schema: "public",
                table: "company_reviews",
                column: "IsAnonymous");

            migrationBuilder.CreateIndex(
                name: "IX_company_reviews_IsDeleted",
                schema: "public",
                table: "company_reviews",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_company_reviews_Rating",
                schema: "public",
                table: "company_reviews",
                column: "Rating");

            migrationBuilder.CreateIndex(
                name: "IX_company_reviews_UserId",
                schema: "public",
                table: "company_reviews",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_hotel_amenities_HotelId",
                schema: "public",
                table: "hotel_amenities",
                column: "HotelId");

            migrationBuilder.CreateIndex(
                name: "IX_itinerary_activities_ItineraryId",
                schema: "public",
                table: "itinerary_activities",
                column: "ItineraryId");

            migrationBuilder.CreateIndex(
                name: "IX_reservations_CompanyId",
                schema: "public",
                table: "reservations",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_reservations_CreatedAt",
                schema: "public",
                table: "reservations",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_reservations_IsDeleted",
                schema: "public",
                table: "reservations",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_reservations_Status",
                schema: "public",
                table: "reservations",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_reservations_TripId",
                schema: "public",
                table: "reservations",
                column: "TripId");

            migrationBuilder.CreateIndex(
                name: "IX_reservations_UserId",
                schema: "public",
                table: "reservations",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_reviews_CreatedAt",
                schema: "public",
                table: "reviews",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_reviews_IsApproved",
                schema: "public",
                table: "reviews",
                column: "IsApproved");

            migrationBuilder.CreateIndex(
                name: "IX_reviews_IsDeleted",
                schema: "public",
                table: "reviews",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_reviews_Rating",
                schema: "public",
                table: "reviews",
                column: "Rating");

            migrationBuilder.CreateIndex(
                name: "IX_reviews_TripId",
                schema: "public",
                table: "reviews",
                column: "TripId");

            migrationBuilder.CreateIndex(
                name: "IX_reviews_UserId",
                schema: "public",
                table: "reviews",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_trip_details_TripId",
                schema: "public",
                table: "trip_details",
                column: "TripId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_trip_excludeds_DetailsId",
                schema: "public",
                table: "trip_excludeds",
                column: "DetailsId");

            migrationBuilder.CreateIndex(
                name: "IX_trip_galleries_TripId",
                schema: "public",
                table: "trip_galleries",
                column: "TripId");

            migrationBuilder.CreateIndex(
                name: "IX_trip_hotels_TripId",
                schema: "public",
                table: "trip_hotels",
                column: "TripId");

            migrationBuilder.CreateIndex(
                name: "IX_trip_includeds_DetailsId",
                schema: "public",
                table: "trip_includeds",
                column: "DetailsId");

            migrationBuilder.CreateIndex(
                name: "IX_trip_itineraries_Day",
                schema: "public",
                table: "trip_itineraries",
                column: "Day");

            migrationBuilder.CreateIndex(
                name: "IX_trip_itineraries_TripId",
                schema: "public",
                table: "trip_itineraries",
                column: "TripId");

            migrationBuilder.CreateIndex(
                name: "IX_trip_policies_TripId",
                schema: "public",
                table: "trip_policies",
                column: "TripId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_trip_policy_paragraphs_PolicyId",
                schema: "public",
                table: "trip_policy_paragraphs",
                column: "PolicyId");

            migrationBuilder.CreateIndex(
                name: "IX_trip_pricing_extras_PricingId",
                schema: "public",
                table: "trip_pricing_extras",
                column: "PricingId");

            migrationBuilder.CreateIndex(
                name: "IX_trip_pricings_TripId",
                schema: "public",
                table: "trip_pricings",
                column: "TripId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_trips_City",
                schema: "public",
                table: "trips",
                column: "City");

            migrationBuilder.CreateIndex(
                name: "IX_trips_CompanyId",
                schema: "public",
                table: "trips",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_trips_DateEnd",
                schema: "public",
                table: "trips",
                column: "DateEnd");

            migrationBuilder.CreateIndex(
                name: "IX_trips_DateStart",
                schema: "public",
                table: "trips",
                column: "DateStart");

            migrationBuilder.CreateIndex(
                name: "IX_trips_IsDeleted",
                schema: "public",
                table: "trips",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_trips_IsFeatured",
                schema: "public",
                table: "trips",
                column: "IsFeatured");

            migrationBuilder.CreateIndex(
                name: "IX_trips_IsPublished",
                schema: "public",
                table: "trips",
                column: "IsPublished");

            migrationBuilder.CreateIndex(
                name: "IX_trips_Rating",
                schema: "public",
                table: "trips",
                column: "Rating");

            migrationBuilder.CreateIndex(
                name: "IX_trips_Region",
                schema: "public",
                table: "trips",
                column: "Region");

            migrationBuilder.CreateIndex(
                name: "IX_user_notifications_CreatedAt",
                schema: "public",
                table: "user_notifications",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_user_notifications_IsArchived",
                schema: "public",
                table: "user_notifications",
                column: "IsArchived");

            migrationBuilder.CreateIndex(
                name: "IX_user_notifications_IsRead",
                schema: "public",
                table: "user_notifications",
                column: "IsRead");

            migrationBuilder.CreateIndex(
                name: "IX_user_notifications_UserId",
                schema: "public",
                table: "user_notifications",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_user_saved_trips_TripId",
                schema: "public",
                table: "user_saved_trips",
                column: "TripId");

            migrationBuilder.CreateIndex(
                name: "IX_user_saved_trips_UserId",
                schema: "public",
                table: "user_saved_trips",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_user_saved_trips_UserId_TripId",
                schema: "public",
                table: "user_saved_trips",
                columns: new[] { "UserId", "TripId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_users_CreatedAt",
                schema: "public",
                table: "users",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_users_Email",
                schema: "public",
                table: "users",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_users_IsActive",
                schema: "public",
                table: "users",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_users_IsDeleted",
                schema: "public",
                table: "users",
                column: "IsDeleted");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "calendar_trips",
                schema: "public");

            migrationBuilder.DropTable(
                name: "chat_group_members",
                schema: "public");

            migrationBuilder.DropTable(
                name: "chat_messages",
                schema: "public");

            migrationBuilder.DropTable(
                name: "company_reviews",
                schema: "public");

            migrationBuilder.DropTable(
                name: "hotel_amenities",
                schema: "public");

            migrationBuilder.DropTable(
                name: "itinerary_activities",
                schema: "public");

            migrationBuilder.DropTable(
                name: "reservations",
                schema: "public");

            migrationBuilder.DropTable(
                name: "reviews",
                schema: "public");

            migrationBuilder.DropTable(
                name: "trip_excludeds",
                schema: "public");

            migrationBuilder.DropTable(
                name: "trip_galleries",
                schema: "public");

            migrationBuilder.DropTable(
                name: "trip_includeds",
                schema: "public");

            migrationBuilder.DropTable(
                name: "trip_policy_paragraphs",
                schema: "public");

            migrationBuilder.DropTable(
                name: "trip_pricing_extras",
                schema: "public");

            migrationBuilder.DropTable(
                name: "user_notifications",
                schema: "public");

            migrationBuilder.DropTable(
                name: "user_saved_trips",
                schema: "public");

            migrationBuilder.DropTable(
                name: "chat_groups",
                schema: "public");

            migrationBuilder.DropTable(
                name: "trip_hotels",
                schema: "public");

            migrationBuilder.DropTable(
                name: "trip_itineraries",
                schema: "public");

            migrationBuilder.DropTable(
                name: "trip_details",
                schema: "public");

            migrationBuilder.DropTable(
                name: "trip_policies",
                schema: "public");

            migrationBuilder.DropTable(
                name: "trip_pricings",
                schema: "public");

            migrationBuilder.DropTable(
                name: "users",
                schema: "public");

            migrationBuilder.DropTable(
                name: "trips",
                schema: "public");

            migrationBuilder.DropTable(
                name: "companies",
                schema: "public");
        }
    }
}
