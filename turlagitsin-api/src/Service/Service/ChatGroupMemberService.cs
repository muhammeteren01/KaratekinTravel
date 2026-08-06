using Core.Entities;
using Core.Repositories;
using Core.Services;
using Core.UnitOfWork;

namespace Service.Service
{
    public class ChatGroupMemberService : Service<ChatGroupMember>, IChatGroupMemberService
    {
        public ChatGroupMemberService(IGenericRepository<ChatGroupMember> repository, IUnitOfWork unitOfWork) 
            : base(repository, unitOfWork)
        {
        }
    }
}
