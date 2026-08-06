using Core.DTOs.TripDeparture;
using Core.Entities;

namespace Core.Services
{
    public interface ITripDepartureService : IService<TripDeparture>
    {
        Task<List<TripDepartureDto>> GetByTripIdAsync(Guid tripId);
        Task<TripDepartureDto?> GetByIdAsync(Guid id);
        Task<TripDepartureDto> CreateAsync(CreateTripDepartureDto dto);
        Task<TripDepartureDto?> UpdateAsync(Guid id, UpdateTripDepartureDto dto);
        Task<bool> DeleteAsync(Guid id);
    }
}
