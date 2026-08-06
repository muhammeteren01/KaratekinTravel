using System.ComponentModel.DataAnnotations;

namespace Core.DTOs.Refund
{
    public class UpdateRefundStatusDto
    {
        [Required]
        [MaxLength(50)]
        public string Status { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string? AdminNote { get; set; }
    }
}
