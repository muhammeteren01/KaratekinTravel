using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Entities
{
    public class TripPricingExtra : BaseEntity
    {
        [Required]
        public Guid PricingId { get; set; }

        [Required]
        [MaxLength(200)]
        public string Label { get; set; } = string.Empty;

        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }

        public int DisplayOrder { get; set; }

        // Navigation Properties
        [ForeignKey("PricingId")]
        public virtual TripPricing Pricing { get; set; } = null!;
    }
}
