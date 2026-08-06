using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace Core.Entities
{
    public class HotelAmenity : BaseEntity
    {
        [Required]
        public Guid HotelId { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; }

        public int DisplayOrder { get; set; }

        // Navigation Properties
        [ForeignKey("HotelId")]
        public virtual TripHotel Hotel { get; set; } = null!;
    }
}
