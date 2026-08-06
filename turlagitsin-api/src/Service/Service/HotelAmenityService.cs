using Core.Entities;
using Core.Repositories;
using Core.Services;
using Core.UnitOfWork;

namespace Service.Service
{
    public class HotelAmenityService : Service<HotelAmenity>, IHotelAmenityService
    {
        public HotelAmenityService(IGenericRepository<HotelAmenity> repository, IUnitOfWork unitOfWork) 
            : base(repository, unitOfWork)
        {
        }
    }
}
