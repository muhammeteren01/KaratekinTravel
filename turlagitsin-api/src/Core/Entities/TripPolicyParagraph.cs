using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Entities
{
    public class TripPolicyParagraph : BaseEntity
    {
        [Required]
        public Guid PolicyId { get; set; }

        [Required]
        [MaxLength(2000)]
        public string Content { get; set; } = string.Empty;

        public int DisplayOrder { get; set; }

        // Navigation Properties
        [ForeignKey("PolicyId")]
        public virtual TripPolicy Policy { get; set; } = null!;
    }
}
