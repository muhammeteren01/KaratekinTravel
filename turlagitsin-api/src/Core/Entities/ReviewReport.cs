using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Entities
{
    public class ReviewReport : BaseEntity
    {
        [Required]
        public Guid ReviewId { get; set; }

        public Guid? ReportedByUserId { get; set; }

        [Required]
        [MaxLength(100)]
        public string Category { get; set; } = string.Empty;

        [MaxLength(2000)]
        public string? Details { get; set; }

        [MaxLength(50)]
        public string Status { get; set; } = "pending"; // pending, reviewed, dismissed

        [ForeignKey("ReviewId")]
        public virtual Review Review { get; set; } = null!;

        [ForeignKey("ReportedByUserId")]
        public virtual User? ReportedByUser { get; set; }
    }
}
