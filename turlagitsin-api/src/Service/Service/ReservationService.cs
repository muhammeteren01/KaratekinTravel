using Core.DTOs.Reservation;
using Core.DTOs.ResponseDto;
using Core.Entities;
using Core.Repositories;
using Core.Services;
using Core.UnitOfWork;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace Service.Service
{
    public class ReservationService : Service<Reservation>, IReservationService
    {
        private readonly ITripRepository _tripRepository;
        private readonly ITripDepartureRepository _departureRepository;
        private readonly IGenericRepository<Coupon> _couponRepository;
        private readonly IGenericRepository<TripPricing> _pricingRepository;
        private readonly IUnitOfWork _unitOfWork;

        public ReservationService(
            IGenericRepository<Reservation> repository,
            IUnitOfWork unitOfWork,
            ITripRepository tripRepository,
            ITripDepartureRepository departureRepository,
            IGenericRepository<Coupon> couponRepository,
            IGenericRepository<TripPricing> pricingRepository)
            : base(repository, unitOfWork)
        {
            _tripRepository = tripRepository;
            _departureRepository = departureRepository;
            _couponRepository = couponRepository;
            _pricingRepository = pricingRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<List<ReservationResponseDto>> GetAllReservationsAsync()
        {
            var reservations = await _repository.Where(r => true)
                .Include(r => r.User)
                .Include(r => r.Trip)
                .ToListAsync();

            return reservations.Select(MapToResponseDto).ToList();
        }

        public async Task<List<ReservationResponseDto>> GetReservationsByUserIdAsync(Guid userId)
        {
            var reservations = await _repository.Where(r => r.UserId == userId)
                .Include(r => r.User)
                .Include(r => r.Trip)
                .ToListAsync();

            return reservations.Select(MapToResponseDto).ToList();
        }

        public async Task<List<ReservationResponseDto>> GetReservationsByTripIdAsync(Guid tripId)
        {
            var reservations = await _repository.Where(r => r.TripId == tripId)
                .Include(r => r.User)
                .Include(r => r.Trip)
                .ToListAsync();

            return reservations.Select(MapToResponseDto).ToList();
        }

        public async Task<ReservationResponseDto?> GetReservationByIdAsync(Guid id)
        {
            var reservation = await _repository.Where(r => r.Id == id)
                .Include(r => r.User)
                .Include(r => r.Trip)
                .FirstOrDefaultAsync();

            return reservation == null ? null : MapToResponseDto(reservation);
        }

        private ReservationResponseDto MapToResponseDto(Reservation reservation)
        {
            var seatNumbers = new List<int>();
            if (!string.IsNullOrEmpty(reservation.SeatNumbers))
            {
                try
                {
                    seatNumbers = JsonSerializer.Deserialize<List<int>>(reservation.SeatNumbers) ?? new();
                }
                catch
                {
                    seatNumbers = new List<int>();
                }
            }

            return new ReservationResponseDto
            {
                Id = reservation.Id.ToString(),
                UserId = reservation.UserId.ToString(),
                TripId = reservation.TripId.ToString(),
                DepartureId = reservation.DepartureId?.ToString(),
                CompanyId = reservation.CompanyId.ToString(),
                SeatNumbers = seatNumbers,
                TotalAmount = reservation.TotalAmount,
                Currency = reservation.Currency ?? "TRY",
                Status = reservation.Status ?? "pending",
                CreatedAt = reservation.CreatedAt,
                UpdatedAt = reservation.UpdatedAt ?? reservation.CreatedAt
            };
        }

        public async Task<ReservationResponseDto> CreateReservationAsync(CreateReservationDto dto, Guid userId)
        {
            var trip = await _tripRepository.Where(t => t.Id == dto.TripId).FirstOrDefaultAsync();
            if (trip == null)
                throw new Exception("Trip not found");

            TripDeparture? departure = null;
            if (dto.DepartureId.HasValue)
            {
                departure = await _departureRepository
                    .Where(d => d.Id == dto.DepartureId.Value && d.TripId == dto.TripId)
                    .FirstOrDefaultAsync();

                if (departure == null)
                    throw new Exception("Departure not found for this trip");

                var remaining = departure.Capacity - departure.SoldCount;
                if (dto.SeatNumbers.Count > remaining)
                    throw new Exception("Not enough seats available for this departure");
            }

            decimal unitPrice;
            string currency;

            if (departure?.Price != null)
            {
                unitPrice = departure.Price.Value;
                currency = departure.Currency;
            }
            else
            {
                var pricing = await _pricingRepository.Where(p => p.TripId == trip.Id).FirstOrDefaultAsync();
                unitPrice = pricing?.BasePrice ?? 0;
                currency = pricing?.Currency ?? "TRY";
            }

            var totalAmount = unitPrice * Math.Max(dto.SeatNumbers.Count, 1);

            Coupon? appliedCoupon = null;
            if (!string.IsNullOrWhiteSpace(dto.CouponCode))
            {
                var now = DateTime.UtcNow;
                appliedCoupon = await _couponRepository
                    .Where(c => c.Code.ToLower() == dto.CouponCode.Trim().ToLower()
                                && c.IsActive
                                && c.StartDate <= now
                                && c.EndDate >= now)
                    .FirstOrDefaultAsync();

                if (appliedCoupon == null)
                    throw new Exception("Invalid or expired coupon");

                if (appliedCoupon.MaxUsage.HasValue && appliedCoupon.UsedCount >= appliedCoupon.MaxUsage.Value)
                    throw new Exception("Coupon usage limit reached");

                if (appliedCoupon.CompanyId.HasValue && appliedCoupon.CompanyId != trip.CompanyId)
                    throw new Exception("Coupon is not valid for this company");

                if (appliedCoupon.Type.Equals("percent", StringComparison.OrdinalIgnoreCase))
                    totalAmount -= totalAmount * (appliedCoupon.Value / 100m);
                else
                    totalAmount -= appliedCoupon.Value;

                if (totalAmount < 0) totalAmount = 0;
            }

            var reservation = new Reservation
            {
                UserId = userId,
                TripId = dto.TripId,
                DepartureId = dto.DepartureId,
                CompanyId = trip.CompanyId,
                SeatNumbers = JsonSerializer.Serialize(dto.SeatNumbers),
                TotalAmount = totalAmount,
                Currency = currency,
                Status = "pending",
                Notes = dto.Notes
            };

            await _repository.AddAsync(reservation);

            if (appliedCoupon != null)
            {
                appliedCoupon.UsedCount += 1;
                appliedCoupon.UpdatedAt = DateTime.UtcNow;
                _couponRepository.Update(appliedCoupon);
            }

            if (departure != null)
            {
                departure.SoldCount += dto.SeatNumbers.Count;
                departure.UpdatedAt = DateTime.UtcNow;
                _departureRepository.Update(departure);
            }

            await _unitOfWork.SaveChangesAsync();
            return MapToResponseDto(reservation);
        }

        public async Task<ReservationResponseDto?> UpdateReservationStatusAsync(Guid id, UpdateReservationStatusDto dto)
        {
            var reservation = await _repository.Where(r => r.Id == id).FirstOrDefaultAsync();
            if (reservation == null) return null;

            reservation.Status = dto.Status;
            reservation.UpdatedAt = DateTime.UtcNow;

            await UpdateAsync(reservation);
            return await GetReservationByIdAsync(id);
        }

        public async Task<ReservationResponseDto?> ProcessPaymentAsync(ProcessPaymentDto dto)
        {
            var reservation = await _repository.Where(r => r.Id == dto.ReservationId).FirstOrDefaultAsync();
            if (reservation == null) return null;

            reservation.PaymentMethod = dto.PaymentMethod;
            reservation.TransactionId = dto.TransactionId;
            reservation.PaymentDate = DateTime.UtcNow;
            reservation.Status = "completed";
            reservation.UpdatedAt = DateTime.UtcNow;

            await UpdateAsync(reservation);
            return await GetReservationByIdAsync(dto.ReservationId);
        }

        public async Task<bool> CancelReservationAsync(Guid id, string reason)
        {
            var reservation = await _repository.Where(r => r.Id == id).FirstOrDefaultAsync();
            if (reservation == null) return false;

            reservation.Status = "cancelled";
            reservation.CancellationDate = DateTime.UtcNow;
            reservation.CancellationReason = reason;
            reservation.UpdatedAt = DateTime.UtcNow;

            await UpdateAsync(reservation);
            return true;
        }
    }
}
