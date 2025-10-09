using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FamilyTreeAPI.Models
{
    [Table("PhotoLike")]
    public class PhotoLike
    {
        [Key]
        [Column("LikeID")]
        public int LikeID { get; set; }

        [Required]
        [Column("PhotoID")]
        public int PhotoID { get; set; }

        [Required]
        [Column("UserID")]
        public int UserID { get; set; }

        [Column("CreatedAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("PhotoID")]
        public virtual Photo? Photo { get; set; }

        [ForeignKey("UserID")]
        public virtual Connexion? User { get; set; }
    }
}
