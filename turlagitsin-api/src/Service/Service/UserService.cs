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

        public async Task<UserResponseDto?> UpdateProfileAsync(Guid id, UpdateUserDto dto)
        {
            var user = await _repository.Where(u => u.Id == id).FirstOrDefaultAsync();
            if (user == null) return null;

            // Yalnızca gönderilen alanlar yazılıyor. Önceden her alan koşulsuz
            // atanıyordu; panel yalnızca ad/telefon/adres gönderdiği için
            // gönderilmeyen alanlar null'a düşüyordu.
            //
            // E-posta bilerek burada değiştirilmiyor: oturum kimliği e-postaya
            // bağlı ve şifre sıfırlama e-postayla yapılıyor. Profil ucundan
            // e-posta değiştirilebilseydi hesap devralma yolu açık olurdu.
            // Panel de bu alanı salt okunur gösteriyor.
            if (dto.Name != null) user.Name = dto.Name;
            if (dto.Phone != null) user.Phone = dto.Phone;
            if (dto.Location != null) user.Location = dto.Location;
            if (dto.Avatar != null) user.Avatar = dto.Avatar;
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
