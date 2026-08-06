using Core.Entities;
using Core.Repositories;

namespace Repository.Repository
{
    public class RefundRequestRepository : GenericRepository<RefundRequest>, IRefundRequestRepository
    {
        public RefundRequestRepository(AppDbContext context) : base(context)
        {
        }
    }
}
