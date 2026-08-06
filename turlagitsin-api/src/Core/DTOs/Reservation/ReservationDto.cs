using Core.DTOs.Trip;
using Core.DTOs.Company;

namespace Core.DTOs.Reservation;

public class ReservationDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid TripId { get; set; }
    public Guid CompanyId { get; set; }
    public List<int> SeatNumbers { get; set; } = new();
    public decimal TotalAmount { get; set; }
    public string Currency { get; set; } = "TRY";
    public string Status { get; set; } = "pending";
    public DateTime CreatedAt { get; set; }
        
    // Related Data
    public TripListDto? Trip { get; set; }
    public CompanyListDto? Company { get; set; }
}