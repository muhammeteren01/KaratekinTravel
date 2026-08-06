namespace Core.DTOs.ResponseDto
{
    public class ReviewResponseDto
    {
        public string Id { get; set; } = string.Empty;
        public string TripId { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public int Rating { get; set; } // 1-5
        public string Comment { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}
