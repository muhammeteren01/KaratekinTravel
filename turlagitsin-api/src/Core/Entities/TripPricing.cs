using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace Core.Entities
{
    public class TripPricing : BaseEntity
    {
        [Required]
        public Guid TripId { get; set; }

        [Required]
        [MaxLength(10)]
        public string Currency { get; set; } = "TRY";

        [Column(TypeName = "decimal(18,2)")]
        public decimal BasePrice { get; set; }

        [MaxLength(100)]
        public string? DiscountLabel { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? DiscountAmount { get; set; }

        // Navigation Properties
        [ForeignKey("TripId")]
        public virtual Trip Trip { get; set; } = null!;

        public virtual ICollection<TripPricingExtra> Extras { get; set; } = new List<TripPricingExtra>();
    }
}
