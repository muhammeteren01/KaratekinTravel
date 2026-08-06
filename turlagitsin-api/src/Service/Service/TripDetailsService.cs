using Core.Entities;
using Core.Repositories;
using Core.Services;
using Core.UnitOfWork;

namespace Service.Service
{
    public class TripDetailsService : Service<TripDetails>, ITripDetailsService
    {
        public TripDetailsService(IGenericRepository<TripDetails> repository, IUnitOfWork unitOfWork) 
            : base(repository, unitOfWork)
        {
        }
    }
}
