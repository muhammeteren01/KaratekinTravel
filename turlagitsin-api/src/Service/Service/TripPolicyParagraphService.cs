using Core.Entities;
using Core.Repositories;
using Core.Services;
using Core.UnitOfWork;

namespace Service.Service
{
    public class TripPolicyParagraphService : Service<TripPolicyParagraph>, ITripPolicyParagraphService
    {
        public TripPolicyParagraphService(IGenericRepository<TripPolicyParagraph> repository, IUnitOfWork unitOfWork) 
            : base(repository, unitOfWork)
        {
        }
    }
}
