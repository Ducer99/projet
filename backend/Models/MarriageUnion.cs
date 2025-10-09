using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FamilyTreeAPI.Models
{
    [Table("MarriageUnion")]
    public class MarriageUnion
    {
        [Key]
        [Column("UnionID")]
        public int UnionID { get; set; }

        [Required]
        [Column("WeddingID")]
        public int WeddingID { get; set; }

        [Required]
        [Column("UnionType")]
        [MaxLength(20)]
        public string UnionType { get; set; } = string.Empty; // 'coutumière', 'civile', 'religieuse', 'traditionnelle', 'autre'

        [Required]
        [Column("UnionDate", TypeName = "date")]
        public DateTime UnionDate { get; set; }

        [Column("Location")]
        public string? Location { get; set; }

        [Column("Notes")]
        public string? Notes { get; set; }

        [Column("Validated")]
        public bool Validated { get; set; } = false;

        [Column("CreatedAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation property
        [ForeignKey("WeddingID")]
        public virtual Wedding? Wedding { get; set; }
    }
}
