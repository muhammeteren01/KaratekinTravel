using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Entities
{
    /// <summary>
    /// Bir araç üzerinde yapılan işlemin kaydı (sefer, bakım, yakıt, temizlik).
    ///
    /// Panelin "Geçmiş İşlemler" ekranı bu veriyi gösteriyor ama karşılığında
    /// hiçbir tablo yoktu; ekran sabit örnek satırlarla dolduruluyordu.
    /// </summary>
    public class VehicleOperation : BaseEntity
    {
        [Required]
        public Guid VehicleId { get; set; }

        /// <summary>Sefer | Bakım | Yakıt | Temizlik</summary>
        [Required]
        [MaxLength(50)]
        public string OperationType { get; set; } = string.Empty;

        [MaxLength(150)]
        public string? DriverName { get; set; }

        /// <summary>İşlemin gerçekleştiği an.</summary>
        public DateTime OccurredAt { get; set; } = DateTime.UtcNow;

        [Column(TypeName = "decimal(18,2)")]
        public decimal? Cost { get; set; }

        [MaxLength(10)]
        public string Currency { get; set; } = "TRY";

        [MaxLength(1000)]
        public string? Notes { get; set; }

        [ForeignKey("VehicleId")]
        public virtual Vehicle Vehicle { get; set; } = null!;
    }
}
