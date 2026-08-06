using Core.Entities;
using Core.Repositories;
using Core.Services;
using Core.UnitOfWork;

namespace Service.Service
{
    public class ChatMessageService : Service<ChatMessage>, IChatMessageService
    {
        public ChatMessageService(IGenericRepository<ChatMessage> repository, IUnitOfWork unitOfWork) 
            : base(repository, unitOfWork)
        {
        }
    }
}
