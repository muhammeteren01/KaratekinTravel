using Core.Entities;
using Core.DTOs.ResponseDto;
using Core.DTOs.Trip;
using Core.DTOs.TripSeatch;

namespace Core.Services
{
    public interface ITripService : IService<Trip>
    {
        /// <summary>
        /// Herkese açık katalog: yalnızca yayındaki turlar.
        /// </summary>
        Task<List<TripResponseDto>> GetAllTripsAsync();

        /// <summary>
        /// Panel listesi: verilen şirketin turları, taslaklar dahil.
        /// companyId null ise (platform admini) tüm şirketler döner.
        /// </summary>
        Task<List<TripResponseDto>> GetManagedTripsAsync(Guid? companyId);

        /// <summary>Yetki kontrolü için turun sahibi şirket.</summary>
        Task<Guid?> GetOwnerCompanyIdAsync(Guid tripId);
        Task<PagedResultDto<TripResponseDto>> SearchTripsAsync(TripSearchDto search);
        Task<TripResponseDto?> GetTripByIdAsync(Guid id);
        Task<TripResponseDto> CreateTripAsync(CreateTripDto dto);
        Task<TripResponseDto?> UpdateTripAsync(Guid id, UpdateTripDto dto);
        Task<bool> DeleteTripAsync(Guid id);
    }
}
