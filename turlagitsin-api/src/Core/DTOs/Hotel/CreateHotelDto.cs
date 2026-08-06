using System.ComponentModel.DataAnnotations;

namespace Core.DTOs.Hotel
{
    public class CreateHotelDto
    {
        public Guid? CompanyId { get; set; }

        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(200)]
        public string? Website { get; set; }

        [MaxLength(100)]
        public string? City { get; set; }

        [MaxLength(100)]
        public string? District { get; set; }

        [MaxLength(500)]
        public string? Address { get; set; }

        [MaxLength(50)]
        public string? Category { get; set; }

        public string? Image { get; set; }

        public string? DetailsJson { get; set; }

        public bool IsDraft { get; set; } = true;
    }
}
