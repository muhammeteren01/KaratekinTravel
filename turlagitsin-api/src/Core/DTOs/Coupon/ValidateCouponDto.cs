using System.ComponentModel.DataAnnotations;

namespace Core.DTOs.Coupon
{
    public class ValidateCouponDto
    {
        [Required]
        public string Code { get; set; } = string.Empty;
    }

    public class CouponValidationResultDto
    {
        public bool IsValid { get; set; }
        public string? Message { get; set; }
        public string? Code { get; set; }
        public string? Type { get; set; }
        public decimal? Value { get; set; }
        public Guid? CompanyId { get; set; }
    }
}
