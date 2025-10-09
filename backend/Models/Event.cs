using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FamilyTreeAPI.Models
{
    [Table("Event")]
    public class Event
    {
        [Key]
        public int EventID { get; set; }
        
        [Required]
        public int FamilyID { get; set; }
        
        [Required]
        [StringLength(150)]
        public string Title { get; set; } = string.Empty;
        
        [StringLength(1000)]
        public string? Description { get; set; }
        
        [Required]
        public DateTime StartDate { get; set; }
        
        public DateTime? EndDate { get; set; }
        
        [Required]
        [StringLength(20)]
        public string EventType { get; set; } = "other"; // birth, marriage, death, birthday, party, other
        
        [StringLength(200)]
        public string? Location { get; set; } // Ville, Pays
        
        [Required]
        [StringLength(10)]
        public string Visibility { get; set; } = "family"; // family, private
        
        public bool IsRecurring { get; set; } = false; // true pour anniversaires annuels
        
        public int? CreatedBy { get; set; } // ConnexionID du créateur (nullable pour événements auto-générés)
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime? UpdatedAt { get; set; }
        
        // Navigation Properties
        [ForeignKey("FamilyID")]
        public virtual Family Family { get; set; } = null!;
        
        [ForeignKey("CreatedBy")]
        public virtual Connexion Creator { get; set; } = null!;
        
        public virtual ICollection<EventParticipant> Participants { get; set; } = new List<EventParticipant>();
        public virtual ICollection<EventPhoto> Photos { get; set; } = new List<EventPhoto>();
    }
}
