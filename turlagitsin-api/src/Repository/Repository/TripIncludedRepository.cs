using Core.Entities;
using Core.Repositories;

namespace Repository.Repository
{
    public class TripIncludedRepository : GenericRepository<TripIncluded>, ITripIncludedRepository
    {
        public TripIncludedRepository(AppDbContext context) : base(context)
        {
        }
    }
}
