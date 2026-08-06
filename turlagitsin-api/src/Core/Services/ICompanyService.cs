using Core.Entities;
using Core.DTOs.ResponseDto;
using Core.DTOs.Company;

namespace Core.Services
{
    public interface ICompanyService : IService<Company>
    {
        Task<List<CompanyResponseDto>> GetAllCompaniesAsync();
        Task<CompanyResponseDto?> GetCompanyByIdAsync(Guid id);
        Task<CompanyResponseDto> CreateCompanyAsync(CreateCompanyDto dto);
        Task<CompanyResponseDto?> UpdateCompanyAsync(Guid id, UpdateCompanyDto dto);
        Task<bool> DeleteCompanyAsync(Guid id);
    }
}
