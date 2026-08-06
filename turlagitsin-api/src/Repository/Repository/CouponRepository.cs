using Core.Entities;
using Core.Repositories;

namespace Repository.Repository
{
    public class CouponRepository : GenericRepository<Coupon>, ICouponRepository
    {
        public CouponRepository(AppDbContext context) : base(context)
        {
        }
    }
}
