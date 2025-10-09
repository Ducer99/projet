using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using FamilyTreeAPI.Data;
using FamilyTreeAPI.Models;
using System.Security.Claims;

namespace FamilyTreeAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AlbumsController : ControllerBase
    {
        private readonly FamilyTreeContext _context;

        public AlbumsController(FamilyTreeContext context)
        {
            _context = context;
        }

        // GET: api/albums (tous les albums de la famille)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetFamilyAlbums()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var connexion = await _context.Connexions.FindAsync(userId);

            if (connexion == null || connexion.FamilyID == null)
            {
                return NotFound("Utilisateur ou famille non trouvé");
            }

            var familyId = connexion.FamilyID.Value;

            var albums = await _context.Albums
                .Include(a => a.Photos)
                .Include(a => a.Creator)
                .Where(a => a.FamilyID == familyId && 
                           (a.Visibility == "family" || 
                            a.CreatedBy == userId ||
                            a.Permissions.Any(p => p.UserID == userId && p.CanView)))
                .Select(a => new
                {
                    albumID = a.AlbumID,
                    title = a.Title,
                    description = a.Description,
                    coverPhotoUrl = a.CoverPhotoUrl ?? a.Photos.OrderByDescending(p => p.CreatedAt).Select(p => p.ThumbnailUrl).FirstOrDefault(),
                    visibility = a.Visibility,
                    photoCount = a.Photos.Count,
                    createdBy = a.Creator != null ? a.Creator.UserName : "Inconnu",
                    createdAt = a.CreatedAt,
                    lastPhotoDate = a.Photos.Any() ? a.Photos.Max(p => p.CreatedAt) : (DateTime?)null
                })
                .OrderByDescending(a => a.createdAt)
                .ToListAsync();

            return Ok(albums);
        }

        // GET: api/albums/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult> GetAlbum(int id)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var connexion = await _context.Connexions.FindAsync(userId);

            var album = await _context.Albums
                .Include(a => a.Creator)
                .Include(a => a.Event)
                .Include(a => a.Photos)
                    .ThenInclude(p => p.TaggedPersons)
                        .ThenInclude(pp => pp.Person)
                .Include(a => a.Photos)
                    .ThenInclude(p => p.Likes)
                .Include(a => a.Comments)
                    .ThenInclude(c => c.Author)
                .FirstOrDefaultAsync(a => a.AlbumID == id);

            if (album == null)
            {
                return NotFound();
            }

            // Vérifier les permissions
            if (album.Visibility == "private" && album.CreatedBy != userId && 
                !album.Permissions.Any(p => p.UserID == userId && p.CanView))
            {
                return Forbid();
            }

            var result = new
            {
                albumID = album.AlbumID,
                title = album.Title,
                description = album.Description,
                coverPhotoUrl = album.CoverPhotoUrl,
                visibility = album.Visibility,
                familyID = album.FamilyID,
                eventID = album.EventID,
                eventTitle = album.Event?.Title,
                createdBy = album.Creator?.UserName,
                createdAt = album.CreatedAt,
                photoCount = album.Photos.Count,
                commentCount = album.Comments.Count,
                photos = album.Photos.Select(p => new
                {
                    photoID = p.PhotoID,
                    url = p.Url,
                    thumbnailUrl = p.ThumbnailUrl,
                    title = p.Title,
                    description = p.Description,
                    dateTaken = p.DateTaken,
                    location = p.Location,
                    likeCount = p.Likes.Count,
                    isLikedByCurrentUser = p.Likes.Any(l => l.UserID == userId),
                    taggedPersons = p.TaggedPersons.Select(pp => new
                    {
                        personID = pp.PersonID,
                        name = $"{pp.Person?.FirstName} {pp.Person?.LastName}",
                        positionX = pp.PositionX,
                        positionY = pp.PositionY
                    }).ToList()
                }).OrderByDescending(p => p.dateTaken).ToList(),
                comments = album.Comments.Select(c => new
                {
                    commentID = c.CommentID,
                    content = c.Content,
                    authorName = c.Author?.UserName,
                    createdAt = c.CreatedAt
                }).OrderByDescending(c => c.createdAt).ToList()
            };

            return Ok(result);
        }

        // POST: api/albums
        [HttpPost]
        public async Task<ActionResult> CreateAlbum([FromBody] CreateAlbumRequest request)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var connexion = await _context.Connexions.FindAsync(userId);

            if (connexion == null || connexion.FamilyID == null)
            {
                return BadRequest("Utilisateur ou famille non trouvé");
            }

            var album = new Album
            {
                FamilyID = connexion.FamilyID.Value,
                EventID = request.EventID,
                Title = request.Title,
                Description = request.Description,
                Visibility = request.Visibility ?? "family",
                CreatedBy = userId
            };

            _context.Albums.Add(album);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAlbum), new { id = album.AlbumID }, new { albumID = album.AlbumID });
        }

        // PUT: api/albums/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAlbum(int id, [FromBody] UpdateAlbumRequest request)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var album = await _context.Albums.FindAsync(id);

            if (album == null)
            {
                return NotFound();
            }

            // Seul le créateur ou un admin peut modifier
            var connexion = await _context.Connexions.FindAsync(userId);
            if (album.CreatedBy != userId && connexion?.Role != "Admin")
            {
                return Forbid();
            }

            album.Title = request.Title ?? album.Title;
            album.Description = request.Description ?? album.Description;
            album.Visibility = request.Visibility ?? album.Visibility;
            album.CoverPhotoUrl = request.CoverPhotoUrl ?? album.CoverPhotoUrl;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/albums/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAlbum(int id)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var album = await _context.Albums.FindAsync(id);

            if (album == null)
            {
                return NotFound();
            }

            // Seul le créateur ou un admin peut supprimer
            var connexion = await _context.Connexions.FindAsync(userId);
            if (album.CreatedBy != userId && connexion?.Role != "Admin")
            {
                return Forbid();
            }

            _context.Albums.Remove(album);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/albums/{id}/comments
        [HttpPost("{id}/comments")]
        public async Task<ActionResult> AddComment(int id, [FromBody] AddCommentRequest request)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var album = await _context.Albums.FindAsync(id);

            if (album == null)
            {
                return NotFound();
            }

            var comment = new AlbumComment
            {
                AlbumID = id,
                AuthorID = userId,
                Content = request.Content
            };

            _context.AlbumComments.Add(comment);
            await _context.SaveChangesAsync();

            return Ok(new { commentID = comment.CommentID });
        }

        // GET: api/albums/stats (statistiques globales)
        [HttpGet("stats")]
        public async Task<ActionResult> GetAlbumStats()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var connexion = await _context.Connexions.FindAsync(userId);

            if (connexion == null || connexion.FamilyID == null)
            {
                return NotFound();
            }

            var familyId = connexion.FamilyID.Value;

            var totalAlbums = await _context.Albums.CountAsync(a => a.FamilyID == familyId);
            var totalPhotos = await _context.Photos.CountAsync(p => p.Album!.FamilyID == familyId);
            var totalComments = await _context.AlbumComments.CountAsync(c => c.Album!.FamilyID == familyId);
            var totalLikes = await _context.PhotoLikes.CountAsync(l => l.Photo!.Album!.FamilyID == familyId);

            return Ok(new
            {
                totalAlbums,
                totalPhotos,
                totalComments,
                totalLikes
            });
        }
    }

    // DTOs
    public class CreateAlbumRequest
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int? EventID { get; set; }
        public string? Visibility { get; set; }
    }

    public class UpdateAlbumRequest
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public string? Visibility { get; set; }
        public string? CoverPhotoUrl { get; set; }
    }

    public class AddCommentRequest
    {
        public string Content { get; set; } = string.Empty;
    }
}
