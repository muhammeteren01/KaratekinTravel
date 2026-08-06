using Core.Entities;
using Core.Repositories;
using Core.Services;
using Core.UnitOfWork;
using Microsoft.EntityFrameworkCore;

namespace Service.Service
{
    public class UserSavedTripService : Service<UserSavedTrip>, IUserSavedTripService
    {
        public UserSavedTripService(IGenericRepository<UserSavedTrip> repository, IUnitOfWork unitOfWork)
            : base(repository, unitOfWork)
        {
        }

        public async Task<List<Guid>> GetSavedTripIdsAsync(Guid userId)
        {
            return await _repository.Where(s => s.UserId == userId)
                .Select(s => s.TripId)
                .ToListAsync();
        }

        public async Task<bool> SaveAsync(Guid userId, Guid tripId)
        {
            var exists = await _repository.AnyAsync(s => s.UserId == userId && s.TripId == tripId);
            if (exists) return true;

            await AddAsync(new UserSavedTrip
            {
                UserId = userId,
                TripId = tripId
            });

            return true;
        }

        public async Task<bool> UnsaveAsync(Guid userId, Guid tripId)
        {
            var entity = await _repository
                .Where(s => s.UserId == userId && s.TripId == tripId)
                .FirstOrDefaultAsync();

            if (entity == null) return false;

            entity.IsDeleted = true;
            entity.DeletedAt = DateTime.UtcNow;
            entity.UpdatedAt = DateTime.UtcNow;
            await UpdateAsync(entity);
            return true;
        }
    }
}
