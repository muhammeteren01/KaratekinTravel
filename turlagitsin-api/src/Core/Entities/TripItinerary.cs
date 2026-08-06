using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Entities
{
    public class TripItinerary : BaseEntity
    {
        [Required]
        public Guid TripId { get; set; }

        public int Day { get; set; }

        [Required]
        [MaxLength(300)]
        public string Title { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? DateLabel { get; set; }

        public int? HotelIndex { get; set; }

        [MaxLength(1000)]
        public string? Note { get; set; }

        public int DisplayOrder { get; set; }

        // Navigation Properties
        [ForeignKey("TripId")]
        public virtual Trip Trip { get; set; } = null!;

        public virtual ICollection<ItineraryActivity> Activities { get; set; } = new List<ItineraryActivity>();
    }
}
