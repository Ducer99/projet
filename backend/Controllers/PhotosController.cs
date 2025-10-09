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
    public class PhotosController : ControllerBase
    {
        private readonly FamilyTreeContext _context;

        public PhotosController(FamilyTreeContext context)
        {
            _context = context;
        }

        // POST: api/photos (upload photo)
        [HttpPost]
        public async Task<ActionResult> UploadPhoto([FromBody] UploadPhotoRequest request)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            
            var album = await _context.Albums.FindAsync(request.AlbumID);
            if (album == null)
            {
                return NotFound("Album non trouvé");
            }

            var photo = new Photo
            {
                AlbumID = request.AlbumID,
                Url = request.Url,
                ThumbnailUrl = request.ThumbnailUrl,
                Title = request.Title,
                Description = request.Description,
                DateTaken = request.DateTaken,
                Location = request.Location,
                UploadedBy = userId,
                FileSize = request.FileSize,
                Width = request.Width,
                Height = request.Height
            };

            _context.Photos.Add(photo);
            await _context.SaveChangesAsync();

            return Ok(new { photoID = photo.PhotoID });
        }

        // PUT: api/photos/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePhoto(int id, [FromBody] UpdatePhotoRequest request)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var photo = await _context.Photos.FindAsync(id);

            if (photo == null)
            {
                return NotFound();
            }

            // Seul l'uploader ou un admin peut modifier
            var connexion = await _context.Connexions.FindAsync(userId);
            if (photo.UploadedBy != userId && connexion?.Role != "Admin")
            {
                return Forbid();
            }

            photo.Title = request.Title ?? photo.Title;
            photo.Description = request.Description ?? photo.Description;
            photo.DateTaken = request.DateTaken ?? photo.DateTaken;
            photo.Location = request.Location ?? photo.Location;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/photos/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePhoto(int id)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var photo = await _context.Photos.FindAsync(id);

            if (photo == null)
            {
                return NotFound();
            }

            // Seul l'uploader ou un admin peut supprimer
            var connexion = await _context.Connexions.FindAsync(userId);
            if (photo.UploadedBy != userId && connexion?.Role != "Admin")
            {
                return Forbid();
            }

            _context.Photos.Remove(photo);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/photos/{id}/tag (taguer une personne)
        [HttpPost("{id}/tag")]
        public async Task<ActionResult> TagPerson(int id, [FromBody] TagPersonRequest request)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var photo = await _context.Photos.FindAsync(id);

            if (photo == null)
            {
                return NotFound();
            }

            // Vérifier si le tag existe déjà
            var existingTag = await _context.PhotoPersons
                .FirstOrDefaultAsync(pp => pp.PhotoID == id && pp.PersonID == request.PersonID);

            if (existingTag != null)
            {
                return BadRequest("Cette personne est déjà taguée sur cette photo");
            }

            var tag = new PhotoPerson
            {
                PhotoID = id,
                PersonID = request.PersonID,
                PositionX = request.PositionX,
                PositionY = request.PositionY,
                TaggedBy = userId
            };

            _context.PhotoPersons.Add(tag);
            await _context.SaveChangesAsync();

            return Ok(new { photoPersonID = tag.PhotoPersonID });
        }

        // DELETE: api/photos/{photoId}/tag/{personId}
        [HttpDelete("{photoId}/tag/{personId}")]
        public async Task<IActionResult> UntagPerson(int photoId, int personId)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            
            var tag = await _context.PhotoPersons
                .FirstOrDefaultAsync(pp => pp.PhotoID == photoId && pp.PersonID == personId);

            if (tag == null)
            {
                return NotFound();
            }

            // Seul le créateur du tag ou un admin peut supprimer
            var connexion = await _context.Connexions.FindAsync(userId);
            if (tag.TaggedBy != userId && connexion?.Role != "Admin")
            {
                return Forbid();
            }

            _context.PhotoPersons.Remove(tag);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/photos/{id}/like
        [HttpPost("{id}/like")]
        public async Task<ActionResult> LikePhoto(int id)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            
            var photo = await _context.Photos.FindAsync(id);
            if (photo == null)
            {
                return NotFound();
            }

            // Vérifier si déjà liké
            var existingLike = await _context.PhotoLikes
                .FirstOrDefaultAsync(l => l.PhotoID == id && l.UserID == userId);

            if (existingLike != null)
            {
                // Unlike
                _context.PhotoLikes.Remove(existingLike);
                await _context.SaveChangesAsync();
                return Ok(new { liked = false });
            }

            // Like
            var like = new PhotoLike
            {
                PhotoID = id,
                UserID = userId
            };

            _context.PhotoLikes.Add(like);
            await _context.SaveChangesAsync();

            return Ok(new { liked = true });
        }

        // GET: api/photos/person/{personId} (photos d'une personne)
        [HttpGet("person/{personId}")]
        public async Task<ActionResult> GetPersonPhotos(int personId)
        {
            var photos = await _context.PhotoPersons
                .Include(pp => pp.Photo)
                    .ThenInclude(p => p!.Album)
                .Include(pp => pp.Photo)
                    .ThenInclude(p => p!.Likes)
                .Where(pp => pp.PersonID == personId)
                .Select(pp => new
                {
                    photoID = pp.Photo!.PhotoID,
                    albumID = pp.Photo.AlbumID,
                    albumTitle = pp.Photo.Album!.Title,
                    url = pp.Photo.Url,
                    thumbnailUrl = pp.Photo.ThumbnailUrl,
                    title = pp.Photo.Title,
                    dateTaken = pp.Photo.DateTaken,
                    likeCount = pp.Photo.Likes.Count
                })
                .OrderByDescending(p => p.dateTaken)
                .ToListAsync();

            return Ok(photos);
        }
    }

    // DTOs
    public class UploadPhotoRequest
    {
        public int AlbumID { get; set; }
        public string Url { get; set; } = string.Empty;
        public string? ThumbnailUrl { get; set; }
        public string? Title { get; set; }
        public string? Description { get; set; }
        public DateTime? DateTaken { get; set; }
        public string? Location { get; set; }
        public long? FileSize { get; set; }
        public int? Width { get; set; }
        public int? Height { get; set; }
    }

    public class UpdatePhotoRequest
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public DateTime? DateTaken { get; set; }
        public string? Location { get; set; }
    }

    public class TagPersonRequest
    {
        public int PersonID { get; set; }
        public decimal? PositionX { get; set; }
        public decimal? PositionY { get; set; }
    }
}
