using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Entities
{
    public class TripDeparture : BaseEntity
    {
        [Required]
        public Guid TripId { get; set; }

        public Guid? VehicleId { get; set; }

        [Required]
        public DateTime DepartureDate { get; set; }

        public TimeSpan? DepartureTime { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? Price { get; set; }

        [MaxLength(10)]
        public string Currency { get; set; } = "TRY";

        public int Capacity { get; set; }

        public int SoldCount { get; set; }

        [MaxLength(50)]
        public string Status { get; set; } = "active"; // active, inactive, cancelled, completed

        [MaxLength(500)]
        public string? Notes { get; set; }

        [ForeignKey("TripId")]
        public virtual Trip Trip { get; set; } = null!;

        [ForeignKey("VehicleId")]
        public virtual Vehicle? Vehicle { get; set; }

        public virtual ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
    }
}
