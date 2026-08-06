using Core.Entities;
using Core.Repositories;

namespace Repository.Repository
{
    public class TripPricingRepository : GenericRepository<TripPricing>, ITripPricingRepository
    {
        public TripPricingRepository(AppDbContext context) : base(context)
        {
        }
    }
}
