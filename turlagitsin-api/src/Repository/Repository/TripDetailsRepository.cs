using Core.Entities;
using Core.Repositories;

namespace Repository.Repository
{
    public class TripDetailsRepository : GenericRepository<TripDetails>, ITripDetailsRepository
    {
        public TripDetailsRepository(AppDbContext context) : base(context)
        {
        }
    }
}
