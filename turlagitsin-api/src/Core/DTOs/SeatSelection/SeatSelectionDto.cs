 namespace Core.DTOs.SeatSelection;

public class SeatSelectionDto
{
    public Guid TripId { get; set; }
    public List<int> AvailableSeats { get; set; } = new();
    public List<int> ReservedSeats { get; set; } = new();
    public BusLayoutDto Layout { get; set; } = new();
}