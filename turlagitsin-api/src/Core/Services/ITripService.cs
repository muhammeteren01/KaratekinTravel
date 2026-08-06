using Core.Entities;
using Core.DTOs.ResponseDto;
using Core.DTOs.Trip;
using Core.DTOs.TripSeatch;

namespace Core.Services
{
    public interface ITripService : IService<Trip>
    {
        Task<List<TripResponseDto>> GetAllTripsAsync();
        Task<PagedResultDto<TripResponseDto>> SearchTripsAsync(TripSearchDto search);
        Task<TripResponseDto?> GetTripByIdAsync(Guid id);
        Task<TripResponseDto> CreateTripAsync(CreateTripDto dto);
        Task<TripResponseDto?> UpdateTripAsync(Guid id, UpdateTripDto dto);
        Task<bool> DeleteTripAsync(Guid id);
    }
}
