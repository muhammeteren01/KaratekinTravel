using Core.DTOs.Vehicle;
using Core.Entities;

namespace Core.Services
{
    public interface IVehicleService : IService<Vehicle>
    {
        Task<List<VehicleDto>> GetByCompanyIdAsync(Guid companyId);
        Task<List<VehicleDto>> GetAllVehiclesAsync();
        Task<VehicleDto?> GetByIdAsync(Guid id);
        Task<VehicleDto> CreateAsync(CreateVehicleDto dto);
        Task<VehicleDto?> UpdateAsync(Guid id, UpdateVehicleDto dto);
        Task<bool> DeleteAsync(Guid id);
        Task<SeatLayoutDto> CreateLayoutAsync(CreateSeatLayoutDto dto);
        Task<List<SeatLayoutDto>> GetLayoutsByCompanyAsync(Guid companyId);
    }
}
