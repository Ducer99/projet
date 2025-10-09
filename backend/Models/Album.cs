using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FamilyTreeAPI.Models
{
    [Table("Album")]
    public class Album
    {
        [Key]
        [Column("AlbumID")]
        public int AlbumID { get; set; }

        [Required]
        [Column("FamilyID")]
        public int FamilyID { get; set; }

        [Column("EventID")]
        public int? EventID { get; set; }

        [Required]
        [MaxLength(200)]
        [Column("Title")]
        public string Title { get; set; } = string.Empty;

        [Column("Description")]
        public string? Description { get; set; }

        [Column("CoverPhotoUrl")]
        public string? CoverPhotoUrl { get; set; }

        [Required]
        [MaxLength(20)]
        [Column("Visibility")]
        public string Visibility { get; set; } = "family"; // 'family', 'private', 'custom'

        [Required]
        [Column("CreatedBy")]
        public int CreatedBy { get; set; }

        [Column("CreatedAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("UpdatedAt")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("FamilyID")]
        public virtual Family? Family { get; set; }

        [ForeignKey("EventID")]
        public virtual Event? Event { get; set; }

        [ForeignKey("CreatedBy")]
        public virtual Connexion? Creator { get; set; }

        public virtual ICollection<Photo> Photos { get; set; } = new List<Photo>();
        public virtual ICollection<AlbumComment> Comments { get; set; } = new List<AlbumComment>();
        public virtual ICollection<AlbumPermission> Permissions { get; set; } = new List<AlbumPermission>();
    }
}
