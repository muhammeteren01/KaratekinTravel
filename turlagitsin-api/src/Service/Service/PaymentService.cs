using Core.DTOs.Payment;
using Core.Entities;
using Core.Repositories;
using Core.Services;
using Core.UnitOfWork;
using Microsoft.EntityFrameworkCore;

namespace Service.Service
{
    public class PaymentService : Service<Payment>, IPaymentService
    {
        public PaymentService(IGenericRepository<Payment> repository, IUnitOfWork unitOfWork)
            : base(repository, unitOfWork)
        {
        }

        public async Task<List<PaymentDto>> GetByReservationAsync(Guid reservationId)
        {
            var items = await _repository.Where(p => p.ReservationId == reservationId)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();

            return items.Select(MapToDto).ToList();
        }

        public async Task<List<PaymentDto>> GetByUserAsync(Guid userId)
        {
            var items = await _repository.Where(p => p.UserId == userId)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();

            return items.Select(MapToDto).ToList();
        }

        public async Task<PaymentDto> CreateFromPaymentDto(PaymentDto dto)
        {
            var entity = new Payment
            {
                ReservationId = dto.ReservationId,
                UserId = dto.UserId,
                Amount = dto.Amount,
                Currency = dto.Currency,
                Method = dto.Method,
                Status = string.IsNullOrWhiteSpace(dto.Status) ? "pending" : dto.Status,
                TransactionId = dto.TransactionId,
                PaidAt = dto.PaidAt ?? (dto.Status == "completed" ? DateTime.UtcNow : null)
            };

            await AddAsync(entity);
            return MapToDto(entity);
        }

        private static PaymentDto MapToDto(Payment p) => new()
        {
            Id = p.Id,
            ReservationId = p.ReservationId,
            UserId = p.UserId,
            Amount = p.Amount,
            Currency = p.Currency,
            Method = p.Method,
            Status = p.Status,
            TransactionId = p.TransactionId,
            PaidAt = p.PaidAt,
            CreatedAt = p.CreatedAt
        };
    }
}
