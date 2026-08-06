using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Entities
{
    public class SeatLayout : BaseEntity
    {
        [Required]
        public Guid CompanyId { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        public int Rows { get; set; }

        public int SeatsLeft { get; set; }

        public int SeatsRight { get; set; }

        public int TotalSeats { get; set; }

        /// <summary>
        /// JSON array of seat type codes per cell, e.g. ["seat","aisle","seat",...]
        /// </summary>
        public string SeatMapJson { get; set; } = "[]";

        [ForeignKey("CompanyId")]
        public virtual Company Company { get; set; } = null!;
    }
}
