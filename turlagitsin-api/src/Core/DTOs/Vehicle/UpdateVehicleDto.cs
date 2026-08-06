using System.ComponentModel.DataAnnotations;

namespace Core.DTOs.Vehicle
{
    public class UpdateVehicleDto
    {
        [MaxLength(20)]
        public string? Plate { get; set; }

        [MaxLength(100)]
        public string? Model { get; set; }

        [MaxLength(20)]
        public string? BusType { get; set; }

        [Range(1, int.MaxValue)]
        public int? Capacity { get; set; }

        public bool? HasWifi { get; set; }
        public bool? HasAirCondition { get; set; }
        public bool? HasPowerOutlet { get; set; }

        public string? CoverImage { get; set; }

        public string? Status { get; set; }

        public Guid? SeatLayoutId { get; set; }
    }
}
