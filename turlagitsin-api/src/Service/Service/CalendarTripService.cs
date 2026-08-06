using Core.DTOs.CalendarTrip;
using Core.Entities;
using Core.Enums;
using Core.Repositories;
using Core.Services;
using Core.UnitOfWork;
using Microsoft.EntityFrameworkCore;

namespace Service.Service
{
    public class CalendarTripService : Service<CalendarTrip>, ICalendarTripService
    {
        public CalendarTripService(IGenericRepository<CalendarTrip> repository, IUnitOfWork unitOfWork)
            : base(repository, unitOfWork)
        {
        }

        public async Task<List<CalendarTripDto>> GetAsync(Guid? userId = null)
        {
            var query = _repository.Where(c => true);
            if (userId.HasValue)
                query = query.Where(c => c.UserId == userId.Value);

            var items = await query.OrderBy(c => c.Date).ToListAsync();
            return items.Select(MapToDto).ToList();
        }

        public async Task<CalendarTripDto> CreateAsync(CreateCalendarTripDto dto, Guid? currentUserId = null)
        {
            var entity = new CalendarTrip
            {
                Date = dto.Date,
                UserId = dto.UserId ?? currentUserId,
                TripId = dto.TripId,
                Status = CalendarStatus.ACTIVE,
                IsCanceled = false
            };

            await AddAsync(entity);
            return MapToDto(entity);
        }

        private static CalendarTripDto MapToDto(CalendarTrip c) => new()
        {
            Id = c.Id,
            Date = c.Date.ToString("yyyy-MM-dd"),
            UserId = c.UserId,
            TripId = c.TripId
        };
    }
}
