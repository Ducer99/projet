using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FamilyTreeAPI.Models
{
    [Table("PhotoPerson")]
    public class PhotoPerson
    {
        [Key]
        [Column("PhotoPersonID")]
        public int PhotoPersonID { get; set; }

        [Required]
        [Column("PhotoID")]
        public int PhotoID { get; set; }

        [Required]
        [Column("PersonID")]
        public int PersonID { get; set; }

        [Column("PositionX")]
        public decimal? PositionX { get; set; } // Pourcentage 0-100

        [Column("PositionY")]
        public decimal? PositionY { get; set; } // Pourcentage 0-100

        [Column("TaggedBy")]
        public int? TaggedBy { get; set; }

        [Column("CreatedAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("PhotoID")]
        public virtual Photo? Photo { get; set; }

        [ForeignKey("PersonID")]
        public virtual Person? Person { get; set; }

        [ForeignKey("TaggedBy")]
        public virtual Connexion? Tagger { get; set; }
    }
}
