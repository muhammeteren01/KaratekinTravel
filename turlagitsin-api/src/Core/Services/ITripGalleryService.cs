using Core.DTOs.Gallery;
using Core.Entities;

namespace Core.Services
{
    public interface ITripGalleryService : IService<TripGallery>
    {
        Task<List<GalleryImageDto>> GetByTripIdAsync(Guid tripId);
        Task<GalleryImageDto> AddAsync(UploadImageDto dto);
        Task<bool> DeleteAsync(Guid id);

        /// <summary>Yetki kontrolü için görselin bağlı olduğu tur.</summary>
        Task<Guid?> GetTripIdAsync(Guid imageId);
    }
}
