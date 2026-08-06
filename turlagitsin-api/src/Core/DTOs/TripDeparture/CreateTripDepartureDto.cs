using System.ComponentModel.DataAnnotations;

namespace Core.DTOs.TripDeparture
{
    public class CreateTripDepartureDto
    {
        [Required]
        public Guid TripId { get; set; }

        public Guid? VehicleId { get; set; }

        [Required]
        public DateTime DepartureDate { get; set; }

        public TimeSpan? DepartureTime { get; set; }

        public decimal? Price { get; set; }

        public string Currency { get; set; } = "TRY";

        [Range(1, int.MaxValue)]
        public int Capacity { get; set; }

        public string Status { get; set; } = "active";

        public string? Notes { get; set; }
    }
}
