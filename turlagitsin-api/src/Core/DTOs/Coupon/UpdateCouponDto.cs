using System.ComponentModel.DataAnnotations;

namespace Core.DTOs.Coupon
{
    public class UpdateCouponDto
    {
        [MaxLength(50)]
        public string? Code { get; set; }

        public Guid? CompanyId { get; set; }

        [MaxLength(20)]
        public string? Type { get; set; }

        public decimal? Value { get; set; }

        public DateTime? StartDate { get; set; }

        public DateTime? EndDate { get; set; }

        public int? MaxUsage { get; set; }

        public bool? IsActive { get; set; }
    }
}
