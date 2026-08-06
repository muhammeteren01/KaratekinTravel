using Core.Entities;
using Core.Repositories;
using Core.Services;
using Core.UnitOfWork;

namespace Service.Service
{
    public class ChatGroupService : Service<ChatGroup>, IChatGroupService
    {
        public ChatGroupService(IGenericRepository<ChatGroup> repository, IUnitOfWork unitOfWork) 
            : base(repository, unitOfWork)
        {
        }
    }
}
