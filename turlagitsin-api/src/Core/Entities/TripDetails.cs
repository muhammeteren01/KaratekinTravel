using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Entities
{
    public class TripDetails : BaseEntity
    {
        [Required]
        public Guid TripId { get; set; }

        [MaxLength(2000)]
        public string? SpecialNote { get; set; }

        // Navigation Properties
        [ForeignKey("TripId")]
        public virtual Trip Trip { get; set; } = null!;

        public virtual ICollection<TripIncluded> Included { get; set; } = new List<TripIncluded>();
        public virtual ICollection<TripExcluded> Excluded { get; set; } = new List<TripExcluded>();
    }
}
