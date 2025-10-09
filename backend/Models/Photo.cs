using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FamilyTreeAPI.Models
{
    [Table("Photo")]
    public class Photo
    {
        [Key]
        [Column("PhotoID")]
        public int PhotoID { get; set; }

        [Required]
        [Column("AlbumID")]
        public int AlbumID { get; set; }

        [Required]
        [Column("Url")]
        public string Url { get; set; } = string.Empty;

        [Column("ThumbnailUrl")]
        public string? ThumbnailUrl { get; set; }

        [MaxLength(200)]
        [Column("Title")]
        public string? Title { get; set; }

        [Column("Description")]
        public string? Description { get; set; }

        [Column("DateTaken")]
        public DateTime? DateTaken { get; set; }

        [MaxLength(200)]
        [Column("Location")]
        public string? Location { get; set; }

        [Required]
        [Column("UploadedBy")]
        public int UploadedBy { get; set; }

        [Column("FileSize")]
        public long? FileSize { get; set; }

        [Column("Width")]
        public int? Width { get; set; }

        [Column("Height")]
        public int? Height { get; set; }

        [Column("CreatedAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("AlbumID")]
        public virtual Album? Album { get; set; }

        [ForeignKey("UploadedBy")]
        public virtual Connexion? Uploader { get; set; }

        public virtual ICollection<PhotoPerson> TaggedPersons { get; set; } = new List<PhotoPerson>();
        public virtual ICollection<PhotoLike> Likes { get; set; } = new List<PhotoLike>();
    }
}
