using Core.DTOs.SeatSelection;

namespace Core.Services
{
    public interface ISeatAvailabilityService
    {
        Task<SoldSeatsResponseDto> GetSoldSeatsForDepartureAsync(Guid departureId);
        Task<SoldSeatsResponseDto> GetSoldSeatsForTripAsync(Guid tripId);
    }
}
