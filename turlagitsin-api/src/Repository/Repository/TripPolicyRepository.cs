using Core.Entities;
using Core.Repositories;

namespace Repository.Repository
{
    public class TripPolicyRepository : GenericRepository<TripPolicy>, ITripPolicyRepository
    {
        public TripPolicyRepository(AppDbContext context) : base(context)
        {
        }
    }
}
