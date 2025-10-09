using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using FamilyTreeAPI.Data;
using FamilyTreeAPI.Models;

namespace FamilyTreeAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PersonsController : ControllerBase
    {
        private readonly FamilyTreeContext _context;

        public PersonsController(FamilyTreeContext context)
        {
            _context = context;
        }

        // GET: api/Persons - Retourne uniquement les membres de la famille de l'utilisateur
        [HttpGet]
        [Authorize]
        public async Task<ActionResult> GetPersons()
        {
            // 🔒 SÉCURITÉ : Récupérer l'ID de famille de l'utilisateur connecté
            var userFamilyId = int.Parse(User.FindFirst("familyId")?.Value ?? "0");
            
            if (userFamilyId == 0)
            {
                return Unauthorized(new { message = "Famille non identifiée" });
            }

            // Projection directe avec filtre par famille
            var personsDto = await _context.Persons
                .Where(p => p.FamilyID == userFamilyId)
                .Select(p => new
                {
                    p.PersonID,
                    p.FirstName,
                    p.LastName,
                    p.Sex,
                    p.Birthday,
                    p.DeathDate,
                    p.Alive,
                    p.Activity,
                    p.PhotoUrl,
                    p.Notes,
                    p.Email,
                    p.FatherID,
                    p.MotherID,
                    p.FamilyID,
                    p.CityID,
                    CityName = p.City != null ? p.City.Name : null,
                    FamilyName = p.Family != null ? p.Family.FamilyName : null,
                    FatherName = p.Father != null ? p.Father.FirstName + " " + p.Father.LastName : null,
                    MotherName = p.Mother != null ? p.Mother.FirstName + " " + p.Mother.LastName : null
                })
                .ToListAsync();

            return Ok(personsDto);
        }

        // GET: api/Persons/me - Récupérer son propre profil
        [HttpGet("me")]
        [Authorize]
        public async Task<ActionResult> GetMyProfile()
        {
            // 🔒 Récupérer l'ID de la personne depuis le token
            var personIdClaim = User.FindFirst("personId")?.Value;
            
            // Vérifier si le claim existe et n'est pas vide
            if (string.IsNullOrEmpty(personIdClaim) || !int.TryParse(personIdClaim, out int personId) || personId == 0)
            {
                return BadRequest(new { message = "Profil non complété. Veuillez compléter votre profil d'abord." });
            }

            var personDto = await _context.Persons
                .Where(p => p.PersonID == personId)
                .Select(p => new
                {
                    p.PersonID,
                    p.FirstName,
                    p.LastName,
                    p.Sex,
                    p.Birthday,
                    p.DeathDate,
                    p.Alive,
                    p.Activity,
                    p.PhotoUrl,
                    p.Notes,
                    p.Email,
                    p.FatherID,
                    p.MotherID,
                    p.FamilyID,
                    p.CityID,
                    CityName = p.City != null ? p.City.Name : null,
                    CountryName = p.City != null ? p.City.CountryName : null,
                    FamilyName = p.Family != null ? p.Family.FamilyName : null,
                    FatherName = p.Father != null ? p.Father.FirstName + " " + p.Father.LastName : null,
                    MotherName = p.Mother != null ? p.Mother.FirstName + " " + p.Mother.LastName : null
                })
                .FirstOrDefaultAsync();

            if (personDto == null)
            {
                return NotFound(new { message = "Profil non trouvé" });
            }

            return Ok(personDto);
        }

        // GET: api/Persons/5
        [HttpGet("{id}")]
        [Authorize]
        public async Task<ActionResult> GetPerson(int id)
        {
            // Projection directe pour éviter les références circulaires
            var personDto = await _context.Persons
                .Where(p => p.PersonID == id)
                .Select(p => new
                {
                    p.PersonID,
                    p.FirstName,
                    p.LastName,
                    p.Sex,
                    p.Birthday,
                    p.DeathDate,
                    p.Alive,
                    p.Activity,
                    p.PhotoUrl,
                    p.Notes,
                    p.Email,
                    p.FatherID,
                    p.MotherID,
                    p.FamilyID,
                    p.CityID,
                    CityName = p.City != null ? p.City.Name : null,
                    FamilyName = p.Family != null ? p.Family.FamilyName : null,
                    FatherName = p.Father != null ? p.Father.FirstName + " " + p.Father.LastName : null,
                    MotherName = p.Mother != null ? p.Mother.FirstName + " " + p.Mother.LastName : null
                })
                .FirstOrDefaultAsync();

            if (personDto == null)
            {
                return NotFound();
            }

            return Ok(personDto);
        }

        // GET: api/Persons/family/1 - Tous les membres d'une famille
        [HttpGet("family/{familyId}")]
        [Authorize]
        public async Task<ActionResult> GetPersonsByFamily(int familyId)
        {
            // 🔒 Vérifier que l'utilisateur demande sa propre famille
            var userFamilyId = int.Parse(User.FindFirst("familyId")?.Value ?? "0");
            
            if (userFamilyId != familyId)
            {
                return Forbid(); // 403 Forbidden
            }

            var personsDto = await _context.Persons
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
                    p.Activity,
                    p.PhotoUrl,
                    p.Notes,
                    p.Email,
                    p.FatherID,
                    p.MotherID,
                    p.FamilyID,
                    p.CityID,
                    CityName = p.City != null ? p.City.Name : null,
                    FamilyName = p.Family != null ? p.Family.FamilyName : null,
                    FatherName = p.Father != null ? p.Father.FirstName + " " + p.Father.LastName : null,
                    MotherName = p.Mother != null ? p.Mother.FirstName + " " + p.Mother.LastName : null
                })
                .ToListAsync();

            return Ok(personsDto);
        }

        // POST: api/Persons - Ajouter un membre
        [HttpPost]
        [Authorize]
        public async Task<ActionResult<Person>> PostPerson(Person person)
        {
            // 🔒 Récupérer l'ID de famille et connexion de l'utilisateur
            var userFamilyId = int.Parse(User.FindFirst("familyId")?.Value ?? "0");
            var userConnexionId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            
            if (userFamilyId == 0 || userConnexionId == 0)
            {
                return Unauthorized(new { message = "Utilisateur non identifié" });
            }

            // 🔒 Forcer le FamilyID pour éviter qu'un utilisateur ajoute des membres à une autre famille
            person.FamilyID = userFamilyId;
            
            // 📝 Enregistrer qui a créé ce membre
            person.CreatedBy = userConnexionId;

            _context.Persons.Add(person);
            await _context.SaveChangesAsync();

            // 🎂 Créer automatiquement un événement anniversaire si la personne a une date de naissance
            if (person.Birthday.HasValue)
            {
                await CreateBirthdayEventAsync(person, userFamilyId);
            }

            return CreatedAtAction("GetPerson", new { id = person.PersonID }, person);
        }

        // PUT: api/Persons/5 - Modifier un membre
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> PutPerson(int id, Person person)
        {
            if (id != person.PersonID)
            {
                return BadRequest();
            }

            // 🔒 Récupérer les infos de l'utilisateur
            var userFamilyId = int.Parse(User.FindFirst("familyId")?.Value ?? "0");
            var userConnexionId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var userRole = User.FindFirst("role")?.Value ?? "Member";
            var userPersonId = int.Parse(User.FindFirst("personId")?.Value ?? "0");
            
            var existingPerson = await _context.Persons.FindAsync(id);
            
            if (existingPerson == null)
            {
                return NotFound();
            }

            // 🔒 Vérifier que la personne appartient à la famille de l'utilisateur
            if (existingPerson.FamilyID != userFamilyId)
            {
                return Forbid(); // 403 - L'utilisateur ne peut pas modifier des personnes d'une autre famille
            }

            // 🔒 Vérifier les permissions : Admin OU Créateur OU Son propre profil
            bool isAdmin = userRole == "Admin";
            bool isCreator = existingPerson.CreatedBy == userConnexionId;
            bool isOwnProfile = existingPerson.PersonID == userPersonId;
            
            if (!isAdmin && !isCreator && !isOwnProfile)
            {
                return StatusCode(403, new { message = "Vous ne pouvez modifier que votre propre profil ou les membres que vous avez créés" });
            }

            // 🔒 Empêcher le changement de FamilyID et CreatedBy
            person.FamilyID = userFamilyId;
            person.CreatedBy = existingPerson.CreatedBy; // Garder le créateur original

            _context.Entry(existingPerson).CurrentValues.SetValues(person);

            try
            {
                await _context.SaveChangesAsync();
                
                // 🎂 Créer ou mettre à jour l'événement anniversaire si la date de naissance a changé
                if (person.Birthday.HasValue)
                {
                    await CreateOrUpdateBirthdayEventAsync(person, userFamilyId);
                }
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!PersonExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // PUT: api/Persons/me - Modifier SON PROPRE profil
        [HttpPut("me")]
        [Authorize]
        public async Task<IActionResult> UpdateMyProfile([FromBody] UpdateProfileDto personUpdate)
        {
            // 🔒 Récupérer l'ID de la personne depuis le token
            var personIdClaim = User.FindFirst("personId")?.Value;
            
            // Vérifier si le claim existe et n'est pas vide
            if (string.IsNullOrEmpty(personIdClaim) || !int.TryParse(personIdClaim, out int personId) || personId == 0)
            {
                return BadRequest(new { message = "Profil non complété. Veuillez compléter votre profil d'abord." });
            }

            var existingPerson = await _context.Persons.FindAsync(personId);
            
            if (existingPerson == null)
            {
                return NotFound(new { message = "Profil non trouvé" });
            }

            // Mise à jour des champs autorisés (empêche la modification de FamilyID, FatherID, MotherID)
            existingPerson.FirstName = personUpdate.FirstName;
            existingPerson.LastName = personUpdate.LastName;
            existingPerson.Sex = personUpdate.Sex;
            existingPerson.Birthday = personUpdate.Birthday;
            existingPerson.Email = personUpdate.Email;
            existingPerson.Activity = personUpdate.Activity;
            existingPerson.PhotoUrl = personUpdate.PhotoUrl;
            existingPerson.Notes = personUpdate.Notes;
            existingPerson.CityID = personUpdate.CityID;
            existingPerson.Alive = personUpdate.Alive;
            existingPerson.DeathDate = personUpdate.DeathDate;

            try
            {
                await _context.SaveChangesAsync();
                
                // Retourner le profil mis à jour
                return Ok(new
                {
                    message = "Profil mis à jour avec succès",
                    person = new
                    {
                        existingPerson.PersonID,
                        existingPerson.FirstName,
                        existingPerson.LastName,
                        existingPerson.Email,
                        existingPerson.Sex,
                        existingPerson.Birthday,
                        existingPerson.Activity,
                        existingPerson.PhotoUrl
                    }
                });
            }
            catch (DbUpdateConcurrencyException)
            {
                return StatusCode(500, new { message = "Erreur lors de la mise à jour" });
            }
        }

        // DELETE: api/Persons/5
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeletePerson(int id)
        {
            var person = await _context.Persons.FindAsync(id);
            if (person == null)
            {
                return NotFound();
            }

            _context.Persons.Remove(person);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool PersonExists(int id)
        {
            return _context.Persons.Any(e => e.PersonID == id);
        }

        // GET: api/Persons/{id}/children - Récupère tous les enfants d'une personne
        [HttpGet("{id}/children")]
        [Authorize]
        public async Task<ActionResult> GetChildren(int id)
        {
            var children = await _context.Persons
                .Where(p => p.FatherID == id || p.MotherID == id)
                .Select(p => new
                {
                    p.PersonID,
                    p.FirstName,
                    p.LastName,
                    p.Sex,
                    p.Birthday,
                    p.DeathDate,
                    p.Alive
                })
                .ToListAsync();

            return Ok(children);
        }

        // GET: api/Persons/{id}/weddings - Récupère tous les mariages d'une personne
        [HttpGet("{id}/weddings")]
        [Authorize]
        public async Task<ActionResult> GetWeddings(int id)
        {
            var person = await _context.Persons.FindAsync(id);
            if (person == null)
            {
                return NotFound(new { message = "Personne introuvable" });
            }

            var weddings = await _context.Weddings
                .Where(w => w.ManID == id || w.WomanID == id)
                .Select(w => new
                {
                    w.WeddingID,
                    SpouseID = w.ManID == id ? w.WomanID : w.ManID,
                    SpouseName = w.ManID == id 
                        ? (w.Woman!.FirstName + " " + w.Woman.LastName) 
                        : (w.Man!.FirstName + " " + w.Man.LastName),
                    w.WeddingDate,
                    w.DivorceDate,
                    StillMarried = w.DivorceDate == null && w.IsActive
                })
                .ToListAsync();

            return Ok(weddings);
        }

        // GET: api/Persons/{id}/can-edit - Vérifier si l'utilisateur peut modifier ce membre
        [HttpGet("{id}/can-edit")]
        [Authorize]
        public async Task<ActionResult> CanEditPerson(int id)
        {
            var userConnexionId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var userRole = User.FindFirst("role")?.Value ?? "Member";
            var userPersonId = int.Parse(User.FindFirst("personId")?.Value ?? "0");
            var userFamilyId = int.Parse(User.FindFirst("familyId")?.Value ?? "0");

            var person = await _context.Persons.FindAsync(id);
            
            if (person == null)
            {
                return NotFound();
            }

            // Vérifier que c'est la même famille
            if (person.FamilyID != userFamilyId)
            {
                return Ok(new { canEdit = false, reason = "Famille différente" });
            }

            // Vérifier les permissions : Admin OU Créateur OU Son propre profil
            bool isAdmin = userRole == "Admin";
            bool isCreator = person.CreatedBy == userConnexionId;
            bool isOwnProfile = person.PersonID == userPersonId;
            
            bool canEdit = isAdmin || isCreator || isOwnProfile;
            
            return Ok(new 
            { 
                canEdit,
                isAdmin,
                isCreator,
                isOwnProfile,
                createdBy = person.CreatedBy,
                personId = person.PersonID
            });
        }

                // 🎂 Méthode helper pour créer un événement anniversaire ou commémoration
        private async Task CreateBirthdayEventAsync(Person person, int familyId)
        {
            // Si la personne est décédée, créer une commémoration
            if (!person.Alive && person.DeathDate.HasValue)
            {
                await CreateMemorialEventAsync(person, familyId);
                return;
            }

            // Si vivant, créer un anniversaire de naissance
            if (!person.Birthday.HasValue) return;

            // Calculer la date du prochain anniversaire (année en cours ou suivante)
            var today = DateTime.UtcNow.Date;
            var birthdayThisYear = new DateTime(today.Year, person.Birthday.Value.Month, person.Birthday.Value.Day);
            var nextBirthday = birthdayThisYear >= today ? birthdayThisYear : birthdayThisYear.AddYears(1);

            var birthdayEvent = new Event
            {
                FamilyID = familyId,
                Title = $"Anniversaire de {person.FirstName} {person.LastName}",
                Description = $"🎂 Joyeux anniversaire {person.FirstName} !",
                EventType = "birthday",
                StartDate = DateTime.SpecifyKind(nextBirthday, DateTimeKind.Utc),
                EndDate = null,
                Location = null,
                Visibility = "family",
                IsRecurring = true,
                CreatedBy = null, // Événement auto-généré
                CreatedAt = DateTime.UtcNow
            };

            _context.Events.Add(birthdayEvent);
            await _context.SaveChangesAsync();
        }

        // 🕊️ Méthode helper pour créer un événement de commémoration (personne décédée)
        private async Task CreateMemorialEventAsync(Person person, int familyId)
        {
            if (!person.DeathDate.HasValue) return;

            // Calculer la prochaine date de commémoration
            var today = DateTime.UtcNow.Date;
            var memorialThisYear = new DateTime(today.Year, person.DeathDate.Value.Month, person.DeathDate.Value.Day);
            var nextMemorial = memorialThisYear >= today ? memorialThisYear : memorialThisYear.AddYears(1);

            var memorialEvent = new Event
            {
                FamilyID = familyId,
                Title = $"En mémoire de {person.FirstName} {person.LastName}",
                Description = $"🕊️ En mémoire de {person.FirstName} {person.LastName}",
                EventType = "death",
                StartDate = DateTime.SpecifyKind(nextMemorial, DateTimeKind.Utc),
                EndDate = null,
                Location = null,
                Visibility = "family",
                IsRecurring = true,
                CreatedBy = null, // Événement auto-généré
                CreatedAt = DateTime.UtcNow
            };

            _context.Events.Add(memorialEvent);
            await _context.SaveChangesAsync();
        }

        // 🎂 Méthode helper pour créer ou mettre à jour un événement anniversaire
        private async Task CreateOrUpdateBirthdayEventAsync(Person person, int familyId)
        {
            if (!person.Birthday.HasValue) return;

            // Chercher l'événement anniversaire (birthday)
            var birthdayEvent = await _context.Events
                .FirstOrDefaultAsync(e => 
                    e.EventType == "birthday" && 
                    e.Title == $"Anniversaire de {person.FirstName} {person.LastName}");

            // Chercher l'événement commémoratif (death)
            var memorialEvent = await _context.Events
                .FirstOrDefaultAsync(e => 
                    e.EventType == "death" && 
                    e.Title == $"En mémoire de {person.FirstName} {person.LastName}");

            // Si la personne est décédée
            if (!person.Alive && person.DeathDate.HasValue)
            {
                // Supprimer l'événement anniversaire s'il existe
                if (birthdayEvent != null)
                {
                    _context.Events.Remove(birthdayEvent);
                }

                // Créer ou mettre à jour l'événement commémoratif
                if (memorialEvent != null)
                {
                    // Mettre à jour la date
                    var today = DateTime.UtcNow.Date;
                    var memorialThisYear = new DateTime(today.Year, person.DeathDate.Value.Month, person.DeathDate.Value.Day);
                    var nextMemorial = memorialThisYear >= today ? memorialThisYear : memorialThisYear.AddYears(1);

                    memorialEvent.StartDate = DateTime.SpecifyKind(nextMemorial, DateTimeKind.Utc);
                    memorialEvent.Description = $"🕊️ En mémoire de {person.FirstName} {person.LastName}";
                }
                else
                {
                    // Créer l'événement commémoratif
                    await CreateMemorialEventAsync(person, familyId);
                }

                await _context.SaveChangesAsync();
            }
            // Si la personne est vivante
            else
            {
                // Supprimer l'événement commémoratif s'il existe
                if (memorialEvent != null)
                {
                    _context.Events.Remove(memorialEvent);
                }

                // Créer ou mettre à jour l'événement anniversaire
                if (birthdayEvent != null)
                {
                    // Mettre à jour la date
                    var today = DateTime.UtcNow.Date;
                    var birthdayThisYear = new DateTime(today.Year, person.Birthday.Value.Month, person.Birthday.Value.Day);
                    var nextBirthday = birthdayThisYear >= today ? birthdayThisYear : birthdayThisYear.AddYears(1);

                    birthdayEvent.StartDate = DateTime.SpecifyKind(nextBirthday, DateTimeKind.Utc);
                    birthdayEvent.Description = $"🎂 Joyeux anniversaire {person.FirstName} !";
                }
                else
                {
                    // Créer l'événement anniversaire
                    await CreateBirthdayEventAsync(person, familyId);
                }

                await _context.SaveChangesAsync();
            }
        }
    }

    // DTO pour la mise à jour du profil
    public class UpdateProfileDto
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Sex { get; set; } = string.Empty;
        public DateTime? Birthday { get; set; }
        public string? Email { get; set; }
        public string? Activity { get; set; }
        public string? PhotoUrl { get; set; }
        public string? Notes { get; set; }
        public int CityID { get; set; }
        public bool Alive { get; set; }
        public DateTime? DeathDate { get; set; }
    }
}
