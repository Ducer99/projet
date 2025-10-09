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
    public class FamilyRelationsController : ControllerBase
    {
        private readonly FamilyTreeContext _context;

        public FamilyRelationsController(FamilyTreeContext context)
        {
            _context = context;
        }

        // GET: api/familyrelations/person/{personId}
        // Retourne toutes les relations d'une personne
        [HttpGet("person/{personId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetPersonRelations(int personId)
        {
            var connexionId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var connexion = await _context.Connexions.FindAsync(connexionId);

            if (connexion == null)
            {
                return Unauthorized(new { message = "Connexion invalide" });
            }

            var person = await _context.Persons.FindAsync(personId);
            if (person == null)
            {
                return NotFound(new { message = "Personne non trouvée" });
            }

            var relations = await _context.FamilyRelations
                .Include(fr => fr.Family)
                .Include(fr => fr.Person)
                .Where(fr => fr.PersonID == personId)
                .OrderBy(fr => fr.StartDate)
                .Select(fr => new
                {
                    relationID = fr.RelationID,
                    personID = fr.PersonID,
                    personName = $"{fr.Person!.FirstName} {fr.Person.LastName}",
                    familyID = fr.FamilyID,
                    familyName = fr.Family!.FamilyName,
                    relationType = fr.RelationType,
                    startDate = fr.StartDate,
                    endDate = fr.EndDate,
                    notes = fr.Notes,
                    isActive = fr.EndDate == null || fr.EndDate > DateTime.UtcNow
                })
                .ToListAsync();

            return Ok(relations);
        }

        // GET: api/familyrelations/family/{familyId}
        // Retourne toutes les relations d'une famille
        [HttpGet("family/{familyId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetFamilyRelations(int familyId)
        {
            var connexionId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var connexion = await _context.Connexions.FindAsync(connexionId);

            if (connexion == null || connexion.FamilyID != familyId)
            {
                return Forbid();
            }

            var relations = await _context.FamilyRelations
                .Include(fr => fr.Family)
                .Include(fr => fr.Person)
                .Where(fr => fr.FamilyID == familyId)
                .OrderByDescending(fr => fr.StartDate)
                .Select(fr => new
                {
                    relationID = fr.RelationID,
                    personID = fr.PersonID,
                    personName = $"{fr.Person!.FirstName} {fr.Person.LastName}",
                    familyID = fr.FamilyID,
                    familyName = fr.Family!.FamilyName,
                    relationType = fr.RelationType,
                    startDate = fr.StartDate,
                    endDate = fr.EndDate,
                    notes = fr.Notes,
                    isActive = fr.EndDate == null || fr.EndDate > DateTime.UtcNow
                })
                .ToListAsync();

            return Ok(relations);
        }

        // GET: api/familyrelations/family/{familyId}/gendres
        // Retourne tous les gendres d'une famille
        [HttpGet("family/{familyId}/gendres")]
        public async Task<ActionResult<IEnumerable<object>>> GetGendres(int familyId)
        {
            var connexionId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var connexion = await _context.Connexions.FindAsync(connexionId);

            if (connexion == null || connexion.FamilyID != familyId)
            {
                return Forbid();
            }

            var gendres = await _context.FamilyRelations
                .Include(fr => fr.Person)
                .Where(fr => fr.FamilyID == familyId && fr.RelationType == "gendre")
                .OrderByDescending(fr => fr.StartDate)
                .Select(fr => new
                {
                    relationID = fr.RelationID,
                    personID = fr.PersonID,
                    personName = $"{fr.Person!.FirstName} {fr.Person.LastName}",
                    startDate = fr.StartDate,
                    endDate = fr.EndDate,
                    isActive = fr.EndDate == null || fr.EndDate > DateTime.UtcNow,
                    notes = fr.Notes
                })
                .ToListAsync();

            return Ok(gendres);
        }

        // GET: api/familyrelations/family/{familyId}/brus
        // Retourne toutes les brus d'une famille
        [HttpGet("family/{familyId}/brus")]
        public async Task<ActionResult<IEnumerable<object>>> GetBrus(int familyId)
        {
            var connexionId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var connexion = await _context.Connexions.FindAsync(connexionId);

            if (connexion == null || connexion.FamilyID != familyId)
            {
                return Forbid();
            }

            var brus = await _context.FamilyRelations
                .Include(fr => fr.Person)
                .Where(fr => fr.FamilyID == familyId && fr.RelationType == "bru")
                .OrderByDescending(fr => fr.StartDate)
                .Select(fr => new
                {
                    relationID = fr.RelationID,
                    personID = fr.PersonID,
                    personName = $"{fr.Person!.FirstName} {fr.Person.LastName}",
                    startDate = fr.StartDate,
                    endDate = fr.EndDate,
                    isActive = fr.EndDate == null || fr.EndDate > DateTime.UtcNow,
                    notes = fr.Notes
                })
                .ToListAsync();

            return Ok(brus);
        }

        // POST: api/familyrelations
        // Crée une nouvelle relation familiale
        [HttpPost]
        public async Task<ActionResult<FamilyRelation>> CreateRelation([FromBody] FamilyRelationDto dto)
        {
            var connexionId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var connexion = await _context.Connexions.FindAsync(connexionId);

            if (connexion == null)
            {
                return Unauthorized(new { message = "Connexion invalide" });
            }

            var person = await _context.Persons.FindAsync(dto.PersonID);
            if (person == null)
            {
                return NotFound(new { message = "Personne non trouvée" });
            }

            var family = await _context.Families.FindAsync(dto.FamilyID);
            if (family == null)
            {
                return NotFound(new { message = "Famille non trouvée" });
            }

            // Valider le type de relation
            var validTypes = new[] { "member", "gendre", "bru", "beau-père", "belle-mère", "beau-frère", "belle-sœur" };
            if (!validTypes.Contains(dto.RelationType.ToLower()))
            {
                return BadRequest(new { message = "Type de relation invalide" });
            }

            // Vérifier qu'une relation similaire n'existe pas déjà
            var existingRelation = await _context.FamilyRelations
                .FirstOrDefaultAsync(fr =>
                    fr.PersonID == dto.PersonID &&
                    fr.FamilyID == dto.FamilyID &&
                    fr.RelationType == dto.RelationType.ToLower() &&
                    (fr.EndDate == null || fr.EndDate > DateTime.UtcNow));

            if (existingRelation != null)
            {
                return Conflict(new { message = "Cette relation existe déjà" });
            }

            var relation = new FamilyRelation
            {
                PersonID = dto.PersonID,
                FamilyID = dto.FamilyID,
                RelationType = dto.RelationType.ToLower(),
                StartDate = dto.StartDate ?? DateTime.UtcNow,
                EndDate = dto.EndDate,
                Notes = dto.Notes,
                CreatedAt = DateTime.UtcNow
            };

            _context.FamilyRelations.Add(relation);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetPersonRelations), new { personId = dto.PersonID }, relation);
        }

        // PUT: api/familyrelations/{id}
        // Modifie une relation existante
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateRelation(int id, [FromBody] FamilyRelationDto dto)
        {
            var connexionId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var connexion = await _context.Connexions.FindAsync(connexionId);

            if (connexion == null)
            {
                return Unauthorized(new { message = "Connexion invalide" });
            }

            var relation = await _context.FamilyRelations.FindAsync(id);
            if (relation == null)
            {
                return NotFound(new { message = "Relation non trouvée" });
            }

            relation.RelationType = dto.RelationType.ToLower();
            relation.StartDate = dto.StartDate;
            relation.EndDate = dto.EndDate;
            relation.Notes = dto.Notes;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/familyrelations/{id}
        // Supprime une relation (ou la termine en définissant EndDate)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRelation(int id, [FromQuery] bool softDelete = true)
        {
            var connexionId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var connexion = await _context.Connexions.FindAsync(connexionId);

            if (connexion == null)
            {
                return Unauthorized(new { message = "Connexion invalide" });
            }

            var relation = await _context.FamilyRelations.FindAsync(id);
            if (relation == null)
            {
                return NotFound(new { message = "Relation non trouvée" });
            }

            if (softDelete)
            {
                // Soft delete : définir la date de fin
                relation.EndDate = DateTime.UtcNow;
            }
            else
            {
                // Hard delete : supprimer complètement
                _context.FamilyRelations.Remove(relation);
            }

            await _context.SaveChangesAsync();

            return NoContent();
        }
    }

    // DTO pour créer/modifier une relation familiale
    public class FamilyRelationDto
    {
        public int PersonID { get; set; }
        public int FamilyID { get; set; }
        public string RelationType { get; set; } = string.Empty; // member, gendre, bru, beau-père, belle-mère, etc.
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? Notes { get; set; }
    }
}
