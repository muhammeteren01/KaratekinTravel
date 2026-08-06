using System.ComponentModel.DataAnnotations;

namespace Core.DTOs.TripDeparture
{
    public class UpdateTripDepartureDto
    {
        public Guid? VehicleId { get; set; }

        public DateTime? DepartureDate { get; set; }

        public TimeSpan? DepartureTime { get; set; }

        public decimal? Price { get; set; }

        public string? Currency { get; set; }

        [Range(1, int.MaxValue)]
        public int? Capacity { get; set; }

        public string? Status { get; set; }

        public string? Notes { get; set; }
    }
}
