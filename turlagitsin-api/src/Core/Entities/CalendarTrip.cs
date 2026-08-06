using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Core.Enums;

namespace Core.Entities
{
    public class CalendarTrip : BaseEntity
    {
        [Required]
        public DateTime Date { get; set; }

        public bool IsCanceled { get; set; } = false;
        public CalendarStatus Status { get; set; }

        public Guid? UserId { get; set; }

        public Guid? TripId { get; set; }

        // Navigation Properties
        [ForeignKey("TripId")]
        public virtual Trip? Trip { get; set; }

        [ForeignKey("UserId")]
        public virtual User? User { get; set; }
    }
}
