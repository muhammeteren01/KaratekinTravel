using Core.DTOs.Hotel;
using Core.Entities;
using Core.Repositories;
using Core.Services;
using Core.UnitOfWork;
using Microsoft.EntityFrameworkCore;

namespace Service.Service
{
    public class HotelService : Service<Hotel>, IHotelService
    {
        public HotelService(IGenericRepository<Hotel> repository, IUnitOfWork unitOfWork)
            : base(repository, unitOfWork)
        {
        }

        public async Task<List<HotelDto>> GetAllHotelsAsync()
        {
            var items = await _repository.Where(h => true)
                .OrderByDescending(h => h.CreatedAt)
                .ToListAsync();

            return items.Select(MapToDto).ToList();
        }

        public async Task<HotelDto?> GetByIdAsync(Guid id)
        {
            var item = await _repository.Where(h => h.Id == id).FirstOrDefaultAsync();
            return item == null ? null : MapToDto(item);
        }

        public async Task<HotelDto> CreateAsync(CreateHotelDto dto)
        {
            var entity = new Hotel
            {
                CompanyId = dto.CompanyId,
                Name = dto.Name,
                Website = dto.Website,
                City = dto.City,
                District = dto.District,
                Address = dto.Address,
                Category = dto.Category,
                Image = dto.Image,
                DetailsJson = dto.DetailsJson,
                IsDraft = dto.IsDraft
            };

            await AddAsync(entity);
            return MapToDto(entity);
        }

        public async Task<HotelDto?> UpdateAsync(Guid id, UpdateHotelDto dto)
        {
            var entity = await _repository.Where(h => h.Id == id).FirstOrDefaultAsync();
            if (entity == null) return null;

            if (dto.CompanyId.HasValue) entity.CompanyId = dto.CompanyId;
            if (!string.IsNullOrWhiteSpace(dto.Name)) entity.Name = dto.Name;
            if (dto.Website != null) entity.Website = dto.Website;
            if (dto.City != null) entity.City = dto.City;
            if (dto.District != null) entity.District = dto.District;
            if (dto.Address != null) entity.Address = dto.Address;
            if (dto.Category != null) entity.Category = dto.Category;
            if (dto.Image != null) entity.Image = dto.Image;
            if (dto.DetailsJson != null) entity.DetailsJson = dto.DetailsJson;
            if (dto.IsDraft.HasValue) entity.IsDraft = dto.IsDraft.Value;
            entity.UpdatedAt = DateTime.UtcNow;

            await UpdateAsync(entity);
            return MapToDto(entity);
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var entity = await _repository.Where(h => h.Id == id).FirstOrDefaultAsync();
            if (entity == null) return false;

            entity.IsDeleted = true;
            entity.DeletedAt = DateTime.UtcNow;
            entity.UpdatedAt = DateTime.UtcNow;
            await UpdateAsync(entity);
            return true;
        }

        private static HotelDto MapToDto(Hotel h) => new()
        {
            Id = h.Id,
            CompanyId = h.CompanyId,
            Name = h.Name,
            Website = h.Website,
            City = h.City,
            District = h.District,
            Address = h.Address,
            Category = h.Category,
            Image = h.Image,
            DetailsJson = h.DetailsJson,
            IsDraft = h.IsDraft,
            CreatedAt = h.CreatedAt
        };
    }
}
