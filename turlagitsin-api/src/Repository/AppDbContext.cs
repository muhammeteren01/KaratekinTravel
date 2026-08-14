using Microsoft.EntityFrameworkCore;
using Core.Entities; 

namespace Repository
{
    public class AppDbContext : DbContext
    {

        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public DbSet<Company> Companies { get; set; }
        public DbSet<CompanyReview> CompanyReviews { get; set; }
        public DbSet<Trip> Trips { get; set; }
        public DbSet<TripPricing> TripPricings { get; set; }
        public DbSet<TripPricingExtra> TripPricingExtras { get; set; }
        public DbSet<TripDetails> TripDetails { get; set; }
        public DbSet<TripIncluded> TripIncludeds { get; set; }
        public DbSet<TripExcluded> TripExcludeds { get; set; }
        public DbSet<TripPolicy> TripPolicies { get; set; }
        public DbSet<TripPolicyParagraph> TripPolicyParagraphs { get; set; }
        public DbSet<TripGallery> TripGalleries { get; set; }
        public DbSet<TripItinerary> TripItineraries { get; set; }
        public DbSet<ItineraryActivity> ItineraryActivities { get; set; }
        public DbSet<TripHotel> TripHotels { get; set; }
        public DbSet<HotelAmenity> HotelAmenities { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<UserSavedTrip> UserSavedTrips { get; set; }
        public DbSet<Reservation> Reservations { get; set; }
        public DbSet<Review> Reviews { get; set; }
        public DbSet<UserNotification> UserNotifications { get; set; }
        public DbSet<ChatGroup> ChatGroups { get; set; }
        public DbSet<ChatGroupMember> ChatGroupMembers { get; set; }
        public DbSet<ChatMessage> ChatMessages { get; set; }
        public DbSet<ChatReport> ChatReports { get; set; }
        public DbSet<CalendarTrip> CalendarTrips { get; set; }
        public DbSet<TripDeparture> TripDepartures { get; set; }
        public DbSet<Vehicle> Vehicles { get; set; }
        public DbSet<VehicleOperation> VehicleOperations { get; set; }
        public DbSet<BankChangeRequest> BankChangeRequests { get; set; }
        public DbSet<SeatLayout> SeatLayouts { get; set; }
        public DbSet<Coupon> Coupons { get; set; }
        public DbSet<RefundRequest> RefundRequests { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<ReviewReport> ReviewReports { get; set; }
        public DbSet<Hotel> Hotels { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure schema
            modelBuilder.HasDefaultSchema("public");

            // Global query filter for soft delete
            modelBuilder.Entity<Company>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<Trip>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<User>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<Reservation>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<Review>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<CompanyReview>().HasQueryFilter(e => !e.IsDeleted);

            // Apply query filters to related entities to match parent filters
            modelBuilder.Entity<TripPricing>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<TripDetails>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<TripPolicy>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<TripGallery>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<TripItinerary>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<TripHotel>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<UserSavedTrip>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<ChatGroup>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<ChatGroupMember>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<ChatMessage>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<ChatReport>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<UserNotification>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<TripDeparture>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<Vehicle>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<VehicleOperation>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<SeatLayout>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<Coupon>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<RefundRequest>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<Payment>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<ReviewReport>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<Hotel>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<CalendarTrip>().HasQueryFilter(e => !e.IsDeleted);

            // Alt koleksiyonlar: bağlı oldukları ana varlıkta soft-delete
            // filtresi vardı ama burada yoktu. EF bunu açılışta uyarıyordu
            // (10622): filtresi olan bir varlık, filtresi olmayan zorunlu bir
            // bağımlının ana ucuysa, ana kayıt elendiğinde bağımlı kayıtlar
            // beklenmedik sonuç üretebiliyor. Altısı da BaseEntity'den
            // türediği için IsDeleted taşıyor; filtreler eşitlendi.
            modelBuilder.Entity<TripPricingExtra>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<TripIncluded>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<TripExcluded>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<TripPolicyParagraph>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<ItineraryActivity>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<HotelAmenity>().HasQueryFilter(e => !e.IsDeleted);

            // Company Configuration
            modelBuilder.Entity<Company>(entity =>
            {
                entity.ToTable("companies");
                entity.HasIndex(e => e.Name);
                entity.HasIndex(e => e.Rating);
                entity.HasIndex(e => e.IsActive);
                entity.HasIndex(e => e.IsDeleted);

                entity.HasMany(e => e.Trips)
                    .WithOne(e => e.Company)
                    .HasForeignKey(e => e.CompanyId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Trip Configuration
            modelBuilder.Entity<Trip>(entity =>
            {
                entity.ToTable("trips");
                entity.HasIndex(e => e.CompanyId);
                entity.HasIndex(e => e.City);
                entity.HasIndex(e => e.Region);
                entity.HasIndex(e => e.Rating);
                entity.HasIndex(e => e.DateStart);
                entity.HasIndex(e => e.DateEnd);
                entity.HasIndex(e => e.IsFeatured);
                entity.HasIndex(e => e.IsPublished);
                entity.HasIndex(e => e.IsDeleted);

                entity.HasOne(e => e.Pricing)
                    .WithOne(e => e.Trip)
                    .HasForeignKey<TripPricing>(e => e.TripId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Details)
                    .WithOne(e => e.Trip)
                    .HasForeignKey<TripDetails>(e => e.TripId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Policy)
                    .WithOne(e => e.Trip)
                    .HasForeignKey<TripPolicy>(e => e.TripId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Trip Pricing Configuration
            modelBuilder.Entity<TripPricing>(entity =>
            {
                entity.ToTable("trip_pricings");
                entity.HasIndex(e => e.TripId);
                entity.HasQueryFilter(e => !e.IsDeleted);

                entity.HasMany(e => e.Extras)
                    .WithOne(e => e.Pricing)
                    .HasForeignKey(e => e.PricingId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Trip Pricing Extra Configuration
            modelBuilder.Entity<TripPricingExtra>(entity =>
            {
                entity.ToTable("trip_pricing_extras");
                entity.HasIndex(e => e.PricingId);
            });

            // Trip Details Configuration
            modelBuilder.Entity<TripDetails>(entity =>
            {
                entity.ToTable("trip_details");
                entity.HasIndex(e => e.TripId);
                entity.HasQueryFilter(e => !e.IsDeleted);

                entity.HasMany(e => e.Included)
                    .WithOne(e => e.Details)
                    .HasForeignKey(e => e.DetailsId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasMany(e => e.Excluded)
                    .WithOne(e => e.Details)
                    .HasForeignKey(e => e.DetailsId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Trip Included Configuration
            modelBuilder.Entity<TripIncluded>(entity =>
            {
                entity.ToTable("trip_includeds");
                entity.HasIndex(e => e.DetailsId);
            });

            // Trip Excluded Configuration
            modelBuilder.Entity<TripExcluded>(entity =>
            {
                entity.ToTable("trip_excludeds");
                entity.HasIndex(e => e.DetailsId);
            });

            // Trip Policy Configuration
            modelBuilder.Entity<TripPolicy>(entity =>
            {
                entity.ToTable("trip_policies");
                entity.HasIndex(e => e.TripId);
                entity.HasQueryFilter(e => !e.IsDeleted);

                entity.HasMany(e => e.Paragraphs)
                    .WithOne(e => e.Policy)
                    .HasForeignKey(e => e.PolicyId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Trip Policy Paragraph Configuration
            modelBuilder.Entity<TripPolicyParagraph>(entity =>
            {
                entity.ToTable("trip_policy_paragraphs");
                entity.HasIndex(e => e.PolicyId);
            });

            // Trip Gallery Configuration
            modelBuilder.Entity<TripGallery>(entity =>
            {
                entity.ToTable("trip_galleries");
                entity.HasIndex(e => e.TripId);
                entity.HasQueryFilter(e => !e.IsDeleted);
            });

            // Trip Itinerary Configuration
            modelBuilder.Entity<TripItinerary>(entity =>
            {
                entity.ToTable("trip_itineraries");
                entity.HasIndex(e => e.TripId);
                entity.HasIndex(e => e.Day);
                entity.HasQueryFilter(e => !e.IsDeleted);

                entity.HasMany(e => e.Activities)
                    .WithOne(e => e.Itinerary)
                    .HasForeignKey(e => e.ItineraryId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Itinerary Activity Configuration
            modelBuilder.Entity<ItineraryActivity>(entity =>
            {
                entity.ToTable("itinerary_activities");
                entity.HasIndex(e => e.ItineraryId);
            });

            // Trip Hotel Configuration
            modelBuilder.Entity<TripHotel>(entity =>
            {
                entity.ToTable("trip_hotels");
                entity.HasIndex(e => e.TripId);
                entity.HasQueryFilter(e => !e.IsDeleted);

                entity.HasMany(e => e.Amenities)
                    .WithOne(e => e.Hotel)
                    .HasForeignKey(e => e.HotelId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Hotel Amenity Configuration
            modelBuilder.Entity<HotelAmenity>(entity =>
            {
                entity.ToTable("hotel_amenities");
                entity.HasIndex(e => e.HotelId);
            });

            // User Configuration
            modelBuilder.Entity<User>(entity =>
            {
                entity.ToTable("users");
                entity.HasIndex(e => e.Email).IsUnique();
                entity.HasIndex(e => e.IsActive);
                entity.HasIndex(e => e.IsDeleted);
                entity.HasIndex(e => e.CreatedAt);
                entity.HasIndex(e => e.Role);
                entity.Property(e => e.Role).HasMaxLength(50).HasDefaultValue("User");
            });

            // User Saved Trip Configuration
            modelBuilder.Entity<UserSavedTrip>(entity =>
            {
                entity.ToTable("user_saved_trips");
                entity.HasIndex(e => new { e.UserId, e.TripId }).IsUnique();
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.TripId);
                entity.HasQueryFilter(e => !e.IsDeleted);

                entity.HasOne(e => e.User)
                    .WithMany(e => e.SavedTrips)
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Trip)
                    .WithMany(e => e.SavedByUsers)
                    .HasForeignKey(e => e.TripId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Reservation Configuration
            modelBuilder.Entity<Reservation>(entity =>
            {
                entity.ToTable("reservations");
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.TripId);
                entity.HasIndex(e => e.DepartureId);
                entity.HasIndex(e => e.CompanyId);
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.CreatedAt);
                entity.HasIndex(e => e.IsDeleted);

                entity.HasOne(e => e.User)
                    .WithMany(e => e.Reservations)
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Trip)
                    .WithMany(e => e.Reservations)
                    .HasForeignKey(e => e.TripId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Departure)
                    .WithMany(e => e.Reservations)
                    .HasForeignKey(e => e.DepartureId)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            // Review Configuration
            modelBuilder.Entity<Review>(entity =>
            {
                entity.ToTable("reviews");
                entity.HasIndex(e => e.TripId);
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.Rating);
                entity.HasIndex(e => e.IsApproved);
                entity.HasIndex(e => e.CreatedAt);
                entity.HasIndex(e => e.IsDeleted);

                entity.HasOne(e => e.Trip)
                    .WithMany(e => e.Reviews)
                    .HasForeignKey(e => e.TripId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.User)
                    .WithMany(e => e.Reviews)
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Company Review Configuration
            modelBuilder.Entity<CompanyReview>(entity =>
            {
                entity.ToTable("company_reviews");
                entity.HasIndex(e => e.CompanyId);
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.Rating);
                entity.HasIndex(e => e.IsAnonymous);
                entity.HasIndex(e => e.CreatedAt);
                entity.HasIndex(e => e.IsDeleted);

                entity.HasOne(e => e.Company)
                    .WithMany(e => e.Reviews)
                    .HasForeignKey(e => e.CompanyId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.User)
                    .WithMany(e => e.CompanyReviews)
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // User Notification Configuration
            modelBuilder.Entity<UserNotification>(entity =>
            {
                entity.ToTable("user_notifications");
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.IsRead);
                entity.HasIndex(e => e.IsArchived);
                entity.HasIndex(e => e.CreatedAt);
                entity.HasQueryFilter(e => !e.IsDeleted);

                entity.HasOne(e => e.User)
                    .WithMany(e => e.Notifications)
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Chat Group Configuration
            modelBuilder.Entity<ChatGroup>(entity =>
            {
                entity.ToTable("chat_groups");
                entity.HasIndex(e => e.TripId);
                entity.HasIndex(e => e.IsActive);
                entity.HasIndex(e => e.CreatedAt);
                entity.HasQueryFilter(e => !e.IsDeleted);

                entity.HasOne(e => e.Trip)
                    .WithMany()
                    .HasForeignKey(e => e.TripId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Chat Group Member Configuration
            modelBuilder.Entity<ChatGroupMember>(entity =>
            {
                entity.ToTable("chat_group_members");
                entity.HasIndex(e => new { e.GroupId, e.UserId }).IsUnique();
                entity.HasIndex(e => e.GroupId);
                entity.HasIndex(e => e.UserId);
                entity.HasQueryFilter(e => !e.IsDeleted);

                entity.HasOne(e => e.Group)
                    .WithMany(e => e.Members)
                    .HasForeignKey(e => e.GroupId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.User)
                    .WithMany()
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Chat Message Configuration
            modelBuilder.Entity<ChatMessage>(entity =>
            {
                entity.ToTable("chat_messages");
                entity.HasIndex(e => e.GroupId);
                entity.HasIndex(e => e.SenderId);
                entity.HasIndex(e => e.CreatedAt);
                entity.HasQueryFilter(e => !e.IsDeleted);

                entity.HasOne(e => e.Group)
                    .WithMany(e => e.Messages)
                    .HasForeignKey(e => e.GroupId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Sender)
                    .WithMany()
                    .HasForeignKey(e => e.SenderId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Calendar Trip Configuration
            modelBuilder.Entity<CalendarTrip>(entity =>
            {
                entity.ToTable("calendar_trips");
                entity.HasIndex(e => e.Date);
                entity.HasIndex(e => e.TripId);
                entity.HasIndex(e => e.UserId);
                entity.HasQueryFilter(e => !e.IsDeleted);

                entity.HasOne(e => e.Trip)
                    .WithMany()
                    .HasForeignKey(e => e.TripId)
                    .OnDelete(DeleteBehavior.SetNull);

                entity.HasOne(e => e.User)
                    .WithMany()
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.NoAction);
            });

            // Seat Layout Configuration
            modelBuilder.Entity<SeatLayout>(entity =>
            {
                entity.ToTable("seat_layouts");
                entity.HasIndex(e => e.CompanyId);
                entity.HasIndex(e => e.IsDeleted);
                entity.HasQueryFilter(e => !e.IsDeleted);

                entity.HasOne(e => e.Company)
                    .WithMany(e => e.SeatLayouts)
                    .HasForeignKey(e => e.CompanyId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Vehicle Configuration
            // Vehicle Operation Configuration
            modelBuilder.Entity<VehicleOperation>(entity =>
            {
                entity.ToTable("vehicle_operations");
                entity.HasIndex(e => e.VehicleId);
                entity.HasIndex(e => e.OperationType);
                entity.HasIndex(e => e.OccurredAt);
                entity.HasIndex(e => e.IsDeleted);
                entity.HasQueryFilter(e => !e.IsDeleted);

                entity.HasOne(e => e.Vehicle)
                    .WithMany(e => e.Operations)
                    .HasForeignKey(e => e.VehicleId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Chat Report Configuration
            modelBuilder.Entity<ChatReport>(entity =>
            {
                entity.ToTable("chat_reports");
                entity.HasIndex(e => e.ChatGroupId);
                entity.HasIndex(e => e.CompanyId);
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.IsDeleted);
                entity.Property(e => e.Status).HasMaxLength(50).HasDefaultValue("pending");

                // Gezinme ozelligi bilerek yok: sikayet kaydinin sohbeti
                // yuklemesine gerek yok, yalnizca yabanci anahtar taniniyor.
                entity.HasOne<ChatGroup>()
                    .WithMany()
                    .HasForeignKey(e => e.ChatGroupId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Bank Change Request Configuration
            modelBuilder.Entity<BankChangeRequest>(entity =>
            {
                entity.ToTable("bank_change_requests");
                entity.HasIndex(e => e.CompanyId);
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.IsDeleted);
                entity.HasQueryFilter(e => !e.IsDeleted);

                entity.HasOne(e => e.Company)
                    .WithMany()
                    .HasForeignKey(e => e.CompanyId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Vehicle>(entity =>
            {
                entity.ToTable("vehicles");
                entity.HasIndex(e => e.CompanyId);
                entity.HasIndex(e => e.Plate);
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.IsDeleted);
                entity.HasQueryFilter(e => !e.IsDeleted);

                entity.HasOne(e => e.Company)
                    .WithMany(e => e.Vehicles)
                    .HasForeignKey(e => e.CompanyId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.SeatLayout)
                    .WithMany()
                    .HasForeignKey(e => e.SeatLayoutId)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            // Trip Departure Configuration
            modelBuilder.Entity<TripDeparture>(entity =>
            {
                entity.ToTable("trip_departures");
                entity.HasIndex(e => e.TripId);
                entity.HasIndex(e => e.VehicleId);
                entity.HasIndex(e => e.DepartureDate);
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.IsDeleted);
                entity.HasQueryFilter(e => !e.IsDeleted);

                entity.HasOne(e => e.Trip)
                    .WithMany(e => e.Departures)
                    .HasForeignKey(e => e.TripId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Vehicle)
                    .WithMany(e => e.Departures)
                    .HasForeignKey(e => e.VehicleId)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            // Coupon Configuration
            modelBuilder.Entity<Coupon>(entity =>
            {
                entity.ToTable("coupons");
                entity.HasIndex(e => e.Code).IsUnique();
                entity.HasIndex(e => e.CompanyId);
                entity.HasIndex(e => e.IsActive);
                entity.HasIndex(e => e.IsDeleted);
                entity.HasQueryFilter(e => !e.IsDeleted);

                entity.HasOne(e => e.Company)
                    .WithMany(e => e.Coupons)
                    .HasForeignKey(e => e.CompanyId)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            // Refund Request Configuration
            modelBuilder.Entity<RefundRequest>(entity =>
            {
                entity.ToTable("refund_requests");
                entity.HasIndex(e => e.ReservationId);
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.IsDeleted);
                entity.HasQueryFilter(e => !e.IsDeleted);

                entity.HasOne(e => e.Reservation)
                    .WithMany()
                    .HasForeignKey(e => e.ReservationId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.User)
                    .WithMany()
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Payment Configuration
            modelBuilder.Entity<Payment>(entity =>
            {
                entity.ToTable("payments");
                entity.HasIndex(e => e.ReservationId);
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.CreatedAt);
                entity.HasIndex(e => e.IsDeleted);
                entity.HasQueryFilter(e => !e.IsDeleted);

                entity.HasOne(e => e.Reservation)
                    .WithMany()
                    .HasForeignKey(e => e.ReservationId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.User)
                    .WithMany()
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Review Report Configuration
            modelBuilder.Entity<ReviewReport>(entity =>
            {
                entity.ToTable("review_reports");
                entity.HasIndex(e => e.ReviewId);
                entity.HasIndex(e => e.ReportedByUserId);
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.IsDeleted);
                entity.HasQueryFilter(e => !e.IsDeleted);

                entity.HasOne(e => e.Review)
                    .WithMany()
                    .HasForeignKey(e => e.ReviewId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.ReportedByUser)
                    .WithMany()
                    .HasForeignKey(e => e.ReportedByUserId)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            // Hotel (draft pool) Configuration
            modelBuilder.Entity<Hotel>(entity =>
            {
                entity.ToTable("hotels");
                entity.HasIndex(e => e.CompanyId);
                entity.HasIndex(e => e.City);
                entity.HasIndex(e => e.IsDraft);
                entity.HasIndex(e => e.IsDeleted);
                entity.HasQueryFilter(e => !e.IsDeleted);

                entity.HasOne(e => e.Company)
                    .WithMany(e => e.Hotels)
                    .HasForeignKey(e => e.CompanyId)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            // Configure decimal precision for all decimal properties
            foreach (var entityType in modelBuilder.Model.GetEntityTypes())
            {
                var decimalProperties = entityType.ClrType.GetProperties()
                    .Where(p => p.PropertyType == typeof(decimal) || p.PropertyType == typeof(decimal?));

                foreach (var property in decimalProperties)
                {
                    modelBuilder.Entity(entityType.Name)
                        .Property(property.Name)
                        .HasPrecision(18, 2);
                }
            }

            // Seed initial data
            SeedData(modelBuilder);
        }

        private void SeedData(ModelBuilder modelBuilder)
        {

        }

        public override int SaveChanges()
        {
            UpdateTimestamps();
            return base.SaveChanges();
        }

        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            UpdateTimestamps();
            return base.SaveChangesAsync(cancellationToken);
        }

        private void UpdateTimestamps()
        {
            var entries = ChangeTracker.Entries()
                .Where(e => e.Entity is BaseEntity && (
                    e.State == EntityState.Added ||
                    e.State == EntityState.Modified));

            foreach (var entry in entries)
            {
                var entity = (BaseEntity)entry.Entity;

                if (entry.State == EntityState.Added)
                {
                    entity.CreatedAt = DateTime.UtcNow;
                }

                if (entry.State == EntityState.Modified)
                {
                    entity.UpdatedAt = DateTime.UtcNow;
                }
            }
        }
    }
}