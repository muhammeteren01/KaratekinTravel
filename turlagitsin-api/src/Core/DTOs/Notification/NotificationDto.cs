namespace Core.DTOs.Notification
{
    public class NotificationDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public string Message { get; set; }
        public string Type { get; set; } = "info";
        public bool IsRead { get; set; }
        public bool IsArchived { get; set; }
        public string? ActionUrl { get; set; }
        public string? ActionLabel { get; set; }
        public string Time { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}