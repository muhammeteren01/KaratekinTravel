using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Entities
{
    public class TripHotel : BaseEntity
    {
        [Required]
        public Guid TripId { get; set; }

        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        public int Stars { get; set; }

        [MaxLength(500)]
        public string? Address { get; set; }

        [MaxLength(20)]
        public string? CheckIn { get; set; }

        [MaxLength(20)]
        public string? CheckOut { get; set; }

        [MaxLength(1000)]
        public string? Description { get; set; }

        [MaxLength(50)]
        public string? Phone { get; set; }

        [MaxLength(500)]
        public string? Website { get; set; }

        [MaxLength(500)]
        public string? MapLink { get; set; }

        public int DisplayOrder { get; set; }

        // Navigation Properties
        [ForeignKey("TripId")]
        public virtual Trip Trip { get; set; } = null!;

        public virtual ICollection<HotelAmenity> Amenities { get; set; } = new List<HotelAmenity>();
    }
}
