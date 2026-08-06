using Core.Entities;
using Core.Repositories;

namespace Repository.Repository
{
    public class ChatGroupRepository : GenericRepository<ChatGroup>, IChatGroupRepository
    {
        public ChatGroupRepository(AppDbContext context) : base(context)
        {
        }
    }
}
