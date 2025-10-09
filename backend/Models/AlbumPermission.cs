using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FamilyTreeAPI.Models
{
    [Table("AlbumPermission")]
    public class AlbumPermission
    {
        [Key]
        [Column("PermissionID")]
        public int PermissionID { get; set; }

        [Required]
        [Column("AlbumID")]
        public int AlbumID { get; set; }

        [Column("UserID")]
        public int? UserID { get; set; }

        [Column("PersonID")]
        public int? PersonID { get; set; }

        [Column("CanView")]
        public bool CanView { get; set; } = true;

        [Column("CanComment")]
        public bool CanComment { get; set; } = true;

        [Column("CanAddPhotos")]
        public bool CanAddPhotos { get; set; } = false;

        [Column("CreatedAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("AlbumID")]
        public virtual Album? Album { get; set; }

        [ForeignKey("UserID")]
        public virtual Connexion? User { get; set; }

        [ForeignKey("PersonID")]
        public virtual Person? Person { get; set; }
    }
}
