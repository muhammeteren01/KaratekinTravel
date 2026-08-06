using Core.Entities;
using Core.Repositories;

namespace Repository.Repository
{
    public class HotelRepository : GenericRepository<Hotel>, IHotelRepository
    {
        public HotelRepository(AppDbContext context) : base(context)
        {
        }
    }
}
