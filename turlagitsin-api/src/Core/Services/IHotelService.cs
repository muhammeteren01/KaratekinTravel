using Core.DTOs.Hotel;
using Core.Entities;

namespace Core.Services
{
    public interface IHotelService : IService<Hotel>
    {
        Task<List<HotelDto>> GetAllHotelsAsync();
        Task<HotelDto?> GetByIdAsync(Guid id);
        Task<HotelDto> CreateAsync(CreateHotelDto dto);
        Task<HotelDto?> UpdateAsync(Guid id, UpdateHotelDto dto);
        Task<bool> DeleteAsync(Guid id);
    }
}
