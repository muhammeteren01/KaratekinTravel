namespace Core.DTOs.Review
{
    public class CreateReviewDto
    {
        public Guid UserId { get; set; }
        public Guid TripId { get; set; }
        public int Rating { get; set; }
        public bool IsAnonymous { get; set; }
        public string? Comment { get; set; }
    }
}