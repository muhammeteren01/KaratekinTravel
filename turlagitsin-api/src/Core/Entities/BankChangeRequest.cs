using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Entities
{
    /// <summary>
    /// Firmanın banka / tahsilat bilgisi değişiklik talebi.
    ///
    /// Panelde form vardı ama "Talebi Kaydet" düğmesi yalnızca formu
    /// kapatıyordu: girilen hiçbir bilgi hiçbir yere gitmiyordu. Talep
    /// güvenlik gereği doğrudan uygulanmıyor, admin onayından geçiyor.
    /// </summary>
    public class BankChangeRequest : BaseEntity
    {
        [Required]
        public Guid CompanyId { get; set; }

        /// <summary>Talebi oluşturan kullanıcı.</summary>
        public Guid? RequestedByUserId { get; set; }

        [Required]
        [MaxLength(100)]
        public string BankName { get; set; } = string.Empty;

        [Required]
        [MaxLength(200)]
        public string AccountHolder { get; set; } = string.Empty;

        /// <summary>Boşluksuz saklanıyor: TR + 24 hane.</summary>
        [Required]
        [MaxLength(34)]
        public string Iban { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? TaxOffice { get; set; }

        [MaxLength(20)]
        public string? TaxNumber { get; set; }

        [MaxLength(500)]
        public string? BillingAddress { get; set; }

        [MaxLength(1000)]
        public string? Reason { get; set; }

        /// <summary>Belgeler base64 ya da URL olarak tutuluyor.</summary>
        public string? IbanDocument { get; set; }

        public string? AuthorizationDocument { get; set; }

        public string? TaxCertificate { get; set; }

        /// <summary>pending | approved | rejected</summary>
        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "pending";

        [MaxLength(1000)]
        public string? ReviewNote { get; set; }

        public DateTime? ReviewedAt { get; set; }

        public Guid? ReviewedByUserId { get; set; }

        [ForeignKey("CompanyId")]
        public virtual Company Company { get; set; } = null!;
    }
}
