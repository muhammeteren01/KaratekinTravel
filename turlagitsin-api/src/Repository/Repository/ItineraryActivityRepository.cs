using Core.Entities;
using Core.Repositories;

namespace Repository.Repository
{
    public class ItineraryActivityRepository : GenericRepository<ItineraryActivity>, IItineraryActivityRepository
    {
        public ItineraryActivityRepository(AppDbContext context) : base(context)
        {
        }
    }
}
