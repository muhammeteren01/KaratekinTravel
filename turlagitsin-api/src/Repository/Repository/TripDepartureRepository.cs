using Core.Entities;
using Core.Repositories;

namespace Repository.Repository
{
    public class TripDepartureRepository : GenericRepository<TripDeparture>, ITripDepartureRepository
    {
        public TripDepartureRepository(AppDbContext context) : base(context)
        {
        }
    }
}
