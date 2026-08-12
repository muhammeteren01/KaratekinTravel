using Core.DTOs.Report;
using Core.DTOs.TripStatics;
using Core.Entities;
using Core.Repositories;
using Core.Services;
using Microsoft.EntityFrameworkCore;

namespace Service.Service
{
    public class ReportService : IReportService
    {
        private readonly ITripRepository _tripRepository;
        private readonly ICompanyRepository _companyRepository;
        private readonly IReservationRepository _reservationRepository;
        private readonly IPaymentRepository _paymentRepository;
        private readonly IRefundRequestRepository _refundRepository;
        private readonly IReviewRepository _reviewRepository;
        private readonly IUserRepository _userRepository;

        public ReportService(
            ITripRepository tripRepository,
            ICompanyRepository companyRepository,
            IReservationRepository reservationRepository,
            IPaymentRepository paymentRepository,
            IRefundRequestRepository refundRepository,
            IReviewRepository reviewRepository,
            IUserRepository userRepository)
        {
            _tripRepository = tripRepository;
            _companyRepository = companyRepository;
            _reservationRepository = reservationRepository;
            _paymentRepository = paymentRepository;
            _refundRepository = refundRepository;
            _reviewRepository = reviewRepository;
            _userRepository = userRepository;
        }

        public async Task<TripReportDto> GetTripReportAsync(DateTime start, DateTime end, Guid? companyId = null)
        {
            // companyId verilirse rapor o şirketle sınırlanır; CompanyAdmin
            // hesapları platform geneli rakamları görmemeli.
            var tripQuery = _tripRepository
                .Where(t => t.CreatedAt >= start && t.CreatedAt <= end);

            if (companyId.HasValue)
                tripQuery = tripQuery.Where(t => t.CompanyId == companyId.Value);

            var trips = await tripQuery
                .Include(t => t.Reservations)
                .Include(t => t.Reviews)
                .ToListAsync();

            var reservationQuery = _reservationRepository
                .Where(r => r.CreatedAt >= start && r.CreatedAt <= end);

            if (companyId.HasValue)
                reservationQuery = reservationQuery.Where(r => r.Trip.CompanyId == companyId.Value);

            var reservations = await reservationQuery.ToListAsync();

            var completedStatuses = new[] { "completed", "confirmed", "paid" };
            var totalRevenue = reservations
                .Where(r => completedStatuses.Contains(r.Status.ToLower()))
                .Sum(r => r.TotalAmount);

            var topTrips = trips
                .OrderByDescending(t => t.Reservations.Count)
                .Take(10)
                .Select(t => new TripStaticsDto
                {
                    TripId = t.Id,
                    Title = t.Title,
                    Capacity = t.Capacity,
                    JoinedCount = t.JoinedCount,
                    ViewCount = t.ViewCount,
                    TotalReservations = t.Reservations.Count,
                    TotalReviews = t.Reviews.Count,
                    AvgReviewRating = t.Reviews.Any() ? (decimal)t.Reviews.Average(r => r.Rating) : 0,
                    ConfirmedReservations = t.Reservations.Count(r => completedStatuses.Contains((r.Status ?? "").ToLower())),
                    CancelledReservations = t.Reservations.Count(r => (r.Status ?? "").ToLower() == "cancelled")
                })
                .ToList();

            return new TripReportDto
            {
                StartDate = start,
                EndDate = end,
                TotalTrips = trips.Count,
                CompletedTrips = trips.Count(t => t.DateEnd.HasValue && t.DateEnd < DateTime.UtcNow),
                CancelledTrips = trips.Count(t => !t.IsPublished),
                TotalRevenue = totalRevenue,
                TotalReservations = reservations.Count,
                AverageRating = trips.Any() ? trips.Average(t => t.Rating) : 0,
                TopTrips = topTrips
            };
        }

        public async Task<CompanyReportDto> GetCompanyReportAsync(DateTime? start = null, DateTime? end = null)
        {
            var companiesQuery = _companyRepository.Where(c => true);
            var companies = await companiesQuery
                .Include(c => c.Trips)
                .Include(c => c.Reviews)
                .ToListAsync();

            var reservations = await _reservationRepository.Where(r => true).ToListAsync();
            if (start.HasValue)
                reservations = reservations.Where(r => r.CreatedAt >= start.Value).ToList();
            if (end.HasValue)
                reservations = reservations.Where(r => r.CreatedAt <= end.Value).ToList();

            var topCompanies = companies
                .Select(c => new CompanyStaticsDto
                {
                    CompanyId = c.Id,
                    Name = c.Name,
                    Rating = c.Rating,
                    ReviewCount = c.Reviews.Count,
                    TotalTrips = c.Trips.Count,
                    TotalReservations = reservations.Count(r => r.CompanyId == c.Id),
                    PublishedTrips = c.Trips.Count(t => t.IsPublished),
                    FeaturedTrips = c.Trips.Count(t => t.IsFeatured)
                })
                .OrderByDescending(c => c.TotalReservations)
                .Take(10)
                .ToList();

            return new CompanyReportDto
            {
                StartDate = start ?? DateTime.MinValue,
                EndDate = end ?? DateTime.UtcNow,
                TotalCompanies = companies.Count,
                ActiveCompanies = companies.Count(c => c.IsActive),
                AverageCompanyRating = companies.Any() ? companies.Average(c => c.Rating) : 0,
                TopCompanies = topCompanies
            };
        }

        public async Task<FinanceReportDto> GetFinanceReportAsync(Guid? companyId, DateTime start, DateTime end)
        {
            var completedStatuses = new[] { "completed", "confirmed", "paid" };

            var paymentsQuery = _paymentRepository.Where(p =>
                p.CreatedAt >= start &&
                p.CreatedAt <= end &&
                p.Status.ToLower() == "completed");

            var payments = await paymentsQuery
                .Include(p => p.Reservation)
                .ThenInclude(r => r.Trip)
                .ToListAsync();

            if (companyId.HasValue)
                payments = payments.Where(p => p.Reservation.CompanyId == companyId.Value).ToList();

            var refundsQuery = _refundRepository.Where(r =>
                r.CreatedAt >= start &&
                r.CreatedAt <= end &&
                (r.Status == "approved" || r.Status == "refunded"));

            var refunds = await refundsQuery
                .Include(r => r.Reservation)
                .ToListAsync();

            if (companyId.HasValue)
                refunds = refunds.Where(r => r.Reservation.CompanyId == companyId.Value).ToList();

            var totalRevenue = payments.Sum(p => p.Amount);
            var refundAmount = refunds.Sum(r => r.Amount);

            var tripEarnings = payments
                .GroupBy(p => p.Reservation.TripId)
                .Select(g =>
                {
                    var trip = g.First().Reservation.Trip;
                    var tripRefunds = refunds
                        .Where(r => r.Reservation.TripId == g.Key)
                        .Sum(r => r.Amount);
                    var revenue = g.Sum(p => p.Amount);

                    return new CompletedTripEarningDto
                    {
                        TourCode = trip?.Id.ToString()[..8] ?? g.Key.ToString()[..8],
                        TourName = trip?.Title ?? "Unknown",
                        TourDate = trip?.DateStart ?? g.Min(p => p.CreatedAt),
                        NetEarning = revenue - tripRefunds
                    };
                })
                .OrderByDescending(e => e.NetEarning)
                .ToList();

            return new FinanceReportDto
            {
                TotalRevenue = totalRevenue,
                RefundAmount = refundAmount,
                NetProfit = totalRevenue - refundAmount,
                PeriodStart = start,
                PeriodEnd = end,
                CompletedTripEarnings = tripEarnings
            };
        }

        public async Task<List<UserActivityDto>> GetUserActivityAsync()
        {
            var users = await _userRepository.Where(u => true).ToListAsync();
            var reservations = await _reservationRepository.Where(r => true).ToListAsync();
            var reviews = await _reviewRepository.Where(r => true).ToListAsync();

            var completedStatuses = new[] { "completed", "confirmed", "paid" };

            return users.Select(u =>
            {
                var userReservations = reservations.Where(r => r.UserId == u.Id).ToList();
                return new UserActivityDto
                {
                    UserId = u.Id,
                    Name = u.Name,
                    TotalReservations = userReservations.Count,
                    TotalReviews = reviews.Count(r => r.UserId == u.Id),
                    TotalSpent = userReservations
                        .Where(r => completedStatuses.Contains((r.Status ?? "").ToLower()))
                        .Sum(r => r.TotalAmount)
                };
            })
            .OrderByDescending(u => u.TotalSpent)
            .ToList();
        }
    }
}
