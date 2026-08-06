namespace Core.DTOs.Vehicle
{
    public class VehicleDto
    {
        public Guid Id { get; set; }
        public Guid CompanyId { get; set; }
        public string Plate { get; set; } = string.Empty;
        public string? Model { get; set; }
        public string BusType { get; set; } = "2+1";
        public int Capacity { get; set; }
        public bool HasWifi { get; set; }
        public bool HasAirCondition { get; set; }
        public bool HasPowerOutlet { get; set; }
        public string? CoverImage { get; set; }
        public string Status { get; set; } = "active";
        public Guid? SeatLayoutId { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
