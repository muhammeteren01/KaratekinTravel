namespace Core.DTOs.Refund
{
    public class RefundRequestDto
    {
        public Guid Id { get; set; }
        public Guid ReservationId { get; set; }
        public Guid UserId { get; set; }
        public decimal Amount { get; set; }
        public string Currency { get; set; } = "TRY";
        public string Status { get; set; } = "pending";
        public string? Reason { get; set; }
        public string? AdminNote { get; set; }
        public DateTime? ProcessedAt { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
