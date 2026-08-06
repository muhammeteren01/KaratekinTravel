using Core.Entities;
using Core.Repositories;

namespace Repository.Repository
{
    public class HotelAmenityRepository : GenericRepository<HotelAmenity>, IHotelAmenityRepository
    {
        public HotelAmenityRepository(AppDbContext context) : base(context)
        {
        }
    }
}
