using Core.Entities;
using Core.Repositories;
using Core.Services;
using Core.UnitOfWork;

namespace Service.Service
{
    public class TripExcludedService : Service<TripExcluded>, ITripExcludedService
    {
        public TripExcludedService(IGenericRepository<TripExcluded> repository, IUnitOfWork unitOfWork) 
            : base(repository, unitOfWork)
        {
        }
    }
}
