using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FamilyTreeAPI.Models
{
    [Table("Family")]
    public class Family
    {
        [Key]
        public int FamilyID { get; set; }
        
        [Required]
        [StringLength(100)]
        public string FamilyName { get; set; } = string.Empty;
        
        [StringLength(500)]
        public string? Description { get; set; }
        
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        
        // 🔑 Code d'invitation (XXX-NNNN)
        [StringLength(20)]
        public string? InviteCode { get; set; }
        
        // Premier créateur (Admin)
        public int? CreatedBy { get; set; }
        
        // Navigation property
        [ForeignKey("CreatedBy")]
        public virtual Person? Creator { get; set; }
        
        public virtual ICollection<Person> Members { get; set; } = new List<Person>();
        public virtual ICollection<Connexion> Connexions { get; set; } = new List<Connexion>();
    }
}
