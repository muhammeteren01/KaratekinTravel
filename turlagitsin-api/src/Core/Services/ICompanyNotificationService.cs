namespace Core.Services
{
    /// <summary>
    /// Firma hesaplarına bildirim düşürür.
    ///
    /// UserNotification tablosu ve /api/notifications uçları vardı ama hiçbir
    /// olay bildirim üretmiyordu: panelin zil düğmesi her zaman boş bir liste
    /// gösteriyordu. Bildirimler firmanın CompanyAdmin kullanıcılarına yazılır.
    /// </summary>
    public interface ICompanyNotificationService
    {
        /// <summary>Yeni rezervasyon alındı.</summary>
        Task NotifyNewReservationAsync(Guid companyId, string tripTitle, string customerName, int seatCount);

        /// <summary>Rezervasyon iptal edildi.</summary>
        Task NotifyReservationCancelledAsync(Guid companyId, string tripTitle, string customerName);

        /// <summary>Yeni iade talebi açıldı.</summary>
        Task NotifyRefundRequestedAsync(Guid companyId, string tripTitle, decimal amount, string currency);

        /// <summary>Tura yeni değerlendirme yazıldı.</summary>
        Task NotifyNewReviewAsync(Guid companyId, string tripTitle, int rating);

        /// <summary>Bir değerlendirme şikayet edildi.</summary>
        Task NotifyReviewReportedAsync(Guid companyId, string tripTitle, string reason);

        /// <summary>
        /// Haftalık ya da aylık özet raporu.
        /// </summary>
        /// <param name="period">weekly | monthly</param>
        Task<int> SendPeriodicDigestAsync(string period, Guid? companyId = null);
    }
}
