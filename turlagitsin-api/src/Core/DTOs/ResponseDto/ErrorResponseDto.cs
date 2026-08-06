namespace Core.DTOs.ApiResponse
{
    public class ErrorResponseDto
    {
        public string Message { get; set; }
        public List<string>? Errors { get; set; }
        public string? StackTrace { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}