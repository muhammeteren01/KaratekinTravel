using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Entities
{
    public class ChatMessage : BaseEntity
    {
        [Required]
        public Guid GroupId { get; set; }

        [Required]
        public Guid SenderId { get; set; }

        [Required]
        [MaxLength(2000)]
        public string Text { get; set; } = string.Empty;

        public bool IsDelivered { get; set; } = false;

        public bool IsRead { get; set; } = false;

        [MaxLength(500)]
        public string? AttachmentUrl { get; set; }

        [MaxLength(50)]
        public string? AttachmentType { get; set; }

        // Navigation Properties
        [ForeignKey("GroupId")]
        public virtual ChatGroup Group { get; set; } = null!;

        [ForeignKey("SenderId")]
        public virtual User Sender { get; set; } = null!;
    }
}
