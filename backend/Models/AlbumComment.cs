using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FamilyTreeAPI.Models
{
    [Table("AlbumComment")]
    public class AlbumComment
    {
        [Key]
        [Column("CommentID")]
        public int CommentID { get; set; }

        [Required]
        [Column("AlbumID")]
        public int AlbumID { get; set; }

        [Required]
        [Column("AuthorID")]
        public int AuthorID { get; set; }

        [Required]
        [Column("Content")]
        public string Content { get; set; } = string.Empty;

        [Column("CreatedAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("UpdatedAt")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("AlbumID")]
        public virtual Album? Album { get; set; }

        [ForeignKey("AuthorID")]
        public virtual Connexion? Author { get; set; }
    }
}
