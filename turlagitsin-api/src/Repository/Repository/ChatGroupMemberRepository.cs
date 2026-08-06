using Core.Entities;
using Core.Repositories;

namespace Repository.Repository
{
    public class ChatGroupMemberRepository : GenericRepository<ChatGroupMember>, IChatGroupMemberRepository
    {
        public ChatGroupMemberRepository(AppDbContext context) : base(context)
        {
        }
    }
}
