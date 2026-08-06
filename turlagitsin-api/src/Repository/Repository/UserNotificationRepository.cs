using Core.Entities;
using Core.Repositories;

namespace Repository.Repository
{
    public class UserNotificationRepository : GenericRepository<UserNotification>, IUserNotificationRepository
    {
        public UserNotificationRepository(AppDbContext context) : base(context)
        {
        }
    }
}
