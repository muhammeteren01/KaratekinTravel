using System.ComponentModel.DataAnnotations;

namespace Core.DTOs.Refund
{
    public class CreateRefundRequestDto
    {
        [Required]
        public Guid ReservationId { get; set; }

        [Range(0.01, double.MaxValue)]
        public decimal Amount { get; set; }

        public string Currency { get; set; } = "TRY";

        [MaxLength(1000)]
        public string? Reason { get; set; }
    }
}
