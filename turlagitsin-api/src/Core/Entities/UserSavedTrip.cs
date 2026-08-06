using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Entities
{
    public class UserSavedTrip : BaseEntity
    {
        [Required]
        public Guid UserId { get; set; }

        [Required]
        public Guid TripId { get; set; }

        // Navigation Properties
        [ForeignKey("UserId")]
        public virtual User User { get; set; } = null!;

        [ForeignKey("TripId")]
        public virtual Trip Trip { get; set; } = null!;
    }
}
