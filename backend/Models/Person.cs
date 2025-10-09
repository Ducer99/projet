using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FamilyTreeAPI.Models
{
    [Table("Person")]
    public class Person
    {
        [Key]
        public int PersonID { get; set; }
        
        [Required]
        [StringLength(100)]
        public string LastName { get; set; } = string.Empty;
        
        [Required]
        [StringLength(100)]
        public string FirstName { get; set; } = string.Empty;
        
        public DateTime? Birthday { get; set; }
        
        [StringLength(255)]
        public string? Email { get; set; }
        
        [Required]
        [StringLength(1)]
        public string Sex { get; set; } = string.Empty; // M ou F
        
        [StringLength(200)]
        public string? Activity { get; set; }
        
        public bool Alive { get; set; } = true;
        
        public DateTime? DeathDate { get; set; }
        
        [StringLength(500)]
        public string? PhotoUrl { get; set; }
        
        [StringLength(1000)]
        public string? Notes { get; set; }
        
        // 🆕 Système de liaison automatique des parents
        [StringLength(200)]
        public string? PendingFatherName { get; set; } // "Jean Dupont" si père non inscrit
        
        [StringLength(200)]
        public string? PendingMotherName { get; set; } // "Marie Talla" si mère non inscrite
        
        [StringLength(20)]
        public string Status { get; set; } = "confirmed"; // placeholder, confirmed, deceased
        
        public int? CreatedBy { get; set; } // ID utilisateur qui a créé ce membre
        
        public bool CanLogin { get; set; } = true; // false pour décédés
        
        public bool ParentLinkConfirmed { get; set; } = false; // Lien parent validé
        
        // Foreign Keys
        public int? FatherID { get; set; }
        public int? MotherID { get; set; }
        public int CityID { get; set; }
        public int? FamilyID { get; set; } // Nullable jusqu'au rattachement familial
        
        // 🆕 Double Lignage (système de mariage amélioré)
        [Column("PaternalFamilyID")]
        public int? PaternalFamilyID { get; set; }
        
        [Column("MaternalFamilyID")]
        public int? MaternalFamilyID { get; set; }
        
        // Navigation Properties
        [ForeignKey("FatherID")]
        public virtual Person? Father { get; set; }
        
        [ForeignKey("MotherID")]
        public virtual Person? Mother { get; set; }
        
                [ForeignKey("CityID")]
        public virtual City City { get; set; } = null!;
        
        [ForeignKey("FamilyID")]
        public virtual Family? Family { get; set; }

        [ForeignKey("PaternalFamilyID")]
        public virtual Family? PaternalFamily { get; set; }

        [ForeignKey("MaternalFamilyID")]
        public virtual Family? MaternalFamily { get; set; }
        
        [ForeignKey("CreatedBy")]
        public virtual Connexion? Creator { get; set; } // Qui a créé ce membre
        
        // Children
        public virtual ICollection<Person> ChildrenAsFather { get; set; } = new List<Person>();
        public virtual ICollection<Person> ChildrenAsMother { get; set; } = new List<Person>();
        
        // Marriages
        public virtual ICollection<Wedding> WeddingsAsMan { get; set; } = new List<Wedding>();
        public virtual ICollection<Wedding> WeddingsAsWoman { get; set; } = new List<Wedding>();
        
        // Family Relations
        public virtual ICollection<FamilyRelation> FamilyRelations { get; set; } = new List<FamilyRelation>();

        // User connection
        public virtual Connexion? Connexion { get; set; }
    }
}
