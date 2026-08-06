using Core.Entities;
using Core.Repositories;

namespace Repository.Repository
{
    public class TripRepository : GenericRepository<Trip>, ITripRepository
    {
        public TripRepository(AppDbContext context) : base(context)
        {
        }
    }
}
