using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Entities
{
    public class Vehicle : BaseEntity
    {
        [Required]
        public Guid CompanyId { get; set; }

        [Required]
        [MaxLength(20)]
        public string Plate { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? Model { get; set; }

        [MaxLength(20)]
        public string BusType { get; set; } = "2+1"; // 2+1, 2+2

        public int Capacity { get; set; }

        public bool HasWifi { get; set; }

        public bool HasAirCondition { get; set; }

        public bool HasPowerOutlet { get; set; }

        public string? CoverImage { get; set; }

        [MaxLength(50)]
        public string Status { get; set; } = "active";

        public Guid? SeatLayoutId { get; set; }

        [ForeignKey("CompanyId")]
        public virtual Company Company { get; set; } = null!;

        [ForeignKey("SeatLayoutId")]
        public virtual SeatLayout? SeatLayout { get; set; }

        public virtual ICollection<TripDeparture> Departures { get; set; } = new List<TripDeparture>();
    }
}
