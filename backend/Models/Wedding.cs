using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FamilyTreeAPI.Models
{
    [Table("Wedding")]
    public class Wedding
    {
        [Key]
        public int WeddingID { get; set; }
        
        public int ManID { get; set; }
        public int WomanID { get; set; }
        
        public DateTime WeddingDate { get; set; }
        
        public DateTime? DivorceDate { get; set; }
        
        public bool IsActive { get; set; } = true;
        
        [StringLength(200)]
        public string? Location { get; set; }
        
        [StringLength(1000)]
        public string? Notes { get; set; }

        // 🆕 Nouvelles propriétés du système de mariage amélioré
        [Column("PatrilinealFamilyID")]
        public int? PatrilinealFamilyID { get; set; }

        [Column("Status")]
        [MaxLength(20)]
        public string Status { get; set; } = "active"; // 'active', 'divorced', 'widowed'

        [Column("CreatedBy")]
        public int? CreatedBy { get; set; }

        [Column("CreatedAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("UpdatedAt")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation Properties
        [ForeignKey("ManID")]
        public virtual Person Man { get; set; } = null!;
        
        [ForeignKey("WomanID")]
        public virtual Person Woman { get; set; } = null!;

        [ForeignKey("PatrilinealFamilyID")]
        public virtual Family? PatrilinealFamily { get; set; }

        [ForeignKey("CreatedBy")]
        public virtual Connexion? Creator { get; set; }

        // Collection des unions multiples
        public virtual ICollection<MarriageUnion> Unions { get; set; } = new List<MarriageUnion>();
    }
}
