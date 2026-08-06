namespace Core.DTOs.Chat
{
    public class ChatGroupDto
    {
        public Guid Id { get; set; }
        public string GroupName { get; set; }
        public Guid TripId { get; set; }
        public string? Avatar { get; set; }
        public bool IsActive { get; set; }
        public string? LastMessage { get; set; }
        public string Time { get; set; }
        public List<string> MemberAvatars { get; set; } = new();
    }
}