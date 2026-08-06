using Core.Entities;
using Core.Repositories;

namespace Repository.Repository
{
    public class TripPolicyParagraphRepository : GenericRepository<TripPolicyParagraph>, ITripPolicyParagraphRepository
    {
        public TripPolicyParagraphRepository(AppDbContext context) : base(context)
        {
        }
    }
}
