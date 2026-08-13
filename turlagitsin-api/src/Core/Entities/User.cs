using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;


namespace Core.Entities
{
    public class User : BaseEntity
    {
        [Required]
        [MaxLength(200)]
        public string Name { get; set; }

        [Required]
        [MaxLength(200)]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        [MaxLength(500)]
        public string PasswordHash { get; set; }

        [MaxLength(200)]
        public string? Location { get; set; }

        [MaxLength(50)]
        public string? Phone { get; set; }

        /// <summary>
        /// Profil fotoğrafı. base64 veri URL'i olarak saklanıyor, bu yüzden
        /// 500 karakterlik sınır kaldırıldı (diğer görsel kolonlarıyla aynı).
        /// </summary>
        public string? Avatar { get; set; }

        public bool IsEmailVerified { get; set; } = false;

        public bool IsActive { get; set; } = true;

        [MaxLength(50)]
        public string Role { get; set; } = "User";

        public Guid? CompanyId { get; set; }

        public DateTime? LastLoginAt { get; set; }

        public string? PasswordResetToken { get; set; }

        public DateTime? PasswordResetTokenExpiresAt { get; set; }


        // Navigation Properties
        public virtual ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
        public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();
        public virtual ICollection<CompanyReview> CompanyReviews { get; set; } = new List<CompanyReview>();
        public virtual ICollection<UserSavedTrip> SavedTrips { get; set; } = new List<UserSavedTrip>();
        public virtual ICollection<UserNotification> Notifications { get; set; } = new List<UserNotification>();
    }
}
