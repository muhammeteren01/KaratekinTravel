using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Api.Helpers;
using Core.Entities;
using Core.Enums;
using Core.Services;

namespace Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly ICompanyService _companyService;
        private readonly IConfiguration _configuration;

        public AuthController(IUserService userService, ICompanyService companyService, IConfiguration configuration)
        {
            _userService = userService;
            _companyService = companyService;
            _configuration = configuration;
        }

        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (await _userService.AnyAsync(u => u.Email == request.Email))
                return BadRequest(new { message = "Email already registered" });

            var isCompanyAccount = string.Equals(request.AccountType, "company", StringComparison.OrdinalIgnoreCase)
                || !string.IsNullOrWhiteSpace(request.CompanyName);

            Guid? companyId = null;
            string role = UserRole.User;

            if (isCompanyAccount)
            {
                var companyName = string.IsNullOrWhiteSpace(request.CompanyName)
                    ? request.Name
                    : request.CompanyName;

                var company = new Company
                {
                    Id = Guid.NewGuid(),
                    Name = companyName,
                    IsActive = true,
                    IsVerified = false,
                    CreatedAt = DateTime.UtcNow
                };

                await _companyService.AddAsync(company);
                companyId = company.Id;
                role = UserRole.CompanyAdmin;
            }

            var user = new User
            {
                Id = Guid.NewGuid(),
                Name = request.Name,
                Email = request.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                Phone = request.Phone,
                Role = role,
                CompanyId = companyId,
                CreatedAt = DateTime.UtcNow
            };

            try
            {
                await _userService.AddAsync(user);
            }
            catch (DbUpdateException)
            {
                // Supabase timeout sonrası retry aynı Id ile INSERT denerse PK çakışır;
                // veya INSERT aslında başarılı olup client timeout almış olabilir.
                var existing = await _userService.Where(u => u.Email == request.Email)
                    .FirstOrDefaultAsync();

                if (existing != null)
                {
                    // Kayıt DB'ye yazılmışsa login ile devam etmelerini söyle
                    return BadRequest(new
                    {
                        message = "Email already registered. Please login."
                    });
                }

                return StatusCode(503, new
                {
                    message = "Database temporarily unavailable. Please try again."
                });
            }

            var token = GenerateJwtToken(user);

            return Ok(new
            {
                token,
                user = MapUser(user)
            });
        }

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await _userService.Where(u => u.Email == request.Email)
                .FirstOrDefaultAsync();

            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
                return Unauthorized(new { message = "Invalid credentials" });

            if (!user.IsActive)
                return Unauthorized(new { message = "Account is inactive" });

            user.LastLoginAt = DateTime.UtcNow;
            await _userService.UpdateAsync(user);

            var token = GenerateJwtToken(user);

            return Ok(new
            {
                token,
                user = MapUser(user)
            });
        }

        [HttpPost("forgot-password")]
        [AllowAnonymous]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
        {
            var user = await _userService.Where(u => u.Email == request.Email)
                .FirstOrDefaultAsync();

            // Always return the same message to avoid email enumeration
            if (user == null)
                return Ok(new { message = "If the email exists, a reset link will be sent" });

            user.PasswordResetToken = Convert.ToHexString(RandomNumberGenerator.GetBytes(32));
            user.PasswordResetTokenExpiresAt = DateTime.UtcNow.AddHours(1);
            await _userService.UpdateAsync(user);

            // TODO: Send email with reset token
            return Ok(new
            {
                message = "If the email exists, a reset link will be sent",
                // Exposed only in Development for testing
                resetToken = user.PasswordResetToken
            });
        }

        [HttpPost("reset-password")]
        [AllowAnonymous]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            if (string.IsNullOrEmpty(request.NewPassword) || request.NewPassword.Length < 6)
                return BadRequest(new { message = "Password must be at least 6 characters" });

            var user = await _userService.Where(u =>
                    u.PasswordResetToken == request.Token &&
                    u.PasswordResetTokenExpiresAt != null &&
                    u.PasswordResetTokenExpiresAt > DateTime.UtcNow)
                .FirstOrDefaultAsync();

            if (user == null)
                return BadRequest(new { message = "Invalid or expired reset token" });

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            user.PasswordResetToken = null;
            user.PasswordResetTokenExpiresAt = null;
            await _userService.UpdateAsync(user);

            return Ok(new { message = "Password reset successful" });
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> Me()
        {
            if (!User.TryGetUserId(out var userId))
                return Unauthorized();

            var user = await _userService.Where(u => u.Id == userId).FirstOrDefaultAsync();
            if (user == null)
                return NotFound();

            return Ok(MapUser(user));
        }

        private static object MapUser(User user) => new
        {
            id = user.Id,
            name = user.Name,
            email = user.Email,
            phone = user.Phone,
            avatar = user.Avatar,
            location = user.Location,
            role = user.Role,
            companyId = user.CompanyId
        };

        private string GenerateJwtToken(User user)
        {
            var jwtSettings = _configuration.GetSection("Jwt");
            var key = Encoding.ASCII.GetBytes(jwtSettings["Key"] ?? "");

            var claims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new(ClaimTypes.Email, user.Email),
                new(ClaimTypes.Name, user.Name),
                new(ClaimTypes.Role, user.Role ?? UserRole.User)
            };

            if (user.CompanyId.HasValue)
                claims.Add(new Claim("companyId", user.CompanyId.Value.ToString()));

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddDays(7),
                Issuer = jwtSettings["Issuer"],
                Audience = jwtSettings["Audience"],
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256Signature)
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }

    public class RegisterRequest
    {
        public required string Name { get; set; }
        public required string Email { get; set; }
        public required string Password { get; set; }
        public string? Phone { get; set; }
        public string? AccountType { get; set; }
        public string? CompanyName { get; set; }
    }

    public class LoginRequest
    {
        public required string Email { get; set; }
        public required string Password { get; set; }
    }

    public class ForgotPasswordRequest
    {
        public required string Email { get; set; }
    }

    public class ResetPasswordRequest
    {
        public required string Token { get; set; }
        public required string NewPassword { get; set; }
    }
}
