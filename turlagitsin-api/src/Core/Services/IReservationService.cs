using Core.Entities;
using Core.DTOs.ResponseDto;
using Core.DTOs.Reservation;

namespace Core.Services
{
    public interface IReservationService : IService<Reservation>
    {
        Task<List<ReservationResponseDto>> GetAllReservationsAsync();
        Task<List<ReservationResponseDto>> GetReservationsByUserIdAsync(Guid userId);
        Task<List<ReservationResponseDto>> GetReservationsByTripIdAsync(Guid tripId);
        Task<ReservationResponseDto?> GetReservationByIdAsync(Guid id);
        Task<ReservationResponseDto> CreateReservationAsync(CreateReservationDto dto, Guid userId);
        Task<ReservationResponseDto?> UpdateReservationStatusAsync(Guid id, UpdateReservationStatusDto dto);
        Task<ReservationResponseDto?> ProcessPaymentAsync(ProcessPaymentDto dto);
        Task<bool> CancelReservationAsync(Guid id, string reason);
    }
}
