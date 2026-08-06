namespace Core.DTOs.User;

public class UserDto
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public string Email { get; set; }
    public string? Location { get; set; }
    public string? Phone { get; set; }
    public string? Avatar { get; set; }
    public bool IsEmailVerified { get; set; }
    public DateTime CreatedAt { get; set; }
}