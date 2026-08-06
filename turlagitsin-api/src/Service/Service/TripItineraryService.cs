using Core.Entities;
using Core.Repositories;
using Core.Services;
using Core.UnitOfWork;

namespace Service.Service
{
    public class TripItineraryService : Service<TripItinerary>, ITripItineraryService
    {
        public TripItineraryService(IGenericRepository<TripItinerary> repository, IUnitOfWork unitOfWork) 
            : base(repository, unitOfWork)
        {
        }
    }
}
