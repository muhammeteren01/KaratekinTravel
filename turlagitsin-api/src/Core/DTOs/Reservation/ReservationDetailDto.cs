using Core.DTOs.Trip;
using Core.DTOs.TripDetails;
using Core.DTOs.Company;

namespace Core.DTOs.Reservation
{
    public class ReservationDetailDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public Guid TripId { get; set; }
        public List<int> SeatNumbers { get; set; } = new();
        public decimal TotalAmount { get; set; }
        public string Currency { get; set; } = "TRY";
        public string Status { get; set; } = "pending";
        public string? Notes { get; set; }
        public string? PaymentMethod { get; set; }
        public string? TransactionId { get; set; }
        public DateTime? PaymentDate { get; set; }
        public DateTime CreatedAt { get; set; }

        // Related Data
        public TripDetailDto? Trip { get; set; }
        public CompanyDto? Company { get; set; }
    }
}