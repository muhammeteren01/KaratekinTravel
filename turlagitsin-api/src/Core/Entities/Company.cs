using System.ComponentModel.DataAnnotations;


namespace Core.Entities
{
    public class Company : BaseEntity
    {
        [Required]
        [MaxLength(200)]
        public string Name { get; set; }

        [MaxLength(500)]
        public string? Logo { get; set; }

        [Range(0, 10)]
        public decimal Rating { get; set; }

        public int ReviewCount { get; set; }

        [MaxLength(200)]
        public string? Location { get; set; }

        [MaxLength(500)]
        public string? About { get; set; }

        [MaxLength(2000)]
        public string? FullAbout { get; set; }

        [MaxLength(50)]
        public string? TripsLabel { get; set; }

        [MaxLength(50)]
        public string? ParticipantsLabel { get; set; }

        public bool IsActive { get; set; } = true;

        public bool IsVerified { get; set; } = false;

        // Navigation Properties
        public virtual ICollection<Trip> Trips { get; set; } = new List<Trip>();
        public virtual ICollection<CompanyReview> Reviews { get; set; } = new List<CompanyReview>();
        public virtual ICollection<Vehicle> Vehicles { get; set; } = new List<Vehicle>();
        public virtual ICollection<SeatLayout> SeatLayouts { get; set; } = new List<SeatLayout>();
        public virtual ICollection<Coupon> Coupons { get; set; } = new List<Coupon>();
        public virtual ICollection<Hotel> Hotels { get; set; } = new List<Hotel>();
    }
}
