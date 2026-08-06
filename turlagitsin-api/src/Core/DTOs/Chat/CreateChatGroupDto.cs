namespace Core.DTOs.Chat
{
    public class CreateChatGroupDto
    {
        public string GroupName { get; set; }
        public Guid TripId { get; set; }
        public List<Guid> MemberIds { get; set; } = new();
    }
}