using Core.DTOs.Notification;
using Core.Entities;

namespace Core.Services
{
    public interface IUserNotificationService : IService<UserNotification>
    {
        Task<List<NotificationDto>> GetByUserIdAsync(Guid userId);
        Task<NotificationDto?> MarkReadAsync(Guid id, Guid userId);
        Task<NotificationDto?> ArchiveAsync(Guid id, Guid userId);
        Task<bool> DeleteAsync(Guid id, Guid userId);
        Task<NotificationDto> CreateAsync(CreateNotificationDto dto);
    }
}
