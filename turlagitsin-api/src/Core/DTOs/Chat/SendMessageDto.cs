namespace Core.DTOs.Chat
{
    public class SendMessageDto
    {
        public Guid GroupId { get; set; }
        public string Text { get; set; }
        public string? AttachmentUrl { get; set; }
    }
}