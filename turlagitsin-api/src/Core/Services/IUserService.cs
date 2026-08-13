using Core.Entities;
using Core.DTOs.ResponseDto;
using Core.DTOs.User;

namespace Core.Services
{
    public interface IUserService : IService<User>
    {
        Task<List<UserResponseDto>> GetAllUsersAsync();
        Task<UserResponseDto?> GetUserByIdAsync(Guid id);
        Task<UserResponseDto?> UpdateProfileAsync(Guid id, UpdateUserDto dto);
        Task<bool> ChangePasswordAsync(Guid id, ChangePasswordDto dto);
    }
}
