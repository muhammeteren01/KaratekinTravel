using Core.DTOs.Review;
using Core.Entities;
using Core.Repositories;
using Core.Services;
using Core.UnitOfWork;
using Microsoft.EntityFrameworkCore;

namespace Service.Service
{
    public class CompanyReviewService : Service<CompanyReview>, ICompanyReviewService
    {
        public CompanyReviewService(IGenericRepository<CompanyReview> repository, IUnitOfWork unitOfWork)
            : base(repository, unitOfWork)
        {
        }

        public async Task<List<CompanyReviewDto>> GetByCompanyIdAsync(Guid companyId)
        {
            var reviews = await _repository.Where(r => r.CompanyId == companyId)
                .Include(r => r.User)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();

            return reviews.Select(MapToDto).ToList();
        }

        public async Task<CompanyReviewDto> CreateAsync(CreateCompanyReviewDto dto, Guid userId)
        {
            var entity = new CompanyReview
            {
                CompanyId = dto.CompanyId,
                UserId = userId,
                TripName = dto.TripName,
                Rating = dto.Rating,
                Comment = dto.Comment,
                IsAnonymous = dto.IsAnonymous
            };

            await AddAsync(entity);

            var withUser = await _repository.Where(r => r.Id == entity.Id)
                .Include(r => r.User)
                .FirstOrDefaultAsync();

            return MapToDto(withUser ?? entity);
        }

        private static CompanyReviewDto MapToDto(CompanyReview r) => new()
        {
            Id = r.Id,
            Name = r.IsAnonymous ? "Anonymous" : (r.User?.Name ?? "User"),
            Avatar = r.IsAnonymous ? null : r.User?.Avatar,
            TripName = r.TripName,
            Date = r.CreatedAt.ToString("yyyy-MM-dd"),
            Rating = r.Rating,
            Comment = r.Comment,
            IsAnonymous = r.IsAnonymous
        };
    }
}
