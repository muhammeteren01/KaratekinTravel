using System.ComponentModel.DataAnnotations;

namespace Core.DTOs.Vehicle
{
    public class CreateSeatLayoutDto
    {
        [Required]
        public Guid CompanyId { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Range(1, int.MaxValue)]
        public int Rows { get; set; }

        [Range(0, int.MaxValue)]
        public int SeatsLeft { get; set; }

        [Range(0, int.MaxValue)]
        public int SeatsRight { get; set; }

        [Range(1, int.MaxValue)]
        public int TotalSeats { get; set; }

        public string SeatMapJson { get; set; } = "[]";
    }
}
