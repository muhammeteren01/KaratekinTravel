using Core.Entities;
using Core.Repositories;

namespace Repository.Repository
{
    public class UserSavedTripRepository : GenericRepository<UserSavedTrip>, IUserSavedTripRepository
    {
        public UserSavedTripRepository(AppDbContext context) : base(context)
        {
        }
    }
}
