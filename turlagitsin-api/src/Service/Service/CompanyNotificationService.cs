using Core.Entities;
using Core.Enums;
using Core.Repositories;
using Core.Services;
using Core.UnitOfWork;
using Microsoft.EntityFrameworkCore;

namespace Service.Service
{
    /// <summary>
    /// Firma olaylarını bildirime çevirir.
    ///
    /// Bildirim altyapısı (tablo, uçlar, panel ekranı) hazırdı ama hiçbir olay
    /// kayıt üretmiyordu; zil düğmesi her zaman boş listeye açılıyordu.
    /// </summary>
    public class CompanyNotificationService : ICompanyNotificationService
    {
        private readonly IGenericRepository<UserNotification> _notifications;
        private readonly IGenericRepository<User> _users;
        private readonly IGenericRepository<Reservation> _reservations;
        private readonly IGenericRepository<Company> _companies;
        private readonly IUnitOfWork _unitOfWork;

        public CompanyNotificationService(
            IGenericRepository<UserNotification> notifications,
            IGenericRepository<User> users,
            IGenericRepository<Reservation> reservations,
            IGenericRepository<Company> companies,
            IUnitOfWork unitOfWork)
        {
            _notifications = notifications;
            _users = users;
            _reservations = reservations;
            _companies = companies;
            _unitOfWork = unitOfWork;
        }

        public Task NotifyNewReservationAsync(Guid companyId, string tripTitle, string customerName, int seatCount) =>
            FanOutAsync(
                companyId,
                "Yeni rezervasyon",
                $"“{tripTitle}” turuna {customerName} tarafından {seatCount} kişilik rezervasyon yapıldı.",
                "success",
                "Rezervasyonlar");

        public Task NotifyReservationCancelledAsync(Guid companyId, string tripTitle, string customerName) =>
            FanOutAsync(
                companyId,
                "Rezervasyon iptali",
                $"“{tripTitle}” turundaki {customerName} rezervasyonu iptal edildi.",
                "warning",
                "İptal ve İade İşlemleri");

        public Task NotifyRefundRequestedAsync(Guid companyId, string tripTitle, decimal amount, string currency) =>
            FanOutAsync(
                companyId,
                "Yeni iade talebi",
                $"“{tripTitle}” turu için {amount:N2} {currency} tutarında iade talebi açıldı.",
                "warning",
                "İptal ve İade İşlemleri");

        public Task NotifyNewReviewAsync(Guid companyId, string tripTitle, int rating) =>
            FanOutAsync(
                companyId,
                "Yeni değerlendirme",
                $"“{tripTitle}” turuna {rating}/5 puanlı yeni bir değerlendirme yazıldı.",
                rating >= 4 ? "success" : rating >= 3 ? "info" : "warning",
                "Tur Değerlendirmeleri");

        public Task NotifyReviewReportedAsync(Guid companyId, string tripTitle, string reason) =>
            FanOutAsync(
                companyId,
                "Değerlendirme şikayeti",
                $"“{tripTitle}” turundaki bir değerlendirme şikayet edildi. Neden: {reason}",
                "error",
                "Tur Değerlendirmeleri");

        /// <summary>
        /// Dönem özetini firmalara dağıtır. Zamanlayıcıdan ya da
        /// POST /api/notifications/digest ucundan tetiklenir.
        /// </summary>
        public async Task<int> SendPeriodicDigestAsync(string period, Guid? companyId = null)
        {
            var normalized = (period ?? string.Empty).Trim().ToLowerInvariant();
            if (normalized != "weekly" && normalized != "monthly")
                throw new InvalidOperationException("Dönem yalnızca 'weekly' ya da 'monthly' olabilir.");

            var now = DateTime.UtcNow;
            var since = normalized == "weekly" ? now.AddDays(-7) : now.AddMonths(-1);
            var label = normalized == "weekly" ? "Haftalık" : "Aylık";

            var companyQuery = _companies.Where(c => c.IsActive);
            if (companyId.HasValue)
                companyQuery = companyQuery.Where(c => c.Id == companyId.Value);

            var companies = await companyQuery.Select(c => new { c.Id, c.Name }).ToListAsync();
            var sent = 0;

            foreach (var company in companies)
            {
                var rows = await _reservations
                    .Where(r => r.CompanyId == company.Id && r.CreatedAt >= since)
                    .Select(r => new { r.Status, r.TotalAmount, r.Currency })
                    .ToListAsync();

                var total = rows.Count;
                var cancelled = rows.Count(r => r.Status == "cancelled");
                var revenue = rows.Where(r => r.Status != "cancelled").Sum(r => r.TotalAmount);
                var currency = rows.FirstOrDefault()?.Currency ?? "TRY";

                var message = total == 0
                    ? $"{label} dönemde yeni rezervasyon alınmadı."
                    : $"{label} özet: {total} rezervasyon, {cancelled} iptal, {revenue:N2} {currency} ciro.";

                await FanOutAsync(company.Id, $"{label} analiz raporu", message, "info", "Analizler");
                sent++;
            }

            return sent;
        }

        /// <summary>
        /// Bildirimi firmanın yönetici kullanıcılarına yazar. Tek tek
        /// SaveChanges çağırmamak için toplu ekleniyor.
        /// </summary>
        private async Task FanOutAsync(Guid companyId, string title, string message, string type, string? actionPage)
        {
            var recipients = await _users
                .Where(u => u.CompanyId == companyId && u.IsActive && u.Role == UserRole.CompanyAdmin)
                .Select(u => u.Id)
                .ToListAsync();

            if (recipients.Count == 0) return;

            foreach (var userId in recipients)
            {
                await _notifications.AddAsync(new UserNotification
                {
                    UserId = userId,
                    Title = title,
                    Message = message,
                    Type = type,
                    ActionUrl = actionPage,
                    ActionLabel = actionPage == null ? null : "Görüntüle",
                });
            }

            await _unitOfWork.SaveChangesAsync();
        }
    }
}
