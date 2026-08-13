using Core.DTOs.VehicleOperation;
using Core.Entities;

namespace Core.Services
{
    public interface IVehicleOperationService : IService<VehicleOperation>
    {
        Task<List<VehicleOperationDto>> GetAsync(Guid? companyId, Guid? vehicleId, string? operationType);
        Task<VehicleOperationDto?> GetByIdAsync(Guid id);
        Task<VehicleOperationDto> CreateAsync(CreateVehicleOperationDto dto);
        Task<VehicleOperationDto?> UpdateAsync(Guid id, UpdateVehicleOperationDto dto);
        Task<bool> DeleteAsync(Guid id);
    }
}
