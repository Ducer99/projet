using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FamilyTreeAPI.Models
{
    [Table("City")]
    public class City
    {
        [Key]
        public int CityID { get; set; }
        
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;
        
        [Required]
        [StringLength(100)]
        public string CountryName { get; set; } = string.Empty;
        
        // Navigation property
        public virtual ICollection<Person> Persons { get; set; } = new List<Person>();
    }
}
