using System.ComponentModel.DataAnnotations;

namespace Core.DTOs.Vehicle
{
    public class CreateVehicleDto
    {
        [Required]
        public Guid CompanyId { get; set; }

        [Required]
        [MaxLength(20)]
        public string Plate { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? Model { get; set; }

        [MaxLength(20)]
        public string BusType { get; set; } = "2+1";

        [Range(1, int.MaxValue)]
        public int Capacity { get; set; }

        public bool HasWifi { get; set; }
        public bool HasAirCondition { get; set; }
        public bool HasPowerOutlet { get; set; }

        public string? CoverImage { get; set; }

        public string Status { get; set; } = "active";

        public Guid? SeatLayoutId { get; set; }
    }
}
