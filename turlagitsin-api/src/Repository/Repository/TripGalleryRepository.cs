using Core.Entities;
using Core.Repositories;

namespace Repository.Repository
{
    public class TripGalleryRepository : GenericRepository<TripGallery>, ITripGalleryRepository
    {
        public TripGalleryRepository(AppDbContext context) : base(context)
        {
        }
    }
}
