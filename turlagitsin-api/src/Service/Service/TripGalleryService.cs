using Core.DTOs.Gallery;
using Core.Entities;
using Core.Repositories;
using Core.Services;
using Core.UnitOfWork;
using Microsoft.EntityFrameworkCore;

namespace Service.Service
{
    public class TripGalleryService : Service<TripGallery>, ITripGalleryService
    {
        public TripGalleryService(IGenericRepository<TripGallery> repository, IUnitOfWork unitOfWork)
            : base(repository, unitOfWork)
        {
        }

        public async Task<List<GalleryImageDto>> GetByTripIdAsync(Guid tripId)
        {
            var items = await _repository.Where(g => g.TripId == tripId)
                .OrderBy(g => g.DisplayOrder)
                .ToListAsync();

            return items.Select(MapToDto).ToList();
        }

        public async Task<GalleryImageDto> AddAsync(UploadImageDto dto)
        {
            var maxOrder = await _repository.Where(g => g.TripId == dto.TripId)
                .Select(g => (int?)g.DisplayOrder)
                .MaxAsync() ?? 0;

            var entity = new TripGallery
            {
                TripId = dto.TripId,
                ImageUrl = dto.ImageUrl,
                Caption = dto.Caption,
                DisplayOrder = maxOrder + 1
            };

            await AddAsync(entity);
            return MapToDto(entity);
        }

        public async Task<Guid?> GetTripIdAsync(Guid imageId)
        {
            var item = await _repository.Where(g => g.Id == imageId)
                .Select(g => new { g.TripId })
                .FirstOrDefaultAsync();

            return item?.TripId;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var entity = await _repository.Where(g => g.Id == id).FirstOrDefaultAsync();
            if (entity == null) return false;

            entity.IsDeleted = true;
            entity.DeletedAt = DateTime.UtcNow;
            entity.UpdatedAt = DateTime.UtcNow;
            await UpdateAsync(entity);
            return true;
        }

        private static GalleryImageDto MapToDto(TripGallery g) => new()
        {
            Id = g.Id,
            ImageUrl = g.ImageUrl,
            Caption = g.Caption,
            DisplayOrder = g.DisplayOrder
        };
    }
}
