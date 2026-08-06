using Core.Entities;

namespace Core.Services
{
    public interface IUserSavedTripService : IService<UserSavedTrip>
    {
        Task<List<Guid>> GetSavedTripIdsAsync(Guid userId);
        Task<bool> SaveAsync(Guid userId, Guid tripId);
        Task<bool> UnsaveAsync(Guid userId, Guid tripId);
    }
}
