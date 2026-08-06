namespace Core.DTOs.ResponseDto
{
    public class UserResponseDto
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string? Avatar { get; set; }
        public string Role { get; set; } = "User";
        public string? CompanyId { get; set; }
    }
}
