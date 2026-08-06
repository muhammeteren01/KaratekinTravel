using Core.DTOs.Refund;
using Core.Entities;

namespace Core.Services
{
    public interface IRefundService : IService<RefundRequest>
    {
        Task<RefundRequestDto> CreateAsync(CreateRefundRequestDto dto, Guid userId);
        Task<List<RefundRequestDto>> GetAllRefundsAsync();
        Task<RefundRequestDto?> UpdateStatusAsync(Guid id, UpdateRefundStatusDto dto);
    }
}
