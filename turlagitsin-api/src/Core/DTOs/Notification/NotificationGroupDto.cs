namespace Core.DTOs.Notification;

public class NotificationGroupDto
{
    public List<NotificationDto> Recent { get; set; } = new();
    public List<NotificationDto> Archived { get; set; } = new();
}