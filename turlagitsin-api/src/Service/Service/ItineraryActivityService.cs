using Core.Entities;
using Core.Repositories;
using Core.Services;
using Core.UnitOfWork;

namespace Service.Service
{
    public class ItineraryActivityService : Service<ItineraryActivity>, IItineraryActivityService
    {
        public ItineraryActivityService(IGenericRepository<ItineraryActivity> repository, IUnitOfWork unitOfWork) 
            : base(repository, unitOfWork)
        {
        }
    }
}
