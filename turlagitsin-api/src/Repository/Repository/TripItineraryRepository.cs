using Core.Entities;
using Core.Repositories;

namespace Repository.Repository
{
    public class TripItineraryRepository : GenericRepository<TripItinerary>, ITripItineraryRepository
    {
        public TripItineraryRepository(AppDbContext context) : base(context)
        {
        }
    }
}
