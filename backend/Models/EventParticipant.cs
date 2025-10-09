using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FamilyTreeAPI.Models
{
    [Table("EventParticipant")]
    public class EventParticipant
    {
        [Key]
        public int EventParticipantID { get; set; }
        
        [Required]
        public int EventID { get; set; }
        
        [Required]
        public int PersonID { get; set; }
        
        [StringLength(20)]
        public string Status { get; set; } = "confirmed"; // invited, confirmed, declined
        
        public DateTime? RespondedAt { get; set; }
        
        // Navigation Properties
        [ForeignKey("EventID")]
        public virtual Event Event { get; set; } = null!;
        
        [ForeignKey("PersonID")]
        public virtual Person Person { get; set; } = null!;
    }
}
