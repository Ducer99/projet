using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using FamilyTreeAPI.Data;
using FamilyTreeAPI.Models;
using FamilyTreeAPI.Services;
using System.Text.Json;

namespace FamilyTreeAPI.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/polls")]
    public class PollsController : ControllerBase
    {
        private readonly FamilyTreeContext _context;
        private readonly PollAudienceService _audienceService;
        private readonly ILogger<PollsController> _logger;

        public PollsController(
            FamilyTreeContext context,
            PollAudienceService audienceService,
            ILogger<PollsController> logger)
        {
            _context = context;
            _audienceService = audienceService;
            _logger = logger;
        }

        // GET: api/polls/test - Simple endpoint de test
        [HttpGet("test")]
        [AllowAnonymous]
        public IActionResult TestEndpoint()
        {
            return Ok(new { message = "PollsController is working!", timestamp = DateTime.UtcNow });
        }

        // GET: api/polls
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PollListDto>>> GetPolls([FromQuery] bool activeOnly = true)
        {
            try
            {
                var userIdClaim = User.FindFirst("id")?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized(new { message = "Invalid user token" });
                }

                var familyIdClaim = User.FindFirst("familyId")?.Value;
                if (string.IsNullOrEmpty(familyIdClaim) || !int.TryParse(familyIdClaim, out int familyId))
                {
                    return BadRequest(new { message = "Family ID not found" });
                }

                var pollsQuery = _context.Polls
                    .Include(p => p.Options)
                    .Where(p => p.FamilyID == familyId);

                if (activeOnly)
                {
                    var now = DateTime.UtcNow;
                    pollsQuery = pollsQuery.Where(p => p.IsActive && (p.EndDate == null || p.EndDate > now));
                }

                var polls = await pollsQuery
                    .OrderByDescending(p => p.CreatedAt)
                    .ToListAsync();

                // 🎯 FILTRAGE PAR AUDIENCE: Ne garder que les sondages accessibles
                var accessiblePolls = new List<Poll>();
                foreach (var poll in polls)
                {
                    if (await _audienceService.CanUserAccessPoll(userId, poll))
                    {
                        accessiblePolls.Add(poll);
                    }
                }

                // Get creator names
                var creatorIds = accessiblePolls.Select(p => p.CreatorID).Distinct().ToList();
                var creators = await _context.Connexions
                    .Where(c => creatorIds.Contains(c.ConnexionID))
                    .Include(c => c.Person)
                    .Select(c => new { c.ConnexionID, Name = c.Person != null ? c.Person.FirstName + " " + c.Person.LastName : c.UserName })
                    .ToListAsync();

                var pollDtos = accessiblePolls.Select(poll => {
                    var creator = creators.FirstOrDefault(c => c.ConnexionID == poll.CreatorID);
                    var voterIds = _context.PollVotes.Where(v => v.PollID == poll.PollID).Select(v => v.VoterID).Distinct().Count();
                    var hasVoted = _context.PollVotes.Any(v => v.PollID == poll.PollID && v.VoterID == userId);
                    
                    return new PollListDto
                    {
                        PollID = poll.PollID,
                        Question = poll.Question,
                        PollType = poll.PollType,
                        EndDate = poll.EndDate,
                        CreatedAt = poll.CreatedAt,
                        CreatorName = creator?.Name ?? "Unknown",
                        TotalVoters = voterIds,
                        HasUserVoted = hasVoted,
                        VisibilityType = poll.VisibilityType
                    };
                }).ToList();

                return Ok(pollDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching polls");
                return StatusCode(500, new { message = "An error occurred while fetching polls", error = ex.Message });
            }
        }

        // GET: api/polls/5
        [HttpGet("{id}")]
        public async Task<ActionResult<PollResultDto>> GetPoll(int id)
        {
            try
            {
                var userIdClaim = User.FindFirst("id")?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized(new { message = "Invalid user token" });
                }

                var familyIdClaim = User.FindFirst("familyId")?.Value;
                if (string.IsNullOrEmpty(familyIdClaim) || !int.TryParse(familyIdClaim, out int familyId))
                {
                    return BadRequest(new { message = "Family ID not found" });
                }

                var poll = await _context.Polls
                    .Include(p => p.Options)
                    .FirstOrDefaultAsync(p => p.PollID == id && p.FamilyID == familyId);

                if (poll == null)
                {
                    return NotFound(new { message = "Poll not found" });
                }

                // 🎯 VÉRIFICATION D'ACCÈS: L'utilisateur peut-il voir ce sondage ?
                if (!await _audienceService.CanUserAccessPoll(userId, poll))
                {
                    return Forbid();
                }

                // Get creator name
                var creator = await _context.Connexions
                    .Where(c => c.ConnexionID == poll.CreatorID)
                    .Include(c => c.Person)
                    .Select(c => new { Name = c.Person != null ? c.Person.FirstName + " " + c.Person.LastName : c.UserName })
                    .FirstOrDefaultAsync();

                // Check if user has voted
                var userVotes = await _context.PollVotes
                    .Where(v => v.PollID == id && v.VoterID == userId)
                    .Select(v => v.OptionID)
                    .ToListAsync();

                // Calculate vote counts for each option
                var voteCounts = await _context.PollVotes
                    .Where(v => v.PollID == id)
                    .GroupBy(v => v.OptionID)
                    .Select(g => new { OptionID = g.Key, Count = g.Count() })
                    .ToListAsync();

                var totalVoters = await _context.PollVotes
                    .Where(v => v.PollID == id)
                    .Select(v => v.VoterID)
                    .Distinct()
                    .CountAsync();

                // Build options with vote data
                var options = poll.Options?.Select(o => {
                    var voteCount = voteCounts.FirstOrDefault(vc => vc.OptionID == o.OptionID)?.Count ?? 0;
                    return new PollOption
                    {
                        OptionID = o.OptionID,
                        PollID = o.PollID,
                        OptionText = o.OptionText,
                        OptionOrder = o.OptionOrder,
                        VoteCount = voteCount,
                        VotePercentage = totalVoters > 0 ? Math.Round((decimal)voteCount / totalVoters * 100, 1) : 0,
                        UserVoted = userVotes.Contains(o.OptionID)
                    };
                }).OrderBy(o => o.OptionOrder).ToList() ?? new List<PollOption>();

                // Get audience description
                var audienceDescription = await _audienceService.GetAudienceDescription(poll);

                var pollDto = new PollResultDto
                {
                    PollID = poll.PollID,
                    Question = poll.Question,
                    Description = poll.Description,
                    PollType = poll.PollType,
                    EndDate = poll.EndDate,
                    CreatedAt = poll.CreatedAt,
                    CreatorName = creator?.Name ?? "Unknown",
                    CreatorID = poll.CreatorID,
                    TotalVoters = totalVoters,
                    HasUserVoted = userVotes.Any(),
                    Options = options,
                    VisibilityType = poll.VisibilityType,
                    TargetAudienceDescription = audienceDescription
                };

                return Ok(pollDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error fetching poll {id}");
                return StatusCode(500, new { message = "An error occurred while fetching the poll", error = ex.Message });
            }
        }

        // POST: api/polls
        [HttpPost]
        public async Task<ActionResult<Poll>> CreatePoll([FromBody] CreatePollDto pollDto)
        {
            try
            {
                var userIdClaim = User.FindFirst("id")?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized(new { message = "Invalid user token" });
                }

                var familyIdClaim = User.FindFirst("familyId")?.Value;
                if (string.IsNullOrEmpty(familyIdClaim) || !int.TryParse(familyIdClaim, out int familyId))
                {
                    return BadRequest(new { message = "Family ID not found" });
                }

                if (pollDto.Options == null || pollDto.Options.Count < 2)
                {
                    return BadRequest(new { message = "At least 2 options are required" });
                }

                // Sérialiser le target_audience en JSON
                string? targetAudienceJson = null;
                if (pollDto.TargetAudience != null && pollDto.VisibilityType != "all")
                {
                    targetAudienceJson = JsonSerializer.Serialize(pollDto.TargetAudience);
                }

                var poll = new Poll
                {
                    FamilyID = familyId,
                    CreatorID = userId,
                    Question = pollDto.Question,
                    Description = pollDto.Description,
                    PollType = pollDto.PollType,
                    EndDate = pollDto.EndDate,
                    IsActive = true,
                    StartDate = DateTime.UtcNow,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    VisibilityType = pollDto.VisibilityType,
                    TargetAudience = targetAudienceJson
                };

                _context.Polls.Add(poll);
                await _context.SaveChangesAsync();

                // Add options
                var options = pollDto.Options.Select((opt, index) => new PollOption
                {
                    PollID = poll.PollID,
                    OptionText = opt.OptionText,
                    OptionOrder = index + 1,
                    CreatedAt = DateTime.UtcNow
                }).ToList();

                _context.PollOptions.AddRange(options);

                // Si ciblage manuel, ajouter les participants
                if (pollDto.VisibilityType == "manual" && 
                    pollDto.TargetAudience?.PersonIds != null && 
                    pollDto.TargetAudience.PersonIds.Any())
                {
                    var participants = pollDto.TargetAudience.PersonIds.Select(personId => new PollParticipant
                    {
                        PollId = poll.PollID,
                        PersonId = personId,
                        AddedAt = DateTime.UtcNow
                    }).ToList();

                    _context.PollParticipants.AddRange(participants);
                }

                await _context.SaveChangesAsync();

                poll.Options = options;

                return CreatedAtAction(nameof(GetPoll), new { id = poll.PollID }, poll);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating poll");
                return StatusCode(500, new { message = "An error occurred while creating the poll", error = ex.Message });
            }
        }

        // POST: api/polls/5/vote
        [HttpPost("{id}/vote")]
        public async Task<ActionResult> Vote(int id, [FromBody] VotePollDto voteDto)
        {
            try
            {
                var userIdClaim = User.FindFirst("id")?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized(new { message = "Invalid user token" });
                }

                var familyIdClaim = User.FindFirst("familyId")?.Value;
                if (string.IsNullOrEmpty(familyIdClaim) || !int.TryParse(familyIdClaim, out int familyId))
                {
                    return BadRequest(new { message = "Family ID not found" });
                }

                var poll = await _context.Polls
                    .Include(p => p.Options)
                    .FirstOrDefaultAsync(p => p.PollID == id && p.FamilyID == familyId);

                if (poll == null)
                {
                    return NotFound(new { message = "Poll not found" });
                }

                // 🎯 VÉRIFICATION D'ACCÈS: L'utilisateur peut-il voter sur ce sondage ?
                if (!await _audienceService.CanUserAccessPoll(userId, poll))
                {
                    return Forbid();
                }

                if (!poll.IsActive || (poll.EndDate.HasValue && poll.EndDate.Value < DateTime.UtcNow))
                {
                    return BadRequest(new { message = "Poll is closed" });
                }

                // Check if user already voted
                var existingVotes = await _context.PollVotes
                    .Where(v => v.PollID == id && v.VoterID == userId)
                    .ToListAsync();

                if (existingVotes.Any())
                {
                    return BadRequest(new { message = "You have already voted in this poll" });
                }

                // Validate option IDs
                if (voteDto.OptionIds == null || !voteDto.OptionIds.Any())
                {
                    return BadRequest(new { message = "No options selected" });
                }

                var validOptionIds = poll.Options?.Select(o => o.OptionID).ToList() ?? new List<int>();
                if (!voteDto.OptionIds.All(oid => validOptionIds.Contains(oid)))
                {
                    return BadRequest(new { message = "Invalid option selected" });
                }

                // For single choice, only allow one option
                if (poll.PollType == "single" && voteDto.OptionIds.Count > 1)
                {
                    return BadRequest(new { message = "Only one option allowed for single choice polls" });
                }

                // Record votes
                foreach (var optionId in voteDto.OptionIds)
                {
                    var vote = new PollVote
                    {
                        PollID = id,
                        OptionID = optionId,
                        VoterID = userId,
                        VotedAt = DateTime.UtcNow
                    };
                    _context.PollVotes.Add(vote);
                }

                await _context.SaveChangesAsync();

                return Ok(new { message = "Vote recorded successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error voting on poll {id}");
                return StatusCode(500, new { message = "An error occurred while recording your vote", error = ex.Message });
            }
        }

        // DELETE: api/polls/5
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeletePoll(int id)
        {
            try
            {
                var userIdClaim = User.FindFirst("id")?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized(new { message = "Invalid user token" });
                }

                var familyIdClaim = User.FindFirst("familyId")?.Value;
                if (string.IsNullOrEmpty(familyIdClaim) || !int.TryParse(familyIdClaim, out int familyId))
                {
                    return BadRequest(new { message = "Family ID not found" });
                }

                var roleClaim = User.FindFirst("role")?.Value;

                var poll = await _context.Polls
                    .FirstOrDefaultAsync(p => p.PollID == id && p.FamilyID == familyId);

                if (poll == null)
                {
                    return NotFound(new { message = "Poll not found" });
                }

                // Only creator or admin can delete
                if (poll.CreatorID != userId && roleClaim != "Admin")
                {
                    return Forbid();
                }

                // Delete votes first (cascade)
                var votes = await _context.PollVotes.Where(v => v.PollID == id).ToListAsync();
                _context.PollVotes.RemoveRange(votes);

                // Delete options
                var options = await _context.PollOptions.Where(o => o.PollID == id).ToListAsync();
                _context.PollOptions.RemoveRange(options);

                // Delete participants (manual targeting)
                var participants = await _context.PollParticipants.Where(pp => pp.PollId == id).ToListAsync();
                _context.PollParticipants.RemoveRange(participants);

                // Delete poll
                _context.Polls.Remove(poll);
                
                await _context.SaveChangesAsync();

                return Ok(new { message = "Poll deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting poll {id}");
                return StatusCode(500, new { message = "An error occurred while deleting the poll", error = ex.Message });
            }
        }

        // GET: api/polls/families - Récupère les familles disponibles pour le ciblage
        [HttpGet("families")]
        public async Task<ActionResult<IEnumerable<Family>>> GetFamilies()
        {
            try
            {
                var familyIdClaim = User.FindFirst("familyId")?.Value;
                if (string.IsNullOrEmpty(familyIdClaim) || !int.TryParse(familyIdClaim, out int familyId))
                {
                    return BadRequest(new { message = "Family ID not found" });
                }

                var families = await _audienceService.GetAvailableFamilies(familyId);
                return Ok(families);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching families");
                return StatusCode(500, new { message = "An error occurred while fetching families", error = ex.Message });
            }
        }

        // GET: api/polls/members - Récupère les membres de la famille pour le ciblage manuel
        [HttpGet("members")]
        public async Task<ActionResult<IEnumerable<object>>> GetFamilyMembers()
        {
            try
            {
                var familyIdClaim = User.FindFirst("familyId")?.Value;
                if (string.IsNullOrEmpty(familyIdClaim) || !int.TryParse(familyIdClaim, out int familyId))
                {
                    return BadRequest(new { message = "Family ID not found" });
                }

                var members = await _audienceService.GetFamilyMembers(familyId);
                var result = members.Select(m => new
                {
                    m.PersonID,
                    FullName = $"{m.FirstName} {m.LastName}",
                    m.FirstName,
                    m.LastName,
                    m.PhotoUrl
                }).ToList();

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching family members");
                return StatusCode(500, new { message = "An error occurred while fetching family members", error = ex.Message });
            }
        }
    }
}
