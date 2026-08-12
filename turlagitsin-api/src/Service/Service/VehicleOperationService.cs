using Core.DTOs.VehicleOperation;
using Core.Entities;
using Core.Repositories;
using Core.Services;
using Core.UnitOfWork;
using Microsoft.EntityFrameworkCore;

namespace Service.Service
{
    public class VehicleOperationService : Service<VehicleOperation>, IVehicleOperationService
    {
        public VehicleOperationService(IGenericRepository<VehicleOperation> repository, IUnitOfWork unitOfWork)
            : base(repository, unitOfWork)
        {
        }

        public async Task<List<VehicleOperationDto>> GetAsync(Guid? companyId, Guid? vehicleId, string? operationType)
        {
            var query = _repository.Where(o => true).Include(o => o.Vehicle).AsQueryable();

            // Şirket kapsamı araç üzerinden çözülüyor; kaydın kendisinde
            // CompanyId tutmuyoruz ki araç devredilirse geçmiş tutarsız kalmasın.
            if (companyId.HasValue)
                query = query.Where(o => o.Vehicle.CompanyId == companyId.Value);

            if (vehicleId.HasValue)
                query = query.Where(o => o.VehicleId == vehicleId.Value);

            if (!string.IsNullOrWhiteSpace(operationType) &&
                !string.Equals(operationType, "Tümü", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(o => o.OperationType == operationType);
            }

            var items = await query.OrderByDescending(o => o.OccurredAt).ToListAsync();
            return items.Select(MapToDto).ToList();
        }

        public async Task<VehicleOperationDto?> GetByIdAsync(Guid id)
        {
            var item = await _repository.Where(o => o.Id == id)
                .Include(o => o.Vehicle)
                .FirstOrDefaultAsync();

            return item == null ? null : MapToDto(item);
        }

        public async Task<VehicleOperationDto> CreateAsync(CreateVehicleOperationDto dto)
        {
            var entity = new VehicleOperation
            {
                VehicleId = dto.VehicleId,
                OperationType = dto.OperationType,
                DriverName = dto.DriverName,
                OccurredAt = dto.OccurredAt ?? DateTime.UtcNow,
                Cost = dto.Cost,
                Currency = string.IsNullOrWhiteSpace(dto.Currency) ? "TRY" : dto.Currency,
                Notes = dto.Notes
            };

            await AddAsync(entity);

            // Plate alanını doldurmak için aracıyla birlikte tekrar oku.
            return await GetByIdAsync(entity.Id) ?? MapToDto(entity);
        }

        public async Task<VehicleOperationDto?> UpdateAsync(Guid id, UpdateVehicleOperationDto dto)
        {
            var entity = await _repository.Where(o => o.Id == id).FirstOrDefaultAsync();
            if (entity == null) return null;

            if (dto.OperationType != null) entity.OperationType = dto.OperationType;
            if (dto.DriverName != null) entity.DriverName = dto.DriverName;
            if (dto.OccurredAt.HasValue) entity.OccurredAt = dto.OccurredAt.Value;
            if (dto.Cost.HasValue) entity.Cost = dto.Cost.Value;
            if (!string.IsNullOrWhiteSpace(dto.Currency)) entity.Currency = dto.Currency;
            if (dto.Notes != null) entity.Notes = dto.Notes;
            entity.UpdatedAt = DateTime.UtcNow;

            await UpdateAsync(entity);
            return await GetByIdAsync(id);
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var entity = await _repository.Where(o => o.Id == id).FirstOrDefaultAsync();
            if (entity == null) return false;

            entity.IsDeleted = true;
            entity.DeletedAt = DateTime.UtcNow;
            await UpdateAsync(entity);
            return true;
        }

        private static VehicleOperationDto MapToDto(VehicleOperation entity) => new()
        {
            Id = entity.Id,
            VehicleId = entity.VehicleId,
            Plate = entity.Vehicle?.Plate ?? string.Empty,
            OperationType = entity.OperationType,
            DriverName = entity.DriverName,
            OccurredAt = entity.OccurredAt,
            Cost = entity.Cost,
            Currency = entity.Currency,
            Notes = entity.Notes,
            CreatedAt = entity.CreatedAt
        };
    }
}
