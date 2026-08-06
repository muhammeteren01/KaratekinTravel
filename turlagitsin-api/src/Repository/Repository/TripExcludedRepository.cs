using Core.Entities;
using Core.Repositories;

namespace Repository.Repository
{
    public class TripExcludedRepository : GenericRepository<TripExcluded>, ITripExcludedRepository
    {
        public TripExcludedRepository(AppDbContext context) : base(context)
        {
        }
    }
}
