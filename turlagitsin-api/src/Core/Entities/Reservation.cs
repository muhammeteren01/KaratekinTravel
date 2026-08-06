using Core.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace Core.Entities
{
    public class Reservation : BaseEntity
    {
        [Required]
        public Guid UserId { get; set; }

        public Guid TripId { get; set; }

        public Guid? DepartureId { get; set; }

        [Required]
        public Guid CompanyId { get; set; }

        [Required]
        public string SeatNumbers { get; set; } // JSON array as string

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalAmount { get; set; }

        [Required]
        public string Currency { get; set; } = "TRY";

        [Required]
        public string Status { get; set; }

        public string? Notes { get; set; }

        public string? PaymentMethod { get; set; }

        public string? TransactionId { get; set; }

        public DateTime? PaymentDate { get; set; }

        public DateTime? CancellationDate { get; set; }

        public string? CancellationReason { get; set; }

        // Navigation Properties
        [ForeignKey("UserId")]
        public virtual User User { get; set; } = null!;

        [ForeignKey("TripId")]
        public virtual Trip Trip { get; set; } = null!;

        [ForeignKey("DepartureId")]
        public virtual TripDeparture? Departure { get; set; }

        [ForeignKey("CompanyId")]
        public virtual Company Company { get; set; } = null!;
    }
}
