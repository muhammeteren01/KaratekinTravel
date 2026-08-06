using Core.Entities;
using Core.Repositories;

namespace Repository.Repository
{
    public class ReviewReportRepository : GenericRepository<ReviewReport>, IReviewReportRepository
    {
        public ReviewReportRepository(AppDbContext context) : base(context)
        {
        }
    }
}
