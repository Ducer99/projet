using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FamilyTreeAPI.Models
{
    [Table("EventPhoto")]
    public class EventPhoto
    {
        [Key]
        public int EventPhotoID { get; set; }
        
        [Required]
        public int EventID { get; set; }
        
        [Required]
        [StringLength(500)]
        public string PhotoUrl { get; set; } = string.Empty;
        
        [StringLength(200)]
        public string? Caption { get; set; }
        
        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
        
        public int? UploadedBy { get; set; }
        
        // Navigation Properties
        [ForeignKey("EventID")]
        public virtual Event Event { get; set; } = null!;
        
        [ForeignKey("UploadedBy")]
        public virtual Connexion? Uploader { get; set; }
    }
}
