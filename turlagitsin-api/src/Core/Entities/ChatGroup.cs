using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace Core.Entities
{
    public class ChatGroup : BaseEntity
    {
        [Required]
        public string GroupName { get; set; }

        [Required]
        public Guid TripId { get; set; }

        [MaxLength(500)]
        public string? Avatar { get; set; }

        public bool IsActive { get; set; } = true;

        public string? LastMessage { get; set; }

        public DateTime? LastMessageTime { get; set; }

        // Navigation Properties
        [ForeignKey("TripId")]
        public virtual Trip Trip { get; set; } = null!;

        public virtual ICollection<ChatGroupMember> Members { get; set; } = new List<ChatGroupMember>();
        public virtual ICollection<ChatMessage> Messages { get; set; } = new List<ChatMessage>();
    }
}
