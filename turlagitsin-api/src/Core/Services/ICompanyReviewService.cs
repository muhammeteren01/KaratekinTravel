using Core.DTOs.Review;
using Core.Entities;

namespace Core.Services
{
    public interface ICompanyReviewService : IService<CompanyReview>
    {
        Task<List<CompanyReviewDto>> GetByCompanyIdAsync(Guid companyId);
        Task<CompanyReviewDto> CreateAsync(CreateCompanyReviewDto dto, Guid userId);
    }
}
