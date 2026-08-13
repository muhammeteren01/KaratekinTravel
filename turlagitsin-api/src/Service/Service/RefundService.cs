using Core.DTOs.Refund;
using Core.Entities;
using Core.Repositories;
using Core.Services;
using Core.UnitOfWork;
using Microsoft.EntityFrameworkCore;

namespace Service.Service
{
    public class RefundService : Service<RefundRequest>, IRefundService
    {
        private readonly IReservationRepository _reservationRepository;

        public RefundService(
            IGenericRepository<RefundRequest> repository,
            IUnitOfWork unitOfWork,
            IReservationRepository reservationRepository)
            : base(repository, unitOfWork)
        {
            _reservationRepository = reservationRepository;
        }

        public async Task<RefundRequestDto> CreateAsync(CreateRefundRequestDto dto, Guid userId)
        {
            var reservation = await _reservationRepository
                .Where(r => r.Id == dto.ReservationId && r.UserId == userId)
                .FirstOrDefaultAsync();

            if (reservation == null)
                throw new Exception("Reservation not found");

            var existing = await _repository
                .Where(r => r.ReservationId == dto.ReservationId && r.Status == "pending")
                .AnyAsync();

            if (existing)
                throw new Exception("A pending refund request already exists for this reservation");

            var amount = dto.Amount > 0 ? dto.Amount : reservation.TotalAmount;

            var entity = new RefundRequest
            {
                ReservationId = dto.ReservationId,
                UserId = userId,
                Amount = amount,
                Currency = string.IsNullOrWhiteSpace(dto.Currency) ? reservation.Currency : dto.Currency,
                Status = "pending",
                Reason = dto.Reason
            };

            await AddAsync(entity);
            return MapToDto(entity);
        }

        public async Task<List<RefundRequestDto>> GetAllRefundsAsync()
        {
            var items = await _repository.Where(r => true)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();

            return items.Select(MapToDto).ToList();
        }

        public async Task<List<RefundRequestDto>> GetByCompanyAsync(Guid companyId)
        {
            // İade -> Rezervasyon -> Tur -> Şirket zinciriyle kapsamlanıyor.
            var items = await _repository.Where(r => r.Reservation.Trip.CompanyId == companyId)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();

            return items.Select(MapToDto).ToList();
        }

        public async Task<Guid?> GetOwnerCompanyIdAsync(Guid refundId)
        {
            var item = await _repository.Where(r => r.Id == refundId)
                .Select(r => new { CompanyId = (Guid?)r.Reservation.Trip.CompanyId })
                .FirstOrDefaultAsync();

            return item?.CompanyId;
        }

        public async Task<RefundRequestDto?> UpdateStatusAsync(Guid id, UpdateRefundStatusDto dto)
        {
            var entity = await _repository.Where(r => r.Id == id).FirstOrDefaultAsync();
            if (entity == null) return null;

            entity.Status = dto.Status;
            entity.AdminNote = dto.AdminNote;
            entity.ProcessedAt = DateTime.UtcNow;
            entity.UpdatedAt = DateTime.UtcNow;

            await UpdateAsync(entity);
            return MapToDto(entity);
        }

        private static RefundRequestDto MapToDto(RefundRequest r) => new()
        {
            Id = r.Id,
            ReservationId = r.ReservationId,
            UserId = r.UserId,
            Amount = r.Amount,
            Currency = r.Currency,
            Status = r.Status,
            Reason = r.Reason,
            AdminNote = r.AdminNote,
            ProcessedAt = r.ProcessedAt,
            CreatedAt = r.CreatedAt
        };
    }
}
