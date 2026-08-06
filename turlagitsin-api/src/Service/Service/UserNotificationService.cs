using Core.DTOs.Notification;
using Core.Entities;
using Core.Repositories;
using Core.Services;
using Core.UnitOfWork;
using Microsoft.EntityFrameworkCore;

namespace Service.Service
{
    public class UserNotificationService : Service<UserNotification>, IUserNotificationService
    {
        public UserNotificationService(IGenericRepository<UserNotification> repository, IUnitOfWork unitOfWork)
            : base(repository, unitOfWork)
        {
        }

        public async Task<List<NotificationDto>> GetByUserIdAsync(Guid userId)
        {
            var items = await _repository.Where(n => n.UserId == userId && !n.IsArchived)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();

            return items.Select(MapToDto).ToList();
        }

        public async Task<NotificationDto?> MarkReadAsync(Guid id, Guid userId)
        {
            var entity = await _repository.Where(n => n.Id == id && n.UserId == userId).FirstOrDefaultAsync();
            if (entity == null) return null;

            entity.IsRead = true;
            entity.UpdatedAt = DateTime.UtcNow;
            await UpdateAsync(entity);
            return MapToDto(entity);
        }

        public async Task<NotificationDto?> ArchiveAsync(Guid id, Guid userId)
        {
            var entity = await _repository.Where(n => n.Id == id && n.UserId == userId).FirstOrDefaultAsync();
            if (entity == null) return null;

            entity.IsArchived = true;
            entity.UpdatedAt = DateTime.UtcNow;
            await UpdateAsync(entity);
            return MapToDto(entity);
        }

        public async Task<bool> DeleteAsync(Guid id, Guid userId)
        {
            var entity = await _repository.Where(n => n.Id == id && n.UserId == userId).FirstOrDefaultAsync();
            if (entity == null) return false;

            entity.IsDeleted = true;
            entity.DeletedAt = DateTime.UtcNow;
            entity.UpdatedAt = DateTime.UtcNow;
            await UpdateAsync(entity);
            return true;
        }

        public async Task<NotificationDto> CreateAsync(CreateNotificationDto dto)
        {
            var entity = new UserNotification
            {
                UserId = dto.UserId,
                Title = dto.Title,
                Message = dto.Message,
                Type = dto.Type,
                ActionUrl = dto.ActionUrl,
                ActionLabel = dto.ActionLabel
            };

            await AddAsync(entity);
            return MapToDto(entity);
        }

        private static NotificationDto MapToDto(UserNotification n)
        {
            var elapsed = DateTime.UtcNow - n.CreatedAt;
            var time = elapsed.TotalMinutes < 60
                ? $"{(int)elapsed.TotalMinutes}m ago"
                : elapsed.TotalHours < 24
                    ? $"{(int)elapsed.TotalHours}h ago"
                    : $"{(int)elapsed.TotalDays}d ago";

            return new NotificationDto
            {
                Id = n.Id,
                Title = n.Title,
                Message = n.Message,
                Type = n.Type,
                IsRead = n.IsRead,
                IsArchived = n.IsArchived,
                ActionUrl = n.ActionUrl,
                ActionLabel = n.ActionLabel,
                Time = time,
                CreatedAt = n.CreatedAt
            };
        }
    }
}
