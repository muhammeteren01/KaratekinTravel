using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Entities
{
    public class Coupon : BaseEntity
    {
        [Required]
        [MaxLength(50)]
        public string Code { get; set; } = string.Empty;

        public Guid? CompanyId { get; set; }

        [Required]
        [MaxLength(20)]
        public string Type { get; set; } = "percent"; // percent | amount

        [Column(TypeName = "decimal(18,2)")]
        public decimal Value { get; set; }

        public DateTime StartDate { get; set; }

        public DateTime EndDate { get; set; }

        public int UsedCount { get; set; }

        public int? MaxUsage { get; set; }

        public bool IsActive { get; set; } = true;

        [ForeignKey("CompanyId")]
        public virtual Company? Company { get; set; }
    }
}
