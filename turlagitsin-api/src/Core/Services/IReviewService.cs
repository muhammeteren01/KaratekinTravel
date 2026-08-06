using Core.Entities;
using Core.DTOs.ResponseDto;
using Core.DTOs.Review;

namespace Core.Services
{
    public interface IReviewService : IService<Review>
    {
        Task<List<ReviewResponseDto>> GetAllReviewsAsync();
        Task<List<ReviewResponseDto>> GetReviewsByTripIdAsync(Guid tripId);
        Task<List<ReviewResponseDto>> GetReviewsByUserIdAsync(Guid userId);
        Task<ReviewResponseDto?> GetReviewByIdAsync(Guid id);
        Task<ReviewResponseDto> CreateReviewAsync(CreateReviewDto dto, Guid userId);
        Task<bool> DeleteReviewAsync(Guid id, Guid userId);
    }
}
