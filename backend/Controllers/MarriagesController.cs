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

        // POST: api/marriages
        // Crée un nouveau mariage - ROUTE CRITICAL POUR POLYGAMIE
        [HttpPost]
        public async Task<ActionResult<object>> CreateWedding([FromBody] CreateWeddingDto dto)
        {
            var connexionId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var connexion = await _context.Connexions.FindAsync(connexionId);

            if (connexion == null)
            {
                return Unauthorized(new { message = "Connexion invalide" });
            }

            // Vérifier que les personnes existent et sont de la bonne famille
            var man = await _context.Persons.FindAsync(dto.ManID);
            var woman = await _context.Persons.FindAsync(dto.WomanID);

            if (man == null || woman == null)
            {
                return BadRequest(new { message = "Une ou plusieurs personnes n'existent pas" });
            }

            // Vérifier l'accès familial
            if (man.FamilyID != connexion.FamilyID && woman.FamilyID != connexion.FamilyID)
            {
                return Forbid("Accès refusé - familles différentes");
            }

            // Vérifier que ce ne sont pas le même personne
            if (dto.ManID == dto.WomanID)
            {
                return BadRequest(new { message = "Une personne ne peut pas se marier avec elle-même" });
            }

            // CRITICAL: Autoriser explicitement la polygamie
            // Pas de vérification d'unions existantes - c'est autorisé !
            
            try
            {
                // Créer le Wedding
                var wedding = new Wedding
                {
                    ManID = dto.ManID,
                    WomanID = dto.WomanID,
                    WeddingDate = DateTime.SpecifyKind(dto.WeddingDate, DateTimeKind.Utc),
                    PatrilinealFamilyID = dto.PatrilinealFamilyID ?? connexion.FamilyID ?? 10,
                    Status = "active",
                    IsActive = true,
                    Location = dto.Location,
                    Notes = dto.Notes,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    DivorceDate = null  // Explicitement null pour éviter les problèmes de DateTime
                };

                _context.Weddings.Add(wedding);
                await _context.SaveChangesAsync();

                // Retourner le wedding avec son ID pour permettre l'ajout d'unions
                var result = new
                {
                    weddingID = wedding.WeddingID,
                    manID = wedding.ManID,
                    womanID = wedding.WomanID,
                    weddingDate = wedding.WeddingDate,
                    status = wedding.Status,
                    message = "Union créée avec succès - Polygamie autorisée"
                };

                return CreatedAtAction(nameof(GetMarriage), new { id = wedding.WeddingID }, result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { 
                    message = "Erreur lors de la création de l'union", 
                    error = ex.Message,
                    details = "Contactez l'équipe de développement"
                });
            }
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

            // D'abord récupérer les mariages
            var marriages = await _context.Weddings
                .Include(w => w.Man)
                .Include(w => w.Woman)
                .Include(w => w.PatrilinealFamily)
                .Include(w => w.Unions)
                .Where(w => w.PatrilinealFamilyID == familyId || w.Man.FamilyID == familyId || w.Woman.FamilyID == familyId)
                .OrderByDescending(w => w.WeddingDate)
                .ToListAsync();

            // Ensuite calculer les enfants pour chaque mariage
            var result = new List<object>();
            foreach (var w in marriages)
            {
                var childrenCount = await _context.Persons
                    .CountAsync(p => p.FatherID == w.ManID && p.MotherID == w.WomanID);

                var isPolygamous = await _context.Weddings
                    .AnyAsync(other => 
                        other.WeddingID != w.WeddingID && 
                        other.IsActive && 
                        (other.ManID == w.ManID || other.WomanID == w.WomanID));

                result.Add(new
                {
                    weddingID = w.WeddingID,
                    manID = w.ManID,
                    womanID = w.WomanID,
                    manName = $"{w.Man.FirstName} {w.Man.LastName}",
                    womanName = $"{w.Woman.FirstName} {w.Woman.LastName}",
                    manPhoto = w.Man.PhotoUrl,
                    womanPhoto = w.Woman.PhotoUrl,
                    patrilinealFamilyName = w.PatrilinealFamily!.FamilyName,
                    status = w.Status,
                    weddingDate = w.WeddingDate,
                    unionCount = w.Unions.Count,
                    unionTypes = string.Join(", ", w.Unions.Select(u => u.UnionType)),
                    children = childrenCount,
                    isPolygamous = isPolygamous,
                    location = w.Location,
                    notes = w.Notes
                });
            }

            return Ok(result);
        }

        // GET: api/marriages/person/{personId}/active
        // Retourne les unions actives d'une personne (pour détection polygamie)
        [HttpGet("person/{personId}/active")]
        public async Task<ActionResult<IEnumerable<object>>> GetPersonActiveUnions(int personId)
        {
            var connexionId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var connexion = await _context.Connexions.FindAsync(connexionId);

            if (connexion == null)
            {
                return Unauthorized(new { message = "Connexion invalide" });
            }

            // Trouver toutes les unions actives de cette personne
            var activeWeddings = await _context.Weddings
                .Include(w => w.Man)
                .Include(w => w.Woman)
                .Include(w => w.Unions)
                .Where(w => (w.ManID == personId || w.WomanID == personId) && w.IsActive)
                .Select(w => new
                {
                    weddingID = w.WeddingID,
                    partnerName = w.ManID == personId ? $"{w.Woman.FirstName} {w.Woman.LastName}" : $"{w.Man.FirstName} {w.Man.LastName}",
                    weddingDate = w.WeddingDate,
                    unionTypes = string.Join(", ", w.Unions.Select(u => u.UnionType)),
                    unionCount = w.Unions.Count,
                    status = w.Status
                })
                .ToListAsync();

            return Ok(activeWeddings);
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

    // DTO pour créer un nouveau mariage - CRITICAL POUR POLYGAMIE
    public class CreateWeddingDto
    {
        public int ManID { get; set; }
        public int WomanID { get; set; }
        public DateTime WeddingDate { get; set; }
        public int? PatrilinealFamilyID { get; set; }
        public string? Location { get; set; }
        public string? Notes { get; set; }
        public bool IsFormalMarriage { get; set; } = true;
    }
}
