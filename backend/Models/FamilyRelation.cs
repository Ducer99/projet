using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FamilyTreeAPI.Models
{
    [Table("FamilyRelation")]
    public class FamilyRelation
    {
        [Key]
        [Column("RelationID")]
        public int RelationID { get; set; }

        [Required]
        [Column("PersonID")]
        public int PersonID { get; set; }

        [Required]
        [Column("FamilyID")]
        public int FamilyID { get; set; }

        [Required]
        [Column("RelationType")]
        [MaxLength(30)]
        public string RelationType { get; set; } = string.Empty; // 'member', 'gendre', 'bru', 'beau-père', 'belle-mère', etc.

        [Column("StartDate", TypeName = "date")]
        public DateTime? StartDate { get; set; }

        [Column("EndDate", TypeName = "date")]
        public DateTime? EndDate { get; set; }

        [Column("Notes")]
        public string? Notes { get; set; }

        [Column("CreatedAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("PersonID")]
        public virtual Person? Person { get; set; }

        [ForeignKey("FamilyID")]
        public virtual Family? Family { get; set; }
    }
}
