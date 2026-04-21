using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FamilyTreeAPI.Models
{
    [Table("BirthdayNotificationLog")]
    public class BirthdayNotificationLog
    {
        [Key]
        public int Id { get; set; }

        public int FamilyId { get; set; }

        public int PersonId { get; set; }

        /// <summary>Année calendaire pour laquelle la notification a été envoyée.</summary>
        public int Year { get; set; }

        public DateTime SentAt { get; set; } = DateTime.UtcNow;
    }
}
