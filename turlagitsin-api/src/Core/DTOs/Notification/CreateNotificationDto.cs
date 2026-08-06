namespace Core.DTOs.Notification
{
    public class CreateNotificationDto
    {
        public Guid UserId { get; set; }
        public string Title { get; set; }
        public string Message { get; set; }
        public string Type { get; set; } = "info";
        public string? ActionUrl { get; set; }
        public string? ActionLabel { get; set; }
    }
}