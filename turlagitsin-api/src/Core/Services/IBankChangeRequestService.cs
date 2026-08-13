using Core.DTOs.Company;
using Core.Entities;

namespace Core.Services
{
    public interface IBankChangeRequestService : IService<BankChangeRequest>
    {
        Task<List<BankChangeRequestDto>> GetAsync(Guid? companyId, string? status);
        Task<BankChangeRequestDto?> GetByIdAsync(Guid id);
        Task<CompanyBankInfoDto?> GetCompanyBankInfoAsync(Guid companyId);
        Task<BankChangeRequestDto> CreateAsync(Guid companyId, Guid? userId, CreateBankChangeRequestDto dto);

        /// <summary>Onaylandığında firmanın banka bilgileri talepten güncellenir.</summary>
        Task<BankChangeRequestDto?> ReviewAsync(Guid id, Guid? reviewerId, ReviewBankChangeRequestDto dto);
    }
}
