using Core.DTOs.CalendarTrip;
using Core.Entities;

namespace Core.Services
{
    public interface ICalendarTripService : IService<CalendarTrip>
    {
        Task<List<CalendarTripDto>> GetAsync(Guid? userId = null);
        Task<CalendarTripDto> CreateAsync(CreateCalendarTripDto dto, Guid? currentUserId = null);
    }
}
