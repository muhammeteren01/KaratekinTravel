using Core.DTOs.Vehicle;
using Core.Entities;
using Core.Repositories;
using Core.Services;
using Core.UnitOfWork;
using Microsoft.EntityFrameworkCore;

namespace Service.Service
{
    public class VehicleService : Service<Vehicle>, IVehicleService
    {
        private readonly ISeatLayoutRepository _seatLayoutRepository;

        public VehicleService(
            IGenericRepository<Vehicle> repository,
            IUnitOfWork unitOfWork,
            ISeatLayoutRepository seatLayoutRepository)
            : base(repository, unitOfWork)
        {
            _seatLayoutRepository = seatLayoutRepository;
        }

        public async Task<List<VehicleDto>> GetByCompanyIdAsync(Guid companyId)
        {
            var items = await _repository.Where(v => v.CompanyId == companyId).ToListAsync();
            return items.Select(MapToDto).ToList();
        }

        public async Task<List<VehicleDto>> GetAllVehiclesAsync()
        {
            var items = await _repository.Where(v => true).ToListAsync();
            return items.Select(MapToDto).ToList();
        }

        public async Task<VehicleDto?> GetByIdAsync(Guid id)
        {
            var item = await _repository.Where(v => v.Id == id).FirstOrDefaultAsync();
            return item == null ? null : MapToDto(item);
        }

        public async Task<VehicleDto> CreateAsync(CreateVehicleDto dto)
        {
            var entity = new Vehicle
            {
                CompanyId = dto.CompanyId,
                Plate = dto.Plate,
                Model = dto.Model,
                BusType = dto.BusType,
                Capacity = dto.Capacity,
                HasWifi = dto.HasWifi,
                HasAirCondition = dto.HasAirCondition,
                HasPowerOutlet = dto.HasPowerOutlet,
                CoverImage = dto.CoverImage,
                Status = dto.Status,
                SeatLayoutId = dto.SeatLayoutId
            };

            await AddAsync(entity);
            return MapToDto(entity);
        }

        public async Task<VehicleDto?> UpdateAsync(Guid id, UpdateVehicleDto dto)
        {
            var entity = await _repository.Where(v => v.Id == id).FirstOrDefaultAsync();
            if (entity == null) return null;

            if (!string.IsNullOrWhiteSpace(dto.Plate)) entity.Plate = dto.Plate;
            if (dto.Model != null) entity.Model = dto.Model;
            if (!string.IsNullOrWhiteSpace(dto.BusType)) entity.BusType = dto.BusType;
            if (dto.Capacity.HasValue) entity.Capacity = dto.Capacity.Value;
            if (dto.HasWifi.HasValue) entity.HasWifi = dto.HasWifi.Value;
            if (dto.HasAirCondition.HasValue) entity.HasAirCondition = dto.HasAirCondition.Value;
            if (dto.HasPowerOutlet.HasValue) entity.HasPowerOutlet = dto.HasPowerOutlet.Value;
            if (dto.CoverImage != null) entity.CoverImage = dto.CoverImage;
            if (!string.IsNullOrWhiteSpace(dto.Status)) entity.Status = dto.Status;
            if (dto.SeatLayoutId.HasValue) entity.SeatLayoutId = dto.SeatLayoutId;
            entity.UpdatedAt = DateTime.UtcNow;

            await UpdateAsync(entity);
            return MapToDto(entity);
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var entity = await _repository.Where(v => v.Id == id).FirstOrDefaultAsync();
            if (entity == null) return false;

            entity.IsDeleted = true;
            entity.DeletedAt = DateTime.UtcNow;
            entity.UpdatedAt = DateTime.UtcNow;
            await UpdateAsync(entity);
            return true;
        }

        public async Task<SeatLayoutDto> CreateLayoutAsync(CreateSeatLayoutDto dto)
        {
            var layout = new SeatLayout
            {
                CompanyId = dto.CompanyId,
                Name = dto.Name,
                Rows = dto.Rows,
                SeatsLeft = dto.SeatsLeft,
                SeatsRight = dto.SeatsRight,
                TotalSeats = dto.TotalSeats,
                SeatMapJson = dto.SeatMapJson
            };

            await _seatLayoutRepository.AddAsync(layout);
            await _unitOfWork.SaveChangesAsync();
            return MapLayoutToDto(layout);
        }

        public async Task<List<SeatLayoutDto>> GetLayoutsByCompanyAsync(Guid companyId)
        {
            var layouts = await _seatLayoutRepository.Where(l => l.CompanyId == companyId).ToListAsync();
            return layouts.Select(MapLayoutToDto).ToList();
        }

        private static VehicleDto MapToDto(Vehicle v) => new()
        {
            Id = v.Id,
            CompanyId = v.CompanyId,
            Plate = v.Plate,
            Model = v.Model,
            BusType = v.BusType,
            Capacity = v.Capacity,
            HasWifi = v.HasWifi,
            HasAirCondition = v.HasAirCondition,
            HasPowerOutlet = v.HasPowerOutlet,
            CoverImage = v.CoverImage,
            Status = v.Status,
            SeatLayoutId = v.SeatLayoutId,
            CreatedAt = v.CreatedAt
        };

        private static SeatLayoutDto MapLayoutToDto(SeatLayout l) => new()
        {
            Id = l.Id,
            CompanyId = l.CompanyId,
            Name = l.Name,
            Rows = l.Rows,
            SeatsLeft = l.SeatsLeft,
            SeatsRight = l.SeatsRight,
            TotalSeats = l.TotalSeats,
            SeatMapJson = l.SeatMapJson,
            CreatedAt = l.CreatedAt
        };
    }
}
