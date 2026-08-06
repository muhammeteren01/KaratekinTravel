namespace Core.DTOs.SeatSelection
{
    public class ReservationPresetDto
    {
        public string Id { get; set; }
        public string CompanyName { get; set; }
        public int DurationHours { get; set; }
        public string DateLabel { get; set; }
        public string BusType { get; set; }
        public List<string> Amenities { get; set; } = new();
        public string? BackgroundImage { get; set; }
        public BusLayoutDto Layout { get; set; } = new();
    }
}