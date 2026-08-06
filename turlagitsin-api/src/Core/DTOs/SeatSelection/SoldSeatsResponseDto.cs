namespace Core.DTOs.SeatSelection
{
    public class SoldSeatsResponseDto
    {
        public Guid? DepartureId { get; set; }
        public Guid? TripId { get; set; }
        public List<int> SoldSeats { get; set; } = new();
        public int TotalSold { get; set; }
    }
}
