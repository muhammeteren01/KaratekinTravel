using Core.Entities;
using Core.Repositories;
using Core.Services;
using Core.UnitOfWork;

namespace Service.Service
{
    public class TripIncludedService : Service<TripIncluded>, ITripIncludedService
    {
        public TripIncludedService(IGenericRepository<TripIncluded> repository, IUnitOfWork unitOfWork) 
            : base(repository, unitOfWork)
        {
        }
    }
}
