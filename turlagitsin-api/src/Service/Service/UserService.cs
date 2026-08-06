using Core.Entities;
using Core.Repositories;
using Core.Services;
using Core.UnitOfWork;
using Core.DTOs.ResponseDto;
using Core.DTOs.User;
using Microsoft.EntityFrameworkCore;

namespace Service.Service
{
    public class UserService : Service<User>, IUserService
    {
        public UserService(IGenericRepository<User> repository, IUnitOfWork unitOfWork) 
            : base(repository, unitOfWork)
        {
        }

        public async Task<List<UserResponseDto>> GetAllUsersAsync()
        {
            var users = await _repository.Where(u => true).ToListAsync();
            return users.Select(MapToResponseDto).ToList();
        }

        public async Task<UserResponseDto?> GetUserByIdAsync(Guid id)
        {
            var user = await _repository.Where(u => u.Id == id).FirstOrDefaultAsync();
            return user == null ? null : MapToResponseDto(user);
        }

        private UserResponseDto MapToResponseDto(User user)
        {
            return new UserResponseDto
            {
                Id = user.Id.ToString(),
                Name = user.Name,
                Email = user.Email,
                Phone = user.Phone ?? string.Empty,
                Location = user.Location ?? string.Empty,
                Avatar = string.IsNullOrWhiteSpace(user.Avatar) ? null : user.Avatar,
                Role = user.Role ?? "User",
                CompanyId = user.CompanyId?.ToString()
            };
        }

        public async Task<UserResponseDto?> UpdateProfileAsync(Guid id, UserProfileDto dto)
        {
            var user = await _repository.Where(u => u.Id == id).FirstOrDefaultAsync();
            if (user == null) return null;

            user.Name = dto.Name;
            user.Email = dto.Email;
            user.Phone = dto.Phone;
            user.Location = dto.Location;
            user.Avatar = dto.Avatar;
            user.UpdatedAt = DateTime.UtcNow;

            await UpdateAsync(user);
            return await GetUserByIdAsync(id);
        }

        public async Task<bool> ChangePasswordAsync(Guid id, ChangePasswordDto dto)
        {
            var user = await _repository.Where(u => u.Id == id).FirstOrDefaultAsync();
            if (user == null) return false;

            if (!global::BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash))
                return false;

            user.PasswordHash = global::BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
            user.UpdatedAt = DateTime.UtcNow;

            await UpdateAsync(user);
            return true;
        }
    }
}
