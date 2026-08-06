using Core.Entities;
using Core.Repositories;
using Core.Services;
using Core.UnitOfWork;

namespace Service.Service
{
    public class TripPricingService : Service<TripPricing>, ITripPricingService
    {
        public TripPricingService(IGenericRepository<TripPricing> repository, IUnitOfWork unitOfWork) 
            : base(repository, unitOfWork)
        {
        }
    }
}
