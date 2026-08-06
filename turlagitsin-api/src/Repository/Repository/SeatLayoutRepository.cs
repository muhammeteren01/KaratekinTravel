using Core.Entities;
using Core.Repositories;

namespace Repository.Repository
{
    public class SeatLayoutRepository : GenericRepository<SeatLayout>, ISeatLayoutRepository
    {
        public SeatLayoutRepository(AppDbContext context) : base(context)
        {
        }
    }
}
