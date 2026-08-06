namespace Core.DTOs.TripDeparture
{
    public class TripDepartureDto
    {
        public Guid Id { get; set; }
        public Guid TripId { get; set; }
        public Guid? VehicleId { get; set; }
        public DateTime DepartureDate { get; set; }
        public TimeSpan? DepartureTime { get; set; }
        public decimal? Price { get; set; }
        public string Currency { get; set; } = "TRY";
        public int Capacity { get; set; }
        public int SoldCount { get; set; }
        public string Status { get; set; } = "active";
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
