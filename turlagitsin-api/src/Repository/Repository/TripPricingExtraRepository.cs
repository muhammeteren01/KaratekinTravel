using Core.Entities;
using Core.Repositories;

namespace Repository.Repository
{
    public class TripPricingExtraRepository : GenericRepository<TripPricingExtra>, ITripPricingExtraRepository
    {
        public TripPricingExtraRepository(AppDbContext context) : base(context)
        {
        }
    }
}
