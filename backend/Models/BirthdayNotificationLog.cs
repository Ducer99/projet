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

        /// <summary>
        /// null = log inséré mais email pas encore envoyé (crash potentiel entre l'insert et l'envoi).
        /// valeur = tous les emails ont été envoyés avec succès.
        /// Requête diagnostic : SELECT * FROM "BirthdayNotificationLog" WHERE "SentAt" IS NULL
        /// </summary>
        public DateTime? SentAt { get; set; } = null;
    }
}
