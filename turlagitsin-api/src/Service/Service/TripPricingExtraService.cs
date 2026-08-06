using Core.Entities;
using Core.Repositories;
using Core.Services;
using Core.UnitOfWork;

namespace Service.Service
{
    public class TripPricingExtraService : Service<TripPricingExtra>, ITripPricingExtraService
    {
        public TripPricingExtraService(IGenericRepository<TripPricingExtra> repository, IUnitOfWork unitOfWork) 
            : base(repository, unitOfWork)
        {
        }
    }
}
