namespace Core.DTOs.Chat
{
    public class ChatMessageDto
    {
        public Guid Id { get; set; }
        public string Text { get; set; }
        public string Time { get; set; }
        public bool IsOwn { get; set; }
        public bool IsDelivered { get; set; }
        public bool IsRead { get; set; }
        public string? Avatar { get; set; }
    }
}


