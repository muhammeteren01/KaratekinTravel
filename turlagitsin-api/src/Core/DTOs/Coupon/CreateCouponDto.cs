using System.ComponentModel.DataAnnotations;

namespace Core.DTOs.Coupon
{
    public class CreateCouponDto
    {
        [Required]
        [MaxLength(50)]
        public string Code { get; set; } = string.Empty;

        public Guid? CompanyId { get; set; }

        [Required]
        [MaxLength(20)]
        public string Type { get; set; } = "percent";

        [Range(0.01, double.MaxValue)]
        public decimal Value { get; set; }

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }

        public int? MaxUsage { get; set; }

        public bool IsActive { get; set; } = true;
    }
}
