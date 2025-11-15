using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FamilyTreeAPI.Models
{
    // ==================== ENTITIES ====================
    
    [Table("polls")]
    public class Poll
    {
        [Key]
        [Column("pollid")]
        public int PollID { get; set; }
        
        [Required]
        [Column("familyid")]
        public int FamilyID { get; set; }
        
        [Required]
        [Column("creatorid")]
        public int CreatorID { get; set; }
        
        [Required]
        [Column("question")]
        public string Question { get; set; } = string.Empty;
        
        [Required]
        [Column("polltype")]
        [StringLength(20)]
        public string PollType { get; set; } = "single"; // 'single' or 'multiple'
        
        [Column("description")]
        public string? Description { get; set; }
        
        [Column("startdate")]
        public DateTime? StartDate { get; set; }
        
        [Column("enddate")]
        public DateTime? EndDate { get; set; }
        
        [Column("isactive")]
        public bool IsActive { get; set; } = true;
        
        [Column("createdat")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        [Column("updatedat")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        // 🎯 Système de ciblage des participants
        [Column("visibility_type")]
        [StringLength(20)]
        public string VisibilityType { get; set; } = "all"; // 'all', 'lineage', 'generation', 'manual'
        
        [Column("target_audience", TypeName = "jsonb")]
        public string? TargetAudience { get; set; } // JSON: {familyIds: [1,2], generationLevel: 2, personIds: [10,15]}
        
        [Column("description_visibility")]
        public string? DescriptionVisibility { get; set; }
        
        // Navigation properties
        public List<PollOption> Options { get; set; } = new();
    }
    
    // Table de jointure pour participants manuels
    [Table("poll_participants")]
    public class PollParticipant
    {
        [Key]
        [Column("participant_id")]
        public int ParticipantId { get; set; }
        
        [Required]
        [Column("pollid")]
        public int PollId { get; set; }
        
        [Required]
        [Column("personid")]
        public int PersonId { get; set; }
        
        [Column("added_at")]
        public DateTime AddedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation
        public Poll? Poll { get; set; }
    }
    
    [Table("polloptions")]
    public class PollOption
    {
        [Key]
        [Column("optionid")]
        public int OptionID { get; set; }
        
        [Required]
        [Column("pollid")]
        public int PollID { get; set; }
        
        [Required]
        [Column("optiontext")]
        public string OptionText { get; set; } = string.Empty;
        
        [Column("optionorder")]
        public int OptionOrder { get; set; }
        
        [Column("createdat")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation
        public Poll? Poll { get; set; }
        
        // For DTOs - not mapped
        [NotMapped]
        public int VoteCount { get; set; }
        
        [NotMapped]
        public decimal VotePercentage { get; set; }
        
        [NotMapped]
        public bool UserVoted { get; set; }
    }
    
    [Table("pollvotes")]
    public class PollVote
    {
        [Key]
        [Column("voteid")]
        public int VoteID { get; set; }
        
        [Required]
        [Column("pollid")]
        public int PollID { get; set; }
        
        [Required]
        [Column("optionid")]
        public int OptionID { get; set; }
        
        [Required]
        [Column("voterid")]
        public int VoterID { get; set; }
        
        [Column("votedat")]
        public DateTime VotedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation
        public Poll? Poll { get; set; }
        public PollOption? Option { get; set; }
    }
    
    // ==================== DTOs ====================
    
    public class CreatePollDto
    {
        [Required(ErrorMessage = "La question est requise")]
        public string Question { get; set; } = string.Empty;
        
        public string? Description { get; set; }
        
        [Required(ErrorMessage = "Le type de sondage est requis")]
        [RegularExpression("^(single|multiple)$", ErrorMessage = "Type invalide")]
        public string PollType { get; set; } = "single";
        
        public DateTime? EndDate { get; set; }
        
        [Required(ErrorMessage = "Au moins 2 options sont requises")]
        [MinLength(2, ErrorMessage = "Minimum 2 options")]
        [MaxLength(6, ErrorMessage = "Maximum 6 options")]
        public List<CreatePollOptionDto> Options { get; set; } = new();
        
        // 🎯 Ciblage des participants
        [RegularExpression("^(all|lineage|generation|manual)$", ErrorMessage = "Type de visibilité invalide")]
        public string VisibilityType { get; set; } = "all";
        
        public PollTargetAudienceDto? TargetAudience { get; set; }
    }
    
    // DTO pour définir l'audience ciblée
    public class PollTargetAudienceDto
    {
        // Pour ciblage par lignée
        public string? LineageType { get; set; } // 'paternal' ou 'maternal'
        public List<int>? FamilyIds { get; set; } // IDs des familles (PaternalFamilyID ou MaternalFamilyID)
        
        // Pour ciblage par génération
        public int? GenerationLevel { get; set; } // Niveau de génération (1, 2, 3, etc.)
        public List<int>? AncestorIds { get; set; } // IDs des ancêtres de référence
        
        // Pour ciblage manuel
        public List<int>? PersonIds { get; set; } // IDs des personnes spécifiques
    }
    
    public class CreatePollOptionDto
    {
        [Required(ErrorMessage = "Le texte de l'option est requis")]
        [StringLength(200, ErrorMessage = "Maximum 200 caractères")]
        public string OptionText { get; set; } = string.Empty;
        
        public int OptionOrder { get; set; }
    }
    
    public class VotePollDto
    {
        [Required(ErrorMessage = "Vous devez sélectionner au moins une option")]
        [MinLength(1, ErrorMessage = "Sélectionnez au moins une option")]
        public List<int> OptionIds { get; set; } = new();
    }
    
    public class PollListDto
    {
        public int PollID { get; set; }
        public string Question { get; set; } = string.Empty;
        public string PollType { get; set; } = string.Empty;
        public DateTime? EndDate { get; set; }
        public DateTime CreatedAt { get; set; }
        public string CreatorName { get; set; } = string.Empty;
        public int TotalVoters { get; set; }
        public bool HasUserVoted { get; set; }
        public string VisibilityType { get; set; } = "all"; // Pour afficher l'audience ciblée
    }
    
    public class PollResultDto
    {
        public int PollID { get; set; }
        public string Question { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string PollType { get; set; } = string.Empty;
        public DateTime? EndDate { get; set; }
        public DateTime CreatedAt { get; set; }
        public string CreatorName { get; set; } = string.Empty;
        public int CreatorID { get; set; }
        public int TotalVoters { get; set; }
        public bool HasUserVoted { get; set; }
        public List<PollOption> Options { get; set; } = new();
        public string VisibilityType { get; set; } = "all";
        public string? TargetAudienceDescription { get; set; } // Description lisible de l'audience
    }
}

