using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FamilyTreeAPI.Data;
using FamilyTreeAPI.Models;
using System.Security.Claims;

namespace FamilyTreeAPI.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class MarriagesController : ControllerBase
    {
        private readonly FamilyTreeContext _context;

        public MarriagesController(FamilyTreeContext context)
        {
            _context = context;
        }

        // GET: api/marriages/{id}
        // Retourne un mariage complet avec toutes ses unions
        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetMarriage(int id)
        {
            var connexionId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var connexion = await _context.Connexions.FindAsync(connexionId);

            if (connexion == null)
            {
                return Unauthorized(new { message = "Connexion invalide" });
            }

            var wedding = await _context.Weddings
                .Include(w => w.Man)
                .Include(w => w.Woman)
                .Include(w => w.PatrilinealFamily)
                .Include(w => w.Unions.OrderBy(u => u.UnionDate))
                .FirstOrDefaultAsync(w => w.WeddingID == id);

            if (wedding == null)
            {
                return NotFound(new { message = "Mariage non trouvé" });
            }

            // Vérifier que l'utilisateur a accès à ce mariage (même famille)
            if (connexion.FamilyID != wedding.PatrilinealFamilyID &&
                connexion.FamilyID != wedding.Man.FamilyID &&
                connexion.FamilyID != wedding.Woman.FamilyID)
            {
                return Forbid();
            }

            var result = new
            {
                weddingID = wedding.WeddingID,
                manID = wedding.ManID,
                manName = $"{wedding.Man.FirstName} {wedding.Man.LastName}",
                womanID = wedding.WomanID,
                womanName = $"{wedding.Woman.FirstName} {wedding.Woman.LastName}",
                patrilinealFamilyID = wedding.PatrilinealFamilyID,
                patrilinealFamilyName = wedding.PatrilinealFamily?.FamilyName,
                status = wedding.Status,
                weddingDate = wedding.WeddingDate,
                divorceDate = wedding.DivorceDate,
                isActive = wedding.IsActive,
                location = wedding.Location,
                notes = wedding.Notes,
                createdAt = wedding.CreatedAt,
                updatedAt = wedding.UpdatedAt,
                unions = wedding.Unions.Select(u => new
                {
                    unionID = u.UnionID,
                    unionType = u.UnionType,
                    unionDate = u.UnionDate,
                    location = u.Location,
                    notes = u.Notes,
                    validated = u.Validated,
                    createdAt = u.CreatedAt
                }).ToList(),
                unionCount = wedding.Unions.Count,
                unionTypes = string.Join(", ", wedding.Unions.Select(u => u.UnionType))
            };

            return Ok(result);
        }

        // GET: api/marriages/{id}/unions
        // Retourne toutes les unions d'un mariage
        [HttpGet("{id}/unions")]
        public async Task<ActionResult<IEnumerable<MarriageUnion>>> GetMarriageUnions(int id)
        {
            var connexionId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var connexion = await _context.Connexions.FindAsync(connexionId);

            if (connexion == null)
            {
                return Unauthorized(new { message = "Connexion invalide" });
            }

            var wedding = await _context.Weddings.FindAsync(id);
            if (wedding == null)
            {
                return NotFound(new { message = "Mariage non trouvé" });
            }

            var unions = await _context.MarriageUnions
                .Where(u => u.WeddingID == id)
                .OrderBy(u => u.UnionDate)
                .ToListAsync();

            return Ok(unions);
        }

        // POST: api/marriages/{id}/unions
        // Ajoute une union à un mariage existant
        [HttpPost("{id}/unions")]
        public async Task<ActionResult<MarriageUnion>> AddUnion(int id, [FromBody] MarriageUnionDto dto)
        {
            var connexionId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var connexion = await _context.Connexions.FindAsync(connexionId);

            if (connexion == null)
            {
                return Unauthorized(new { message = "Connexion invalide" });
            }

            var wedding = await _context.Weddings.FindAsync(id);
            if (wedding == null)
            {
                return NotFound(new { message = "Mariage non trouvé" });
            }

            // Vérifier que le type d'union est valide
            var validTypes = new[] { "coutumière", "civile", "religieuse", "traditionnelle", "autre" };
            if (!validTypes.Contains(dto.UnionType.ToLower()))
            {
                return BadRequest(new { message = "Type d'union invalide. Types autorisés : coutumière, civile, religieuse, traditionnelle, autre" });
            }

            // Vérifier qu'une union de ce type n'existe pas déjà
            var existingUnion = await _context.MarriageUnions
                .FirstOrDefaultAsync(u => u.WeddingID == id && u.UnionType.ToLower() == dto.UnionType.ToLower());

            if (existingUnion != null)
            {
                return Conflict(new { message = $"Une union de type '{dto.UnionType}' existe déjà pour ce mariage" });
            }

            var union = new MarriageUnion
            {
                WeddingID = id,
                UnionType = dto.UnionType.ToLower(),
                UnionDate = dto.UnionDate,
                Location = dto.Location,
                Notes = dto.Notes,
                Validated = dto.Validated,
                CreatedAt = DateTime.UtcNow
            };

            _context.MarriageUnions.Add(union);

            // Mettre à jour la date du mariage si cette union est plus ancienne
            if (dto.UnionDate < wedding.WeddingDate)
            {
                wedding.WeddingDate = dto.UnionDate;
            }

            wedding.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetMarriage), new { id = wedding.WeddingID }, union);
        }

        // PUT: api/marriages/{weddingId}/unions/{unionId}
        // Modifie une union existante
        [HttpPut("{weddingId}/unions/{unionId}")]
        public async Task<IActionResult> UpdateUnion(int weddingId, int unionId, [FromBody] MarriageUnionDto dto)
        {
            var connexionId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var connexion = await _context.Connexions.FindAsync(connexionId);

            if (connexion == null)
            {
                return Unauthorized(new { message = "Connexion invalide" });
            }

            var union = await _context.MarriageUnions.FindAsync(unionId);
            if (union == null || union.WeddingID != weddingId)
            {
                return NotFound(new { message = "Union non trouvée" });
            }

            union.UnionType = dto.UnionType.ToLower();
            union.UnionDate = dto.UnionDate;
            union.Location = dto.Location;
            union.Notes = dto.Notes;
            union.Validated = dto.Validated;

            var wedding = await _context.Weddings.FindAsync(weddingId);
            if (wedding != null)
            {
                wedding.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/marriages/{weddingId}/unions/{unionId}
        // Supprime une union
        [HttpDelete("{weddingId}/unions/{unionId}")]
        public async Task<IActionResult> DeleteUnion(int weddingId, int unionId)
        {
            var connexionId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var connexion = await _context.Connexions.FindAsync(connexionId);

            if (connexion == null)
            {
                return Unauthorized(new { message = "Connexion invalide" });
            }

            var union = await _context.MarriageUnions.FindAsync(unionId);
            if (union == null || union.WeddingID != weddingId)
            {
                return NotFound(new { message = "Union non trouvée" });
            }

            _context.MarriageUnions.Remove(union);

            var wedding = await _context.Weddings.FindAsync(weddingId);
            if (wedding != null)
            {
                wedding.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: api/marriages/family/{familyId}
        // Retourne tous les mariages d'une famille
        [HttpGet("family/{familyId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetFamilyMarriages(int familyId)
        {
            var connexionId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var connexion = await _context.Connexions.FindAsync(connexionId);

            if (connexion == null || connexion.FamilyID != familyId)
            {
                return Forbid();
            }

            var marriages = await _context.Weddings
                .Include(w => w.Man)
                .Include(w => w.Woman)
                .Include(w => w.PatrilinealFamily)
                .Include(w => w.Unions)
                .Where(w => w.PatrilinealFamilyID == familyId || w.Man.FamilyID == familyId || w.Woman.FamilyID == familyId)
                .OrderByDescending(w => w.WeddingDate)
                .Select(w => new
                {
                    weddingID = w.WeddingID,
                    manName = $"{w.Man.FirstName} {w.Man.LastName}",
                    womanName = $"{w.Woman.FirstName} {w.Woman.LastName}",
                    patrilinealFamilyName = w.PatrilinealFamily!.FamilyName,
                    status = w.Status,
                    weddingDate = w.WeddingDate,
                    unionCount = w.Unions.Count,
                    unionTypes = string.Join(", ", w.Unions.Select(u => u.UnionType))
                })
                .ToListAsync();

            return Ok(marriages);
        }
    }

    // DTO pour créer/modifier une union
    public class MarriageUnionDto
    {
        public string UnionType { get; set; } = string.Empty; // coutumière, civile, religieuse, traditionnelle, autre
        public DateTime UnionDate { get; set; }
        public string? Location { get; set; }
        public string? Notes { get; set; }
        public bool Validated { get; set; } = false;
    }
}
