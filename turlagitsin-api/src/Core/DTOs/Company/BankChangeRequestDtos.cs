using System.ComponentModel.DataAnnotations;

namespace Core.DTOs.Company
{
    public class BankChangeRequestDto
    {
        public Guid Id { get; set; }
        public Guid CompanyId { get; set; }
        public string BankName { get; set; } = string.Empty;
        public string AccountHolder { get; set; } = string.Empty;
        public string Iban { get; set; } = string.Empty;
        public string? TaxOffice { get; set; }
        public string? TaxNumber { get; set; }
        public string? BillingAddress { get; set; }
        public string? Reason { get; set; }
        public string Status { get; set; } = "pending";
        public string? ReviewNote { get; set; }
        public DateTime? ReviewedAt { get; set; }
        public DateTime CreatedAt { get; set; }

        /// <summary>Belge yüklendi mi; içerik listede taşınmıyor.</summary>
        public bool HasIbanDocument { get; set; }
        public bool HasAuthorizationDocument { get; set; }
        public bool HasTaxCertificate { get; set; }
    }

    public class CreateBankChangeRequestDto
    {
        [Required(ErrorMessage = "Banka adı zorunludur.")]
        [MaxLength(100)]
        public string BankName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Hesap sahibi zorunludur.")]
        [MaxLength(200)]
        public string AccountHolder { get; set; } = string.Empty;

        /// <summary>TR + 24 hane. Boşluklu gelirse sunucuda sadeleştiriliyor.</summary>
        [Required(ErrorMessage = "IBAN zorunludur.")]
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

        public string? IbanDocument { get; set; }
        public string? AuthorizationDocument { get; set; }
        public string? TaxCertificate { get; set; }
    }

    public class ReviewBankChangeRequestDto
    {
        /// <summary>approved | rejected</summary>
        [Required]
        public string Status { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string? ReviewNote { get; set; }
    }

    /// <summary>Firmanın yürürlükteki banka bilgileri (salt okunur gösterim).</summary>
    public class CompanyBankInfoDto
    {
        public string? BankName { get; set; }
        public string? AccountHolder { get; set; }

        /// <summary>Maskeli: TR12 **** **** **** **** 3456</summary>
        public string? IbanMasked { get; set; }
        public string? TaxOffice { get; set; }

        /// <summary>Maskeli: 124******125</summary>
        public string? TaxNumberMasked { get; set; }
        public string? BillingAddress { get; set; }

        /// <summary>Beklemede bir talep varsa yeni talep açılmasın.</summary>
        public bool HasPendingRequest { get; set; }
    }
}
