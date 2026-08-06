using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using FluentValidation;

namespace Core.Entities
{
    public class TripIncluded : BaseEntity
    {
        [Required]
        public Guid DetailsId { get; set; }

        [Required]
        [MaxLength(500)]
        public string Item { get; set; } = string.Empty;

        public int DisplayOrder { get; set; }

        // Navigation Properties
        [ForeignKey("DetailsId")]
        public virtual TripDetails Details { get; set; } = null!;
    }
}
