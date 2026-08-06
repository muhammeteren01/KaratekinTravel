using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Entities
{
    public class Trip : BaseEntity
    {
        [Required]
        public Guid CompanyId { get; set; }

        [Required]
        [MaxLength(300)]
        public string Title { get; set; } = string.Empty;

        [MaxLength(200)]
        public string? Location { get; set; }

        [MaxLength(100)]
        public string? City { get; set; }

        [MaxLength(100)]
        public string? Region { get; set; }

        [Range(0, 5)]
        public decimal Rating { get; set; }

        public int ReviewCount { get; set; }

        [MaxLength(50)]
        public string? Price { get; set; }

        [MaxLength(50)]
        public string? PeopleCountLabel { get; set; }

        [MaxLength(100)]
        public string? DateRange { get; set; }

        public DateTime? DateStart { get; set; }

        public DateTime? DateEnd { get; set; }

        public int Capacity { get; set; }

        public int JoinedCount { get; set; }

        // URL or base64 — store as text (admin may upload data URLs)
        public string? Image { get; set; }

        public string? HeaderImage { get; set; }

        public string? Description { get; set; }

        public bool IsFeatured { get; set; } = false;

        public bool IsPublished { get; set; } = true;

        public int ViewCount { get; set; } = 0;

        // Navigation Properties
        [ForeignKey("CompanyId")]
        public virtual Company Company { get; set; } = null!;

        public virtual TripPricing? Pricing { get; set; }
        public virtual TripDetails? Details { get; set; }
        public virtual TripPolicy? Policy { get; set; }
        public virtual ICollection<TripGallery> Gallery { get; set; } = new List<TripGallery>();
        public virtual ICollection<TripItinerary> Itinerary { get; set; } = new List<TripItinerary>();
        public virtual ICollection<TripHotel> Hotels { get; set; } = new List<TripHotel>();
        public virtual ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
        public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();
        public virtual ICollection<UserSavedTrip> SavedByUsers { get; set; } = new List<UserSavedTrip>();
        public virtual ICollection<TripDeparture> Departures { get; set; } = new List<TripDeparture>();
    }
}
