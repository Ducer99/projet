using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Npgsql;
using FamilyTreeAPI.Models;

namespace FamilyTreeAPI.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class PollsController : ControllerBase
    {
        private readonly string _connectionString;
        private readonly ILogger<PollsController> _logger;

        public PollsController(IConfiguration configuration, ILogger<PollsController> logger)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection") 
                ?? throw new InvalidOperationException("Connection string not found");
            _logger = logger;
        }

        // GET: api/polls
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Poll>>> GetPolls([FromQuery] bool activeOnly = true)
        {
            try
            {
                var userIdClaim = User.FindFirst("UserId")?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized(new { message = "Invalid user token" });
                }

                var familyIdClaim = User.FindFirst("FamilyId")?.Value;
                if (string.IsNullOrEmpty(familyIdClaim) || !int.TryParse(familyIdClaim, out int familyId))
                {
                    return BadRequest(new { message = "Family ID not found" });
                }

                var polls = new List<Poll>();

                await using var conn = new NpgsqlConnection(_connectionString);
                await conn.OpenAsync();

                var query = @"
                    SELECT 
                        p.PollID, p.FamilyID, p.CreatorID, p.Question, p.PollType,
                        p.Description, p.StartDate, p.EndDate, p.IsActive,
                        p.CreatedAt, p.UpdatedAt,
                        c.UserName AS CreatorName,
                        (SELECT COUNT(DISTINCT VoterID) FROM PollVotes WHERE PollID = p.PollID) AS TotalVoters,
                        CASE 
                            WHEN p.EndDate IS NOT NULL AND p.EndDate < CURRENT_TIMESTAMP THEN FALSE
                            ELSE p.IsActive
                        END AS IsCurrentlyActive,
                        EXISTS(SELECT 1 FROM PollVotes WHERE PollID = p.PollID AND VoterID = @userId) AS HasUserVoted
                    FROM Polls p
                    INNER JOIN Connexion c ON p.CreatorID = c.ConnexionID
                    WHERE p.FamilyID = @familyId";

                if (activeOnly)
                {
                    query += @" AND p.IsActive = TRUE 
                               AND (p.EndDate IS NULL OR p.EndDate > CURRENT_TIMESTAMP)";
                }

                query += " ORDER BY p.CreatedAt DESC";

                await using var cmd = new NpgsqlCommand(query, conn);
                cmd.Parameters.AddWithValue("familyId", familyId);
                cmd.Parameters.AddWithValue("userId", userId);

                await using var reader = await cmd.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                {
                    polls.Add(new Poll
                    {
                        PollID = reader.GetInt32(0),
                        FamilyID = reader.GetInt32(1),
                        CreatorID = reader.GetInt32(2),
                        Question = reader.GetString(3),
                        PollType = reader.GetString(4),
                        Description = reader.IsDBNull(5) ? null : reader.GetString(5),
                        StartDate = reader.GetDateTime(6),
                        EndDate = reader.IsDBNull(7) ? null : reader.GetDateTime(7),
                        IsActive = reader.GetBoolean(8),
                        CreatedAt = reader.GetDateTime(9),
                        UpdatedAt = reader.GetDateTime(10),
                        CreatorName = reader.GetString(11),
                        TotalVoters = reader.GetInt32(12),
                        IsCurrentlyActive = reader.GetBoolean(13),
                        HasUserVoted = reader.GetBoolean(14)
                    });
                }

                return Ok(polls);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching polls");
                return StatusCode(500, new { message = "Error fetching polls" });
            }
        }

        // GET: api/polls/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<PollResultDto>> GetPoll(int id)
        {
            try
            {
                var userIdClaim = User.FindFirst("UserId")?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized(new { message = "Invalid user token" });
                }

                await using var conn = new NpgsqlConnection(_connectionString);
                await conn.OpenAsync();

                // Get poll details
                var pollQuery = @"
                    SELECT 
                        p.PollID, p.FamilyID, p.CreatorID, p.Question, p.PollType,
                        p.Description, p.StartDate, p.EndDate, p.IsActive,
                        c.UserName AS CreatorName,
                        EXISTS(SELECT 1 FROM PollVotes WHERE PollID = p.PollID AND VoterID = @userId) AS HasUserVoted
                    FROM Polls p
                    INNER JOIN Connexion c ON p.CreatorID = c.ConnexionID
                    WHERE p.PollID = @pollId";

                Poll? poll = null;
                await using (var cmd = new NpgsqlCommand(pollQuery, conn))
                {
                    cmd.Parameters.AddWithValue("pollId", id);
                    cmd.Parameters.AddWithValue("userId", userId);

                    await using var reader = await cmd.ExecuteReaderAsync();
                    if (await reader.ReadAsync())
                    {
                        poll = new Poll
                        {
                            PollID = reader.GetInt32(0),
                            FamilyID = reader.GetInt32(1),
                            CreatorID = reader.GetInt32(2),
                            Question = reader.GetString(3),
                            PollType = reader.GetString(4),
                            Description = reader.IsDBNull(5) ? null : reader.GetString(5),
                            StartDate = reader.GetDateTime(6),
                            EndDate = reader.IsDBNull(7) ? null : reader.GetDateTime(7),
                            IsActive = reader.GetBoolean(8),
                            CreatorName = reader.GetString(9),
                            HasUserVoted = reader.GetBoolean(10)
                        };
                    }
                }

                if (poll == null)
                {
                    return NotFound(new { message = "Poll not found" });
                }

                // Get poll results
                var resultsQuery = @"SELECT * FROM get_poll_results(@pollId)";
                var results = new List<PollOption>();
                var totalVotes = 0;

                await using (var cmd = new NpgsqlCommand(resultsQuery, conn))
                {
                    cmd.Parameters.AddWithValue("pollId", id);

                    await using var reader = await cmd.ExecuteReaderAsync();
                    while (await reader.ReadAsync())
                    {
                        var voteCount = reader.GetInt64(2);
                        totalVotes += (int)voteCount;

                        results.Add(new PollOption
                        {
                            OptionID = reader.GetInt32(0),
                            OptionText = reader.GetString(1),
                            VoteCount = voteCount,
                            VotePercentage = reader.GetDecimal(3)
                        });
                    }
                }

                // Check which options user voted for
                if (poll.HasUserVoted)
                {
                    var userVotesQuery = @"
                        SELECT OptionID 
                        FROM PollVotes 
                        WHERE PollID = @pollId AND VoterID = @userId";

                    await using var cmd = new NpgsqlCommand(userVotesQuery, conn);
                    cmd.Parameters.AddWithValue("pollId", id);
                    cmd.Parameters.AddWithValue("userId", userId);

                    await using var reader = await cmd.ExecuteReaderAsync();
                    while (await reader.ReadAsync())
                    {
                        var optionId = reader.GetInt32(0);
                        var option = results.FirstOrDefault(o => o.OptionID == optionId);
                        if (option != null)
                        {
                            option.UserVoted = true;
                        }
                    }
                }

                return Ok(new PollResultDto
                {
                    Poll = poll,
                    Results = results,
                    TotalVotes = totalVotes,
                    HasVoted = poll.HasUserVoted
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching poll details");
                return StatusCode(500, new { message = "Error fetching poll details" });
            }
        }

        // POST: api/polls
        [HttpPost]
        public async Task<ActionResult<Poll>> CreatePoll([FromBody] CreatePollDto dto)
        {
            try
            {
                var userIdClaim = User.FindFirst("UserId")?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized(new { message = "Invalid user token" });
                }

                var familyIdClaim = User.FindFirst("FamilyId")?.Value;
                if (string.IsNullOrEmpty(familyIdClaim) || !int.TryParse(familyIdClaim, out int familyId))
                {
                    return BadRequest(new { message = "Family ID not found" });
                }

                if (string.IsNullOrWhiteSpace(dto.Question))
                {
                    return BadRequest(new { message = "Question is required" });
                }

                if (dto.Options == null || dto.Options.Count < 2)
                {
                    return BadRequest(new { message = "At least 2 options are required" });
                }

                if (dto.Options.Count > 6)
                {
                    return BadRequest(new { message = "Maximum 6 options allowed" });
                }

                await using var conn = new NpgsqlConnection(_connectionString);
                await conn.OpenAsync();
                await using var transaction = await conn.BeginTransactionAsync();

                try
                {
                    // Insert poll
                    var pollQuery = @"
                        INSERT INTO Polls (FamilyID, CreatorID, Question, PollType, Description, EndDate)
                        VALUES (@familyId, @creatorId, @question, @pollType, @description, @endDate)
                        RETURNING PollID";

                    int pollId;
                    await using (var cmd = new NpgsqlCommand(pollQuery, conn, transaction))
                    {
                        cmd.Parameters.AddWithValue("familyId", familyId);
                        cmd.Parameters.AddWithValue("creatorId", userId);
                        cmd.Parameters.AddWithValue("question", dto.Question);
                        cmd.Parameters.AddWithValue("pollType", dto.PollType);
                        cmd.Parameters.AddWithValue("description", (object?)dto.Description ?? DBNull.Value);
                        cmd.Parameters.AddWithValue("endDate", (object?)dto.EndDate ?? DBNull.Value);

                        pollId = (int)(await cmd.ExecuteScalarAsync() ?? 0);
                    }

                    // Insert options
                    for (int i = 0; i < dto.Options.Count; i++)
                    {
                        var optionQuery = @"
                            INSERT INTO PollOptions (PollID, OptionText, OptionOrder)
                            VALUES (@pollId, @optionText, @optionOrder)";

                        await using var cmd = new NpgsqlCommand(optionQuery, conn, transaction);
                        cmd.Parameters.AddWithValue("pollId", pollId);
                        cmd.Parameters.AddWithValue("optionText", dto.Options[i]);
                        cmd.Parameters.AddWithValue("optionOrder", i + 1);

                        await cmd.ExecuteNonQueryAsync();
                    }

                    await transaction.CommitAsync();

                    return CreatedAtAction(nameof(GetPoll), new { id = pollId }, new { pollId });
                }
                catch
                {
                    await transaction.RollbackAsync();
                    throw;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating poll");
                return StatusCode(500, new { message = "Error creating poll" });
            }
        }

        // POST: api/polls/{id}/vote
        [HttpPost("{id}/vote")]
        public async Task<ActionResult> VotePoll(int id, [FromBody] VotePollDto dto)
        {
            try
            {
                var userIdClaim = User.FindFirst("UserId")?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized(new { message = "Invalid user token" });
                }

                if (dto.OptionIDs == null || dto.OptionIDs.Count == 0)
                {
                    return BadRequest(new { message = "At least one option must be selected" });
                }

                await using var conn = new NpgsqlConnection(_connectionString);
                await conn.OpenAsync();

                // Check poll type and if already voted
                var checkQuery = @"
                    SELECT PollType, 
                           EXISTS(SELECT 1 FROM PollVotes WHERE PollID = @pollId AND VoterID = @userId) AS HasVoted,
                           CASE 
                               WHEN EndDate IS NOT NULL AND EndDate < CURRENT_TIMESTAMP THEN FALSE
                               ELSE IsActive
                           END AS IsCurrentlyActive
                    FROM Polls 
                    WHERE PollID = @pollId";

                string? pollType = null;
                bool hasVoted = false;
                bool isActive = false;

                await using (var cmd = new NpgsqlCommand(checkQuery, conn))
                {
                    cmd.Parameters.AddWithValue("pollId", id);
                    cmd.Parameters.AddWithValue("userId", userId);

                    await using var reader = await cmd.ExecuteReaderAsync();
                    if (await reader.ReadAsync())
                    {
                        pollType = reader.GetString(0);
                        hasVoted = reader.GetBoolean(1);
                        isActive = reader.GetBoolean(2);
                    }
                    else
                    {
                        return NotFound(new { message = "Poll not found" });
                    }
                }

                if (!isActive)
                {
                    return BadRequest(new { message = "This poll is no longer active" });
                }

                if (hasVoted)
                {
                    return BadRequest(new { message = "You have already voted in this poll" });
                }

                if (pollType == "single" && dto.OptionIDs.Count > 1)
                {
                    return BadRequest(new { message = "Only one option can be selected for this poll" });
                }

                await using var transaction = await conn.BeginTransactionAsync();

                try
                {
                    foreach (var optionId in dto.OptionIDs)
                    {
                        var voteQuery = @"
                            INSERT INTO PollVotes (PollID, OptionID, VoterID)
                            VALUES (@pollId, @optionId, @voterId)";

                        await using var cmd = new NpgsqlCommand(voteQuery, conn, transaction);
                        cmd.Parameters.AddWithValue("pollId", id);
                        cmd.Parameters.AddWithValue("optionId", optionId);
                        cmd.Parameters.AddWithValue("voterId", userId);

                        await cmd.ExecuteNonQueryAsync();
                    }

                    await transaction.CommitAsync();
                    return Ok(new { message = "Vote recorded successfully" });
                }
                catch
                {
                    await transaction.RollbackAsync();
                    throw;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error voting in poll");
                return StatusCode(500, new { message = "Error recording vote" });
            }
        }

        // DELETE: api/polls/{id}
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeletePoll(int id)
        {
            try
            {
                var userIdClaim = User.FindFirst("UserId")?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized(new { message = "Invalid user token" });
                }

                var roleClaim = User.FindFirst("Role")?.Value;
                var isAdmin = roleClaim == "Admin";

                await using var conn = new NpgsqlConnection(_connectionString);
                await conn.OpenAsync();

                // Check if user is creator or admin
                var checkQuery = "SELECT CreatorID FROM Polls WHERE PollID = @pollId";
                int creatorId;

                await using (var cmd = new NpgsqlCommand(checkQuery, conn))
                {
                    cmd.Parameters.AddWithValue("pollId", id);
                    var result = await cmd.ExecuteScalarAsync();

                    if (result == null)
                    {
                        return NotFound(new { message = "Poll not found" });
                    }

                    creatorId = (int)result;
                }

                if (!isAdmin && creatorId != userId)
                {
                    return Forbid();
                }

                var deleteQuery = "DELETE FROM Polls WHERE PollID = @pollId";
                await using (var cmd = new NpgsqlCommand(deleteQuery, conn))
                {
                    cmd.Parameters.AddWithValue("pollId", id);
                    await cmd.ExecuteNonQueryAsync();
                }

                return Ok(new { message = "Poll deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting poll");
                return StatusCode(500, new { message = "Error deleting poll" });
            }
        }
    }
}
