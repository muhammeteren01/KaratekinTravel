using Core.Entities;
using Core.Repositories;

namespace Repository.Repository
{
    public class TripHotelRepository : GenericRepository<TripHotel>, ITripHotelRepository
    {
        public TripHotelRepository(AppDbContext context) : base(context)
        {
        }
    }
}
