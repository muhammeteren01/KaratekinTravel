using Core.Entities;
using Core.Repositories;
using Core.Services;
using Core.UnitOfWork;

namespace Service.Service
{
    public class TripPolicyService : Service<TripPolicy>, ITripPolicyService
    {
        public TripPolicyService(IGenericRepository<TripPolicy> repository, IUnitOfWork unitOfWork) 
            : base(repository, unitOfWork)
        {
        }
    }
}
