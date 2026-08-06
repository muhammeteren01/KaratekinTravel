using Core.DTOs.Payment;
using Core.Entities;

namespace Core.Services
{
    public interface IPaymentService : IService<Payment>
    {
        Task<List<PaymentDto>> GetByReservationAsync(Guid reservationId);
        Task<List<PaymentDto>> GetByUserAsync(Guid userId);
        Task<PaymentDto> CreateFromPaymentDto(PaymentDto dto);
    }
}
