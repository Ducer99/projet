using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FamilyTreeAPI.Models
{
    [Table("Connexion")]
    public class Connexion
    {
        [Key]
        public int ConnexionID { get; set; }
        
        [Required]
        [StringLength(100)]
        public string UserName { get; set; } = string.Empty;
        
        [Required]
        [StringLength(255)]
        public string Password { get; set; } = string.Empty; // Hashé avec bcrypt
        
        [Required]
        public int Level { get; set; } = 1; // 1=Utilisateur, 2=Modérateur, 3=Admin
        
        public int? IDPerson { get; set; } // Nullable pour nouveau flux d'inscription
        public int? FamilyID { get; set; } // Nullable jusqu'à l'attachement à une famille
        
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        public DateTime? LastLoginDate { get; set; }
        
        public bool IsActive { get; set; } = true;
        
        // Indique si le profil utilisateur est complété
        public bool ProfileCompleted { get; set; } = false;
        
        [Required]
        [StringLength(255)]
        public string Email { get; set; } = string.Empty;
        
        // Password reset fields
        [StringLength(10)]
        public string? PasswordResetCode { get; set; }
        public DateTime? PasswordResetExpiry { get; set; }
        
        //  Rôle de l'utilisateur (Admin, Moderator, Member)
        [StringLength(20)]
        public string Role { get; set; } = "Member";
        
        // 🆕 Email verification fields
        public bool EmailVerified { get; set; } = false;
        
        [StringLength(6)]
        public string? EmailVerificationCode { get; set; }
        
        public DateTime? EmailVerificationExpiry { get; set; }
        
        public DateTime? EmailVerificationSentAt { get; set; }

        // 🔐 Double authentification (2FA) par email
        public bool TwoFactorEnabled { get; set; } = false;

        [StringLength(6)]
        public string? TwoFactorCode { get; set; }

        public DateTime? TwoFactorCodeExpiry { get; set; }

        // Navigation Properties
        [ForeignKey("IDPerson")]
        public virtual Person Person { get; set; } = null!;
        
        // Note: On n'utilise pas de navigation Family ici pour éviter les conflits
        // avec la relation Person -> Family. Utiliser Person?.Family pour accéder à la famille.
    }
}
