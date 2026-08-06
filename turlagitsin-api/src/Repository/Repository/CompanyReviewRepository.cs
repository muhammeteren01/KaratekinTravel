using Core.Entities;
using Core.Repositories;

namespace Repository.Repository
{
    public class CompanyReviewRepository : GenericRepository<CompanyReview>, ICompanyReviewRepository
    {
        public CompanyReviewRepository(AppDbContext context) : base(context)
        {
        }
    }
}
