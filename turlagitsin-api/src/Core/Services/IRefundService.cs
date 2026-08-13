using Core.DTOs.Refund;
using Core.Entities;

namespace Core.Services
{
    public interface IRefundService : IService<RefundRequest>
    {
        Task<RefundRequestDto> CreateAsync(CreateRefundRequestDto dto, Guid userId);
        Task<List<RefundRequestDto>> GetAllRefundsAsync();

        /// <summary>Şirketin turlarına ait iade talepleri.</summary>
        Task<List<RefundRequestDto>> GetByCompanyAsync(Guid companyId);

        /// <summary>Yetki kontrolü için talebin bağlı olduğu turun şirketi.</summary>
        Task<Guid?> GetOwnerCompanyIdAsync(Guid refundId);
        Task<RefundRequestDto?> UpdateStatusAsync(Guid id, UpdateRefundStatusDto dto);
    }
}
