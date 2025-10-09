namespace FamilyTreeAPI.Models
{
    public class Poll
    {
        public int PollID { get; set; }
        public int FamilyID { get; set; }
        public int CreatorID { get; set; }
        public string Question { get; set; } = string.Empty;
        public string PollType { get; set; } = "single"; // "single" ou "multiple"
        public string? Description { get; set; }
        public DateTime StartDate { get; set; } = DateTime.UtcNow;
        public DateTime? EndDate { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public string? CreatorName { get; set; }
        public List<PollOption>? Options { get; set; }
        public int TotalVoters { get; set; }
        public bool HasUserVoted { get; set; }
        public bool IsCurrentlyActive { get; set; }
    }

    public class PollOption
    {
        public int OptionID { get; set; }
        public int PollID { get; set; }
        public string OptionText { get; set; } = string.Empty;
        public int OptionOrder { get; set; } = 0;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Statistiques
        public long VoteCount { get; set; }
        public decimal VotePercentage { get; set; }
        public bool UserVoted { get; set; }
    }

    public class PollVote
    {
        public int VoteID { get; set; }
        public int PollID { get; set; }
        public int OptionID { get; set; }
        public int VoterID { get; set; }
        public DateTime VotedAt { get; set; } = DateTime.UtcNow;
    }

    // DTOs
    public class CreatePollDto
    {
        public string Question { get; set; } = string.Empty;
        public string PollType { get; set; } = "single";
        public string? Description { get; set; }
        public DateTime? EndDate { get; set; }
        public List<string> Options { get; set; } = new();
    }

    public class VotePollDto
    {
        public List<int> OptionIDs { get; set; } = new();
    }

    public class PollResultDto
    {
        public Poll Poll { get; set; } = new();
        public List<PollOption> Results { get; set; } = new();
        public int TotalVotes { get; set; }
        public bool HasVoted { get; set; }
    }
}
