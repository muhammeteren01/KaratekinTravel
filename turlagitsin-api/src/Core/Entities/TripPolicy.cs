using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Entities
{
    public class TripPolicy : BaseEntity
    {
        [Required]
        public Guid TripId { get; set; }

        [MaxLength(200)]
        public string? Title { get; set; }

        // Navigation Properties
        [ForeignKey("TripId")]
        public virtual Trip Trip { get; set; } = null!;

        public virtual ICollection<TripPolicyParagraph> Paragraphs { get; set; } = new List<TripPolicyParagraph>();
    }
}
