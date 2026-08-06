using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.RegularExpressions;

namespace Core.Entities
{
    public class ItineraryActivity : BaseEntity
    {
        [Required]
        public Guid ItineraryId { get; set; }

        [Required]
        [MaxLength(20)]
        public string Time { get; set; } = string.Empty;

        [Required]
        [MaxLength(300)]
        public string Label { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string? Description { get; set; }

        public int DisplayOrder { get; set; }

        // Navigation Properties
        [ForeignKey("ItineraryId")]
        public virtual TripItinerary Itinerary { get; set; } = null!;
    }
}
