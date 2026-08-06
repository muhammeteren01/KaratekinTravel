namespace Core.DTOs.Review
{
    public class CompanyReviewDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string? Avatar { get; set; }
        public string TripName { get; set; }
        public string Date { get; set; }
        public int Rating { get; set; }
        public string? Comment { get; set; }
        public bool IsAnonymous { get; set; }
    }
}