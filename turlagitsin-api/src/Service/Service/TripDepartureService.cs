using Core.DTOs.TripDeparture;
using Core.Entities;
using Core.Repositories;
using Core.Services;
using Core.UnitOfWork;
using Microsoft.EntityFrameworkCore;

namespace Service.Service
{
    public class TripDepartureService : Service<TripDeparture>, ITripDepartureService
    {
        public TripDepartureService(IGenericRepository<TripDeparture> repository, IUnitOfWork unitOfWork)
            : base(repository, unitOfWork)
        {
        }

        public async Task<List<TripDepartureDto>> GetByTripIdAsync(Guid tripId)
        {
            var items = await _repository.Where(d => d.TripId == tripId)
                .OrderBy(d => d.DepartureDate)
                .ToListAsync();

            return items.Select(MapToDto).ToList();
        }

        public async Task<TripDepartureDto?> GetByIdAsync(Guid id)
        {
            var item = await _repository.Where(d => d.Id == id).FirstOrDefaultAsync();
            return item == null ? null : MapToDto(item);
        }

        public async Task<TripDepartureDto> CreateAsync(CreateTripDepartureDto dto)
        {
            var entity = new TripDeparture
            {
                TripId = dto.TripId,
                VehicleId = dto.VehicleId,
                DepartureDate = dto.DepartureDate,
                DepartureTime = dto.DepartureTime,
                Price = dto.Price,
                Currency = dto.Currency,
                Capacity = dto.Capacity,
                Status = dto.Status,
                Notes = dto.Notes,
                SoldCount = 0
            };

            await AddAsync(entity);
            return MapToDto(entity);
        }

        public async Task<TripDepartureDto?> UpdateAsync(Guid id, UpdateTripDepartureDto dto)
        {
            var entity = await _repository.Where(d => d.Id == id).FirstOrDefaultAsync();
            if (entity == null) return null;

            if (dto.VehicleId.HasValue) entity.VehicleId = dto.VehicleId;
            if (dto.DepartureDate.HasValue) entity.DepartureDate = dto.DepartureDate.Value;
            if (dto.DepartureTime.HasValue) entity.DepartureTime = dto.DepartureTime;
            if (dto.Price.HasValue) entity.Price = dto.Price;
            if (!string.IsNullOrWhiteSpace(dto.Currency)) entity.Currency = dto.Currency;
            if (dto.Capacity.HasValue) entity.Capacity = dto.Capacity.Value;
            if (!string.IsNullOrWhiteSpace(dto.Status)) entity.Status = dto.Status;
            if (dto.Notes != null) entity.Notes = dto.Notes;
            entity.UpdatedAt = DateTime.UtcNow;

            await UpdateAsync(entity);
            return MapToDto(entity);
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var entity = await _repository.Where(d => d.Id == id).FirstOrDefaultAsync();
            if (entity == null) return false;

            entity.IsDeleted = true;
            entity.DeletedAt = DateTime.UtcNow;
            entity.UpdatedAt = DateTime.UtcNow;
            await UpdateAsync(entity);
            return true;
        }

        private static TripDepartureDto MapToDto(TripDeparture d) => new()
        {
            Id = d.Id,
            TripId = d.TripId,
            VehicleId = d.VehicleId,
            DepartureDate = d.DepartureDate,
            DepartureTime = d.DepartureTime,
            Price = d.Price,
            Currency = d.Currency,
            Capacity = d.Capacity,
            SoldCount = d.SoldCount,
            Status = d.Status,
            Notes = d.Notes,
            CreatedAt = d.CreatedAt
        };
    }
}
