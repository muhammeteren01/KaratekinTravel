using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Api.Helpers;
using Core.DTOs.ResponseDto;
using Core.DTOs.User;
using Core.Services;

namespace Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;

        public UsersController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<List<UserResponseDto>>> GetAll()
        {
            var users = await _userService.GetAllUsersAsync();
            return Ok(users);
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<ActionResult<UserResponseDto>> GetById(Guid id)
        {
            var currentUserId = User.GetUserId();
            var role = User.GetUserRole();

            if (role != "Admin" && currentUserId != id)
                return Forbid();

            var user = await _userService.GetUserByIdAsync(id);
            if (user == null)
                return NotFound();

            return Ok(user);
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<ActionResult<UserResponseDto>> UpdateProfile(Guid id, [FromBody] UpdateUserDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var currentUserId = User.GetUserId();
            var role = User.GetUserRole();

            if (role != "Admin" && currentUserId != id)
                return Forbid();

            var user = await _userService.UpdateProfileAsync(id, dto);
            if (user == null)
                return NotFound();

            return Ok(user);
        }

        [HttpPut("{id}/change-password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword(Guid id, [FromBody] ChangePasswordDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var currentUserId = User.GetUserId();
            if (currentUserId != id)
                return Forbid();

            var success = await _userService.ChangePasswordAsync(id, dto);
            if (!success)
                return BadRequest(new { message = "Invalid current password or user not found" });

            return Ok(new { message = "Password changed successfully" });
        }
    }
}
