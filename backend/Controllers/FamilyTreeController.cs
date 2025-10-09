using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FamilyTreeAPI.Data;
using FamilyTreeAPI.Models;

namespace FamilyTreeAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class FamilyTreeController : ControllerBase
    {
        private readonly FamilyTreeContext _context;

        public FamilyTreeController(FamilyTreeContext context)
        {
            _context = context;
        }

        // Get the entire family tree
        [HttpGet("full/{familyId}")]
        public async Task<ActionResult> GetFullFamilyTree(int familyId)
        {
            // 🔒 SÉCURITÉ : Vérifier que l'utilisateur appartient à cette famille
            var userFamilyId = int.Parse(User.FindFirst("familyId")?.Value ?? "0");
            
            if (userFamilyId != familyId)
            {
                return Forbid(); // 403 Forbidden - Accès refusé
            }

            // Projection directe pour éviter les cycles de référence
            var persons = await _context.Persons
                .Where(p => p.FamilyID == familyId)
                .Select(p => new
                {
                    p.PersonID,
                    p.FirstName,
                    p.LastName,
                    p.Sex,
                    p.Birthday,
                    p.DeathDate,
                    p.Alive,
                    p.FatherID,
                    p.MotherID,
                    p.PhotoUrl,
                    p.Activity,
                    CityName = p.City != null ? p.City.Name : null,
                    FatherName = p.Father != null ? p.Father.FirstName + " " + p.Father.LastName : null,
                    MotherName = p.Mother != null ? p.Mother.FirstName + " " + p.Mother.LastName : null
                })
                .ToListAsync();

            var weddings = await _context.Weddings
                .Where(w => w.Man.FamilyID == familyId || w.Woman.FamilyID == familyId)
                .Select(w => new
                {
                    w.WeddingID,
                    HusbandID = w.ManID,
                    WifeID = w.WomanID,
                    w.WeddingDate,
                    w.DivorceDate,
                    StillMarried = w.IsActive,
                    HusbandName = w.Man.FirstName + " " + w.Man.LastName,
                    WifeName = w.Woman.FirstName + " " + w.Woman.LastName
                })
                .ToListAsync();

            return Ok(new
            {
                Persons = persons,
                Weddings = weddings
            });
        }

        // Get user's personal branch (themselves, parents, grandparents, children, grandchildren, spouses)
        [HttpGet("my-branch/{personId}")]
        public async Task<ActionResult> GetMyBranch(int personId)
        {
            // 🔒 SÉCURITÉ : Vérifier que l'utilisateur consulte sa propre branche
            var userPersonId = int.Parse(User.FindFirst("personId")?.Value ?? "0");
            var userFamilyId = int.Parse(User.FindFirst("familyId")?.Value ?? "0");
            
            var person = await _context.Persons
                .FirstOrDefaultAsync(p => p.PersonID == personId);

            if (person == null)
            {
                return NotFound("Personne non trouvée");
            }
            
            // Vérifier que la personne consultée appartient à la même famille
            if (person.FamilyID != userFamilyId)
            {
                return Forbid(); // 403 Forbidden
            }

            var branchPersonIds = new HashSet<int> { personId };

            // Add parents
            if (person.FatherID.HasValue)
            {
                branchPersonIds.Add(person.FatherID.Value);
                
                // Add grandparents (father's side)
                var father = await _context.Persons
                    .FirstOrDefaultAsync(p => p.PersonID == person.FatherID.Value);
                if (father != null)
                {
                    if (father.FatherID.HasValue) branchPersonIds.Add(father.FatherID.Value);
                    if (father.MotherID.HasValue) branchPersonIds.Add(father.MotherID.Value);
                }
            }

            if (person.MotherID.HasValue)
            {
                branchPersonIds.Add(person.MotherID.Value);
                
                // Add grandparents (mother's side)
                var mother = await _context.Persons
                    .FirstOrDefaultAsync(p => p.PersonID == person.MotherID.Value);
                if (mother != null)
                {
                    if (mother.FatherID.HasValue) branchPersonIds.Add(mother.FatherID.Value);
                    if (mother.MotherID.HasValue) branchPersonIds.Add(mother.MotherID.Value);
                }
            }

            // Add children
            var children = await _context.Persons
                .Where(p => p.FatherID == personId || p.MotherID == personId)
                .ToListAsync();
            
            foreach (var child in children)
            {
                branchPersonIds.Add(child.PersonID);
                
                // Add grandchildren
                var grandchildren = await _context.Persons
                    .Where(p => p.FatherID == child.PersonID || p.MotherID == child.PersonID)
                    .ToListAsync();
                
                foreach (var grandchild in grandchildren)
                {
                    branchPersonIds.Add(grandchild.PersonID);
                }
            }

            // Add spouses
            var marriages = await _context.Weddings
                .Where(w => w.ManID == personId || w.WomanID == personId)
                .ToListAsync();
            
            foreach (var marriage in marriages)
            {
                if (marriage.ManID != personId) branchPersonIds.Add(marriage.ManID);
                if (marriage.WomanID != personId) branchPersonIds.Add(marriage.WomanID);
            }

            // Fetch all persons in branch avec projection directe
            var branchPersons = await _context.Persons
                .Where(p => branchPersonIds.Contains(p.PersonID))
                .Select(p => new
                {
                    p.PersonID,
                    p.FirstName,
                    p.LastName,
                    p.Sex,
                    p.Birthday,
                    p.DeathDate,
                    p.Alive,
                    p.FatherID,
                    p.MotherID,
                    p.PhotoUrl,
                    p.Activity,
                    CityName = p.City != null ? p.City.Name : null,
                    FatherName = p.Father != null ? p.Father.FirstName + " " + p.Father.LastName : null,
                    MotherName = p.Mother != null ? p.Mother.FirstName + " " + p.Mother.LastName : null
                })
                .ToListAsync();

            // Fetch relevant weddings avec projection directe
            var branchWeddings = await _context.Weddings
                .Where(w => branchPersonIds.Contains(w.ManID) && branchPersonIds.Contains(w.WomanID))
                .Select(w => new
                {
                    w.WeddingID,
                    HusbandID = w.ManID,
                    WifeID = w.WomanID,
                    w.WeddingDate,
                    w.DivorceDate,
                    StillMarried = w.IsActive,
                    HusbandName = w.Man.FirstName + " " + w.Man.LastName,
                    WifeName = w.Woman.FirstName + " " + w.Woman.LastName
                })
                .ToListAsync();

            return Ok(new
            {
                Persons = branchPersons,
                Weddings = branchWeddings
            });
        }

        // Search in family tree
        [HttpGet("search/{familyId}")]
        public async Task<ActionResult> SearchFamilyTree(int familyId, [FromQuery] string query)
        {
            // 🔒 SÉCURITÉ : Vérifier que l'utilisateur appartient à cette famille
            var userFamilyId = int.Parse(User.FindFirst("familyId")?.Value ?? "0");
            
            if (userFamilyId != familyId)
            {
                return Forbid(); // 403 Forbidden
            }
            
            if (string.IsNullOrWhiteSpace(query))
            {
                return BadRequest("Terme de recherche requis");
            }

            var persons = await _context.Persons
                .Where(p => p.FamilyID == familyId &&
                    (p.FirstName.ToLower().Contains(query.ToLower()) ||
                     p.LastName.ToLower().Contains(query.ToLower()) ||
                     (p.City != null && p.City.Name.ToLower().Contains(query.ToLower())) ||
                     (p.Activity != null && p.Activity.ToLower().Contains(query.ToLower()))))
                .Select(p => new
                {
                    p.PersonID,
                    p.FirstName,
                    p.LastName,
                    p.Sex,
                    p.Birthday,
                    p.DeathDate,
                    p.Alive,
                    p.PhotoUrl,
                    p.Activity,
                    CityName = p.City != null ? p.City.Name : null,
                    FatherName = p.Father != null ? p.Father.FirstName + " " + p.Father.LastName : null,
                    MotherName = p.Mother != null ? p.Mother.FirstName + " " + p.Mother.LastName : null
                })
                .ToListAsync();

            return Ok(persons);
        }

        // Get all roots (persons with no parents) to start the tree
        [HttpGet("roots/{familyId}")]
        public async Task<ActionResult> GetRootPersons(int familyId)
        {
            // 🔒 SÉCURITÉ : Vérifier que l'utilisateur appartient à cette famille
            var userFamilyId = int.Parse(User.FindFirst("familyId")?.Value ?? "0");
            
            if (userFamilyId != familyId)
            {
                return Forbid(); // 403 Forbidden
            }
            
            var roots = await _context.Persons
                .Where(p => p.FamilyID == familyId && p.FatherID == null && p.MotherID == null)
                .Select(p => new
                {
                    p.PersonID,
                    p.FirstName,
                    p.LastName,
                    p.Sex,
                    p.Birthday,
                    p.DeathDate,
                    p.Alive,
                    p.PhotoUrl,
                    p.Activity,
                    CityName = p.City != null ? p.City.Name : null
                })
                .ToListAsync();

            return Ok(roots);
        }

        // Get all descendants of a person
        [HttpGet("descendants/{personId}")]
        public async Task<ActionResult> GetDescendants(int personId)
        {
            // 🔒 SÉCURITÉ : Vérifier que la personne appartient à la famille de l'utilisateur
            var userFamilyId = int.Parse(User.FindFirst("familyId")?.Value ?? "0");
            
            var person = await _context.Persons.FindAsync(personId);
            if (person == null)
            {
                return NotFound("Personne non trouvée");
            }
            
            if (person.FamilyID != userFamilyId)
            {
                return Forbid(); // 403 Forbidden
            }
            
            var descendants = new List<Person>();
            await GetDescendantsRecursive(personId, descendants);

            var descendantIds = descendants.Select(d => d.PersonID).ToHashSet();
            descendantIds.Add(personId);

            var persons = await _context.Persons
                .Where(p => descendantIds.Contains(p.PersonID))
                .Select(p => new
                {
                    p.PersonID,
                    p.FirstName,
                    p.LastName,
                    p.Sex,
                    p.Birthday,
                    p.DeathDate,
                    p.Alive,
                    p.FatherID,
                    p.MotherID,
                    p.PhotoUrl,
                    p.Activity,
                    CityName = p.City != null ? p.City.Name : null,
                    // Generation = CalculateGeneration(p, persons) // Ne peut pas appeler dans Select
                })
                .ToListAsync();

            return Ok(persons);
        }

        private async Task GetDescendantsRecursive(int personId, List<Person> descendants)
        {
            var children = await _context.Persons
                .Where(p => p.FatherID == personId || p.MotherID == personId)
                .ToListAsync();

            foreach (var child in children)
            {
                if (!descendants.Any(d => d.PersonID == child.PersonID))
                {
                    descendants.Add(child);
                    await GetDescendantsRecursive(child.PersonID, descendants);
                }
            }
        }

        private int CalculateGeneration(Person person, List<Person> allPersons)
        {
            int generation = 0;
            var current = person;

            while (current.FatherID.HasValue || current.MotherID.HasValue)
            {
                generation++;
                var parentId = current.FatherID ?? current.MotherID;
                current = allPersons.FirstOrDefault(p => p.PersonID == parentId);
                if (current == null) break;
            }

            return generation;
        }
    }
}
