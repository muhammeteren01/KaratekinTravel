using Core.Entities;
using Core.Repositories;
using Core.Services;
using Core.UnitOfWork;

namespace Service.Service
{
    public class TripHotelService : Service<TripHotel>, ITripHotelService
    {
        public TripHotelService(IGenericRepository<TripHotel> repository, IUnitOfWork unitOfWork) 
            : base(repository, unitOfWork)
        {
        }
    }
}
