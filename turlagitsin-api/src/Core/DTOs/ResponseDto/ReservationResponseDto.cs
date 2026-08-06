namespace Core.DTOs.ResponseDto
{
    public class ReservationResponseDto
    {
        public string Id { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public string TripId { get; set; } = string.Empty;
        public string? DepartureId { get; set; }
        public string CompanyId { get; set; } = string.Empty;
        public List<int> SeatNumbers { get; set; } = new();
        public decimal TotalAmount { get; set; }
        public string Currency { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty; // "pending", "confirmed", "cancelled"
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
