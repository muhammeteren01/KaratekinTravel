using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Entities
{
    /// <summary>
    /// Independent hotel draft pool (admin hotel management), separate from trip-bound TripHotel.
    /// </summary>
    public class Hotel : BaseEntity
    {
        public Guid? CompanyId { get; set; }

        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(200)]
        public string? Website { get; set; }

        [MaxLength(100)]
        public string? City { get; set; }

        [MaxLength(100)]
        public string? District { get; set; }

        [MaxLength(500)]
        public string? Address { get; set; }

        [MaxLength(50)]
        public string? Category { get; set; }

        public string? Image { get; set; }

        /// <summary>JSON: room capacities, features, extra features, images</summary>
        public string? DetailsJson { get; set; }

        public bool IsDraft { get; set; } = true;

        [ForeignKey("CompanyId")]
        public virtual Company? Company { get; set; }
    }
}
