namespace Core.DTOs.Review
{
    public class CreateCompanyReviewDto
    {
        public Guid CompanyId { get; set; }
        public string TripName { get; set; }
        public int Rating { get; set; }
        public string? Comment { get; set; }
        public bool IsAnonymous { get; set; }
    }
}