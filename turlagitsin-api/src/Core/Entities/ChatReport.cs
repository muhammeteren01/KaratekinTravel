using System.ComponentModel.DataAnnotations;

namespace Core.Entities
{
    /// <summary>
    /// Kullanıcının bir firma sohbetini şikayet etmesi.
    ///
    /// Uygulamadaki "Sohbeti Bildir" penceresinde metin kutusu ve "Bildir"
    /// düğmesi vardı ama düğmenin onPress'i boştu: yazılan hiçbir şey hiçbir
    /// yere gitmiyordu.
    ///
    /// Mevcut ReviewReport bu iş için kullanılamadı; o kayıt zorunlu bir
    /// ReviewId taşıyor ve sohbet şikayetinin bağlı olduğu bir değerlendirme
    /// yok.
    /// </summary>
    public class ChatReport : BaseEntity
    {
        /// <summary>Şikayet edilen sohbet grubu.</summary>
        [Required]
        public Guid ChatGroupId { get; set; }

        /// <summary>Sohbetin ait olduğu firma; panelde filtrelemek için.</summary>
        public Guid? CompanyId { get; set; }

        /// <summary>Şikayeti oluşturan kullanıcı.</summary>
        public Guid? ReportedByUserId { get; set; }

        [Required]
        [MaxLength(2000)]
        public string Reason { get; set; } = string.Empty;

        /// <summary>pending | reviewed | dismissed</summary>
        [Required]
        [MaxLength(50)]
        public string Status { get; set; } = "pending";

        /// <summary>Yöneticinin incelerken bıraktığı not.</summary>
        [MaxLength(2000)]
        public string? ResolutionNote { get; set; }

        public DateTime? ReviewedAt { get; set; }

        public Guid? ReviewedByUserId { get; set; }
    }
}
