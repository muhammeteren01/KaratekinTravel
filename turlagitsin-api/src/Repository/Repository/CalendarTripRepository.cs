using Core.Entities;
using Core.Repositories;

namespace Repository.Repository
{
    public class CalendarTripRepository : GenericRepository<CalendarTrip>, ICalendarTripRepository
    {
        public CalendarTripRepository(AppDbContext context) : base(context)
        {
        }
    }
}
