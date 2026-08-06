using Core.Entities;
using Core.Repositories;
using Core.Services;
using Core.UnitOfWork;
using Core.DTOs.ResponseDto;
using Core.DTOs.Review;
using Microsoft.EntityFrameworkCore;

namespace Service.Service
{
    public class ReviewService : Service<Review>, IReviewService
    {
        public ReviewService(IGenericRepository<Review> repository, IUnitOfWork unitOfWork) 
            : base(repository, unitOfWork)
        {
        }

        public async Task<List<ReviewResponseDto>> GetAllReviewsAsync()
        {
            var reviews = await _repository.Where(r => true)
                .Include(r => r.User)
                .Include(r => r.Trip)
                .ToListAsync();

            return reviews.Select(MapToResponseDto).ToList();
        }

        public async Task<List<ReviewResponseDto>> GetReviewsByTripIdAsync(Guid tripId)
        {
            var reviews = await _repository.Where(r => r.TripId == tripId)
                .Include(r => r.User)
                .Include(r => r.Trip)
                .ToListAsync();

            return reviews.Select(MapToResponseDto).ToList();
        }

        public async Task<List<ReviewResponseDto>> GetReviewsByUserIdAsync(Guid userId)
        {
            var reviews = await _repository.Where(r => r.UserId == userId)
                .Include(r => r.User)
                .Include(r => r.Trip)
                .ToListAsync();

            return reviews.Select(MapToResponseDto).ToList();
        }

        public async Task<ReviewResponseDto?> GetReviewByIdAsync(Guid id)
        {
            var review = await _repository.Where(r => r.Id == id)
                .Include(r => r.User)
                .Include(r => r.Trip)
                .FirstOrDefaultAsync();

            return review == null ? null : MapToResponseDto(review);
        }

        private ReviewResponseDto MapToResponseDto(Review review)
        {
            return new ReviewResponseDto
            {
                Id = review.Id.ToString(),
                TripId = review.TripId.ToString(),
                UserId = review.UserId.ToString(),
                Rating = review.Rating,
                Comment = review.Comment ?? string.Empty,
                CreatedAt = review.CreatedAt
            };
        }

        public async Task<ReviewResponseDto> CreateReviewAsync(CreateReviewDto dto, Guid userId)
        {
            var review = new Review
            {
                TripId = dto.TripId,
                UserId = userId,
                Rating = dto.Rating,
                Comment = dto.Comment,
                IsApproved = false
            };

            await AddAsync(review);

            return new ReviewResponseDto
            {
                Id = review.Id.ToString(),
                TripId = review.TripId.ToString(),
                UserId = review.UserId.ToString(),
                Rating = review.Rating,
                Comment = review.Comment ?? string.Empty,
                CreatedAt = review.CreatedAt
            };
        }

        public async Task<bool> DeleteReviewAsync(Guid id, Guid userId)
        {
            var review = await _repository.Where(r => r.Id == id && r.UserId == userId).FirstOrDefaultAsync();
            if (review == null) return false;

            review.IsDeleted = true;
            review.DeletedAt = DateTime.UtcNow;
            await UpdateAsync(review);
            return true;
        }
    }
}
