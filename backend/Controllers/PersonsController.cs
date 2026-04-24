using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using FamilyTreeAPI.Data;
using FamilyTreeAPI.Models;
using FamilyTreeAPI.Services;

namespace FamilyTreeAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PersonsController : ControllerBase
    {
        private readonly FamilyTreeContext _context;
        private readonly CloudinaryService _cloudinary;

        public PersonsController(FamilyTreeContext context, CloudinaryService cloudinary)
        {
            _context = context;
            _cloudinary = cloudinary;
        }

        // GET: api/Persons - Retourne uniquement les membres de la famille de l'utilisateur
        [HttpGet]
        [Authorize]
        public async Task<ActionResult> GetPersons(
            [FromQuery] int? page = null,
            [FromQuery] int pageSize = 50,
            [FromQuery] string? search = null)
        {
            // 🔒 SÉCURITÉ : Récupérer l'ID de famille de l'utilisateur connecté
            var userFamilyId = int.Parse(User.FindFirst("familyId")?.Value ?? "0");

            if (userFamilyId == 0)
            {
                return Unauthorized(new { message = "Famille non identifiée" });
            }

            // Si pas de page spécifiée → retourner tous (compatibilité arbre généalogique)
            if (page == null)
            {
                var allPersons = await _context.Persons
                    .Where(p => p.FamilyID == userFamilyId)
                    .Select(p => new
                    {
                        p.PersonID, p.FirstName, p.LastName, p.Sex,
                        p.Birthday, p.DeathDate, p.Alive, p.Activity,
                        p.PhotoUrl, p.Notes, p.Email,
                        p.FatherID, p.MotherID, p.FamilyID, p.CityID,
                        CityName = p.City != null ? p.City.Name : null,
                        FamilyName = p.Family != null ? p.Family.FamilyName : null,
                        FatherName = p.Father != null ? p.Father.FirstName + " " + p.Father.LastName : null,
                        MotherName = p.Mother != null ? p.Mother.FirstName + " " + p.Mother.LastName : null
                    })
                    .ToListAsync();
                return Ok(allPersons);
            }

            // Mode paginé
            pageSize = Math.Clamp(pageSize, 1, 200);
            var pageNumber = Math.Max(1, page.Value);

            var query = _context.Persons.Where(p => p.FamilyID == userFamilyId);

            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.ToLower();
                query = query.Where(p =>
                    p.FirstName.ToLower().Contains(term) ||
                    p.LastName.ToLower().Contains(term));
            }

            var total = await query.CountAsync();

            var personsDto = await query
                .OrderBy(p => p.LastName).ThenBy(p => p.FirstName)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(p => new
                {
                    p.PersonID, p.FirstName, p.LastName, p.Sex,
                    p.Birthday, p.DeathDate, p.Alive, p.Activity,
                    p.PhotoUrl, p.Notes, p.Email,
                    p.FatherID, p.MotherID, p.FamilyID, p.CityID,
                    CityName = p.City != null ? p.City.Name : null,
                    FamilyName = p.Family != null ? p.Family.FamilyName : null,
                    FatherName = p.Father != null ? p.Father.FirstName + " " + p.Father.LastName : null,
                    MotherName = p.Mother != null ? p.Mother.FirstName + " " + p.Mother.LastName : null
                })
                .ToListAsync();

            return Ok(new
            {
                data = personsDto,
                total,
                page = pageNumber,
                pageSize,
                totalPages = (int)Math.Ceiling(total / (double)pageSize)
            });
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
        public async Task<ActionResult<Person>> PostPerson(CreatePersonDto personDto)
        {
            // 🔒 Récupérer l'ID de famille et connexion de l'utilisateur
            var userFamilyId = int.Parse(User.FindFirst("familyId")?.Value ?? "0");
            var userConnexionId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            
            if (userFamilyId == 0 || userConnexionId == 0)
            {
                return Unauthorized(new { message = "Utilisateur non identifié" });
            }

            // Créer l'objet Person à partir du DTO
            var person = new Person
            {
                FirstName = personDto.FirstName,
                LastName = personDto.LastName,
                Sex = personDto.Sex,
                Birthday = personDto.Birthday,
                Email = personDto.Email,
                Activity = personDto.Activity,
                PhotoUrl = personDto.PhotoUrl,
                Notes = personDto.Notes,
                CityID = personDto.CityID,
                Alive = personDto.Alive,
                DeathDate = personDto.DeathDate,
                FamilyID = userFamilyId, // 🔒 Forcer le FamilyID
                CreatedBy = userConnexionId,
                // 🕊️ Logique automatique selon statut vital
                Status = personDto.Alive ? "confirmed" : "deceased",
                CanLogin = personDto.Alive // Les décédés ne peuvent jamais se connecter
            };

            // Gestion du père (mode manuel ou dropdown)
            if (!string.IsNullOrEmpty(personDto.FatherFirstName) || !string.IsNullOrEmpty(personDto.FatherLastName))
            {
                // Mode manuel : créer ou trouver un placeholder
                var father = await FindOrCreateParentPlaceholderForCreate(
                    personDto.FatherFirstName ?? "",
                    personDto.FatherLastName ?? "",
                    "M",
                    userFamilyId
                );
                person.FatherID = father.PersonID;
            }
            else if (personDto.FatherID.HasValue)
            {
                // Mode dropdown : utiliser l'ID fourni
                person.FatherID = personDto.FatherID;
            }

            // Gestion de la mère (mode manuel ou dropdown)
            if (!string.IsNullOrEmpty(personDto.MotherFirstName) || !string.IsNullOrEmpty(personDto.MotherLastName))
            {
                // Mode manuel : créer ou trouver un placeholder
                var mother = await FindOrCreateParentPlaceholderForCreate(
                    personDto.MotherFirstName ?? "",
                    personDto.MotherLastName ?? "",
                    "F",
                    userFamilyId
                );
                person.MotherID = mother.PersonID;
            }
            else if (personDto.MotherID.HasValue)
            {
                // Mode dropdown : utiliser l'ID fourni
                person.MotherID = personDto.MotherID;
            }

            _context.Persons.Add(person);
            await _context.SaveChangesAsync();

            // 👫 Créer automatiquement une union entre père et mère si les deux sont définis
            if (person.FatherID.HasValue && person.MotherID.HasValue)
            {
                await CreateParentsUnionIfNeededAsync(person.FatherID, person.MotherID);
            }

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
        public async Task<IActionResult> PutPerson(int id, [FromForm] UpdatePersonDto personUpdate, [FromForm] IFormFile? photo)
        {
            // 🔒 Récupérer les infos de l'utilisateur
            var userFamilyId = int.Parse(User.FindFirst("familyId")?.Value ?? "0");
            var userConnexionId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var userRole = User.FindFirst("role")?.Value ?? User.FindFirst(ClaimTypes.Role)?.Value ?? "Member";
            var userPersonId = int.Parse(User.FindFirst("personId")?.Value ?? "0");

            Console.WriteLine($"🔍 PUT Person {id}: userConnexionId={userConnexionId}, userFamilyId={userFamilyId}, userRole={userRole}, userPersonId={userPersonId}");
            
            // Validation des données utilisateur
            if (userConnexionId == 0 || userFamilyId == 0)
            {
                Console.WriteLine($"❌ Session invalide: userConnexionId={userConnexionId}, userFamilyId={userFamilyId}");
                return StatusCode(401, new { message = "Session invalide. Veuillez vous reconnecter." });
            }
            
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

            // 🔒 Vérifier les permissions de base : Admin OU Créateur OU Son propre profil
            bool isAdmin = userRole?.Equals("Admin", StringComparison.OrdinalIgnoreCase) == true || 
                          userRole?.Equals("ADMIN", StringComparison.OrdinalIgnoreCase) == true ||
                          userRole?.Equals("SUPER_ADMIN", StringComparison.OrdinalIgnoreCase) == true;
            bool isCreator = existingPerson.CreatedBy == userConnexionId;
            bool isOwnProfile = existingPerson.PersonID == userPersonId;
            
            // �‍👩‍👦 Vérifications bidirectionnelles Parent-Enfant
            bool isParentOfTarget = false;
            bool isChildOfTarget = false;
            
            // Récupérer le Person actuel pour vérifier les relations
            var currentUserPerson = await _context.Persons.FindAsync(userPersonId);
            if (currentUserPerson != null)
            {
                // L'utilisateur est-il parent de la cible ?
                isParentOfTarget = existingPerson.FatherID == userPersonId || existingPerson.MotherID == userPersonId;
                
                // L'utilisateur est-il enfant de la cible ?
                isChildOfTarget = currentUserPerson.FatherID == id || currentUserPerson.MotherID == id;
            }
            
            // ✅ Autorisation finale : Au moins une des 5 conditions doit être vraie
            if (!isAdmin && !isCreator && !isOwnProfile && !isParentOfTarget && !isChildOfTarget)
            {
                return StatusCode(403, new { message = "Vous ne pouvez modifier que votre propre profil, les membres que vous avez créés, vos parents ou vos enfants" });
            }

            // �‍👩‍👦 Gérer les parents (placeholder ou existants)
            int? fatherId = personUpdate.FatherID;
            int? motherId = personUpdate.MotherID;
            
            // Si des noms de parents sont fournis en mode manuel, créer des placeholders
            if (!string.IsNullOrEmpty(personUpdate.FatherFirstName) && !string.IsNullOrEmpty(personUpdate.FatherLastName))
            {
                var fatherPlaceholder = await FindOrCreateParentPlaceholder(
                    personUpdate.FatherFirstName,
                    personUpdate.FatherLastName,
                    "M",
                    existingPerson.CityID,
                    userConnexionId,
                    userFamilyId
                );
                
                if (fatherPlaceholder == null)
                {
                    return StatusCode(500, new { message = "Erreur lors de la création du placeholder pour le père" });
                }
                
                fatherId = fatherPlaceholder.PersonID;
            }
            
            if (!string.IsNullOrEmpty(personUpdate.MotherFirstName) && !string.IsNullOrEmpty(personUpdate.MotherLastName))
            {
                var motherPlaceholder = await FindOrCreateParentPlaceholder(
                    personUpdate.MotherFirstName,
                    personUpdate.MotherLastName,
                    "F",
                    existingPerson.CityID,
                    userConnexionId,
                    userFamilyId
                );
                
                if (motherPlaceholder == null)
                {
                    return StatusCode(500, new { message = "Erreur lors de la création du placeholder pour la mère" });
                }
                
                motherId = motherPlaceholder.PersonID;
            }

            // 🛡️ CORRECTION BUG : Déterminer le statut vital à partir de la date de décès
            // La présence d'une date de décès indique que la personne est décédée.
            // Cela évite les problèmes de liaison de modèle (model binding) avec les booléens depuis FormData.
            bool isAliveBasedOnDeathDate = !personUpdate.DeathDate.HasValue;

            // 📸 Upload photo vers Cloudinary si un fichier est fourni
            string? newPhotoUrl = personUpdate.PhotoUrl;
            if (photo != null && photo.Length > 0)
            {
                var uploadedUrl = await _cloudinary.UploadPhotoAsync(photo, "family-tree/persons");
                if (uploadedUrl != null)
                {
                    newPhotoUrl = uploadedUrl;
                }
            }

            // Mise à jour des champs autorisés
            existingPerson.FirstName = personUpdate.FirstName;
            existingPerson.LastName = personUpdate.LastName;
            existingPerson.Sex = personUpdate.Sex;
            existingPerson.Birthday = personUpdate.Birthday.HasValue
                ? DateTime.SpecifyKind(personUpdate.Birthday.Value, DateTimeKind.Utc)
                : null;
            existingPerson.Email = personUpdate.Email;
            existingPerson.Activity = personUpdate.Activity;
            existingPerson.PhotoUrl = newPhotoUrl;
            existingPerson.Notes = personUpdate.Notes;
            existingPerson.CityID = personUpdate.CityID;
            
            // APPLIQUER LA LOGIQUE CORRIGÉE
            existingPerson.Alive = isAliveBasedOnDeathDate;
            existingPerson.DeathDate = personUpdate.DeathDate.HasValue 
                ? DateTime.SpecifyKind(personUpdate.DeathDate.Value, DateTimeKind.Utc) 
                : null;

            existingPerson.FatherID = fatherId;
            existingPerson.MotherID = motherId;
            
            // 🕊️ Mettre à jour Status et CanLogin selon statut vital
            // ⚠️ IMPORTANT: Utiliser isAliveBasedOnDeathDate au lieu de existingPerson.Alive
            existingPerson.Status = isAliveBasedOnDeathDate ? "confirmed" : "deceased";
            existingPerson.CanLogin = isAliveBasedOnDeathDate; // Les décédés ne peuvent jamais se connecter

            try
            {
                await _context.SaveChangesAsync();

                // 👫 Créer automatiquement une union si père ET mère sont définis
                if (existingPerson.FatherID.HasValue && existingPerson.MotherID.HasValue)
                {
                    await CreateParentsUnionIfNeededAsync(existingPerson.FatherID, existingPerson.MotherID);
                }

                // 🎂 Créer ou mettre à jour l'événement anniversaire si la date de naissance a changé
                if (existingPerson.Birthday.HasValue)
                {
                    await CreateOrUpdateBirthdayEventAsync(existingPerson, userFamilyId);
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
            existingPerson.Birthday = personUpdate.Birthday.HasValue 
                ? DateTime.SpecifyKind(personUpdate.Birthday.Value, DateTimeKind.Utc) 
                : null;
            existingPerson.Email = personUpdate.Email;
            existingPerson.Activity = personUpdate.Activity;
            existingPerson.PhotoUrl = personUpdate.PhotoUrl;
            existingPerson.Notes = personUpdate.Notes;
            existingPerson.CityID = personUpdate.CityID;
            existingPerson.Alive = personUpdate.Alive;
            existingPerson.DeathDate = personUpdate.DeathDate.HasValue 
                ? DateTime.SpecifyKind(personUpdate.DeathDate.Value, DateTimeKind.Utc) 
                : null;

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

        // POST: api/persons/upload-photo — Upload une photo vers Cloudinary et retourne l'URL
        [HttpPost("upload-photo")]
        [Authorize]
        public async Task<ActionResult> UploadPersonPhoto([FromForm] IFormFile photo)
        {
            if (photo == null || photo.Length == 0)
                return BadRequest(new { message = "Aucun fichier fourni" });

            if (!_cloudinary.IsConfigured)
                return StatusCode(503, new { message = "Service de stockage photo non configuré" });

            var url = await _cloudinary.UploadPhotoAsync(photo, "family-tree/persons");
            if (url == null)
                return StatusCode(500, new { message = "Erreur lors de l'upload de la photo" });

            return Ok(new { url });
        }

        // 👫 Crée automatiquement une union entre père et mère si elle n'existe pas encore
        private async Task CreateParentsUnionIfNeededAsync(int? fatherId, int? motherId)
        {
            if (!fatherId.HasValue || !motherId.HasValue) return;

            var father = await _context.Persons.FindAsync(fatherId.Value);
            var mother = await _context.Persons.FindAsync(motherId.Value);
            if (father == null || mother == null) return;

            // Déterminer ManID et WomanID selon le sexe réel
            int manId, womanId;
            if (father.Sex == "M" && mother.Sex == "F")
            {
                manId = fatherId.Value;
                womanId = motherId.Value;
            }
            else if (father.Sex == "F" && mother.Sex == "M")
            {
                manId = motherId.Value;
                womanId = fatherId.Value;
            }
            else
            {
                // Sexes identiques ou inconnus : utiliser l'ordre tel quel
                manId = fatherId.Value;
                womanId = motherId.Value;
            }

            // Vérifier si une union existe déjà entre ces deux personnes
            var exists = await _context.Weddings.AnyAsync(w =>
                (w.ManID == manId && w.WomanID == womanId) ||
                (w.ManID == womanId && w.WomanID == manId));

            if (exists) return;

            var wedding = new Wedding
            {
                ManID = manId,
                WomanID = womanId,
                // Sentinel 1900-01-01 = date inconnue. Le frontend affiche "Date inconnue"
                // quand getFullYear() <= 1900 (voir WeddingsList.tsx et MarriageCard.tsx).
                // Ne pas remplacer par DateTime.UtcNow : ferait apparaître la date du jour dans la liste des mariages.
                WeddingDate = new DateTime(1900, 1, 1),
                IsActive = true,
                Status = "active",
                Notes = "Union créée automatiquement lors de l'ajout d'un enfant commun",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Weddings.Add(wedding);
            await _context.SaveChangesAsync();
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
            var userRole = User.FindFirst("role")?.Value ?? User.FindFirst(ClaimTypes.Role)?.Value ?? "Member";
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

            // 🔒 Vérifications de base
            bool isAdmin = userRole?.Equals("Admin", StringComparison.OrdinalIgnoreCase) == true || 
                          userRole?.Equals("ADMIN", StringComparison.OrdinalIgnoreCase) == true ||
                          userRole?.Equals("SUPER_ADMIN", StringComparison.OrdinalIgnoreCase) == true;
            bool isCreator = person.CreatedBy == userConnexionId;
            bool isOwnProfile = person.PersonID == userPersonId;
            
            // 👨‍👩‍👦 Vérifications bidirectionnelles Parent-Enfant
            bool isParentOfTarget = false;
            bool isChildOfTarget = false;
            
            // Récupérer le Person actuel pour vérifier les relations
            var currentUserPerson = await _context.Persons
                .FirstOrDefaultAsync(p => p.PersonID == userPersonId);
            
            if (currentUserPerson != null)
            {
                // L'utilisateur est-il parent de la cible ?
                isParentOfTarget = person.FatherID == userPersonId || person.MotherID == userPersonId;
                
                // L'utilisateur est-il enfant de la cible ?
                isChildOfTarget = currentUserPerson.FatherID == id || currentUserPerson.MotherID == id;
            }
            
            bool canEdit = isAdmin || isCreator || isOwnProfile || isParentOfTarget || isChildOfTarget;
            
            return Ok(new 
            { 
                canEdit,
                isAdmin,
                isCreator,
                isOwnProfile,
                isParentOfTarget,
                isChildOfTarget,
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
                Title = $"Anniversaire de {person.FirstName}",
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
                    (e.Title == $"Anniversaire de {person.FirstName}" ||
                     e.Title == $"Anniversaire de {person.FirstName} {person.LastName}"));

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
        
        // 🆕 Méthode pour trouver ou créer un parent "placeholder"
        private async Task<Person?> FindOrCreateParentPlaceholder(
            string firstName, 
            string lastName, 
            string sex, 
            int cityId,
            int createdBy,
            int familyId)
        {
            // 1. Vérifier si un utilisateur actif existe déjà avec ce nom dans cette famille
            var existingPerson = await _context.Persons
                .FirstOrDefaultAsync(p => 
                    p.FirstName.ToLower() == firstName.ToLower() && 
                    p.LastName.ToLower() == lastName.ToLower() &&
                    p.Sex == sex &&
                    p.FamilyID == familyId &&
                    p.Status == "confirmed");
            
            if (existingPerson != null)
            {
                Console.WriteLine($"✅ Parent trouvé (actif): {firstName} {lastName}");
                return existingPerson;
            }
            
            // 2. Vérifier si un placeholder existe déjà dans cette famille
            var existingPlaceholder = await _context.Persons
                .FirstOrDefaultAsync(p => 
                    p.FirstName.ToLower() == firstName.ToLower() && 
                    p.LastName.ToLower() == lastName.ToLower() &&
                    p.Sex == sex &&
                    p.FamilyID == familyId &&
                    p.Status == "placeholder");
            
            if (existingPlaceholder != null)
            {
                Console.WriteLine($"✅ Placeholder existant trouvé: {firstName} {lastName}");
                return existingPlaceholder;
            }
            
            // 3. Créer un nouveau placeholder
            Console.WriteLine($"🔍 Tentative de création de placeholder: {firstName} {lastName}, FamilyID: {familyId}");
            
            var placeholder = new Person
            {
                FirstName = firstName,
                LastName = lastName,
                Sex = sex,
                FamilyID = familyId,  // ✅ Le placeholder appartient à la même famille
                CityID = cityId,
                Status = "placeholder", // Statut spécial
                Alive = true,
                CanLogin = false, // Ne peut pas se connecter tant que non réclamé
                CreatedBy = null,  // ⚠️ Les placeholders n'ont pas de créateur spécifique
                ParentLinkConfirmed = false
            };
            
            _context.Persons.Add(placeholder);
            await _context.SaveChangesAsync();
            
            Console.WriteLine($"🆕 Nouveau placeholder créé: {firstName} {lastName} (ID: {placeholder.PersonID})");
            return placeholder;
        }

        // Méthode utilitaire pour créer/trouver les parents placeholders (pour PostPerson)
        private async Task<Person> FindOrCreateParentPlaceholderForCreate(
            string firstName, 
            string lastName, 
            string sex,
            int familyId)
        {
            // 1. Vérifier si un utilisateur actif existe déjà avec ce nom dans cette famille
            var existingPerson = await _context.Persons
                .FirstOrDefaultAsync(p => 
                    p.FirstName.ToLower() == firstName.ToLower() && 
                    p.LastName.ToLower() == lastName.ToLower() &&
                    p.Sex == sex &&
                    p.FamilyID == familyId &&
                    p.Status == "confirmed");
            
            if (existingPerson != null)
            {
                Console.WriteLine($"✅ Parent trouvé (actif): {firstName} {lastName}");
                return existingPerson;
            }
            
            // 2. Vérifier si un placeholder existe déjà dans cette famille
            var existingPlaceholder = await _context.Persons
                .FirstOrDefaultAsync(p => 
                    p.FirstName.ToLower() == firstName.ToLower() && 
                    p.LastName.ToLower() == lastName.ToLower() &&
                    p.Sex == sex &&
                    p.FamilyID == familyId &&
                    p.Status == "placeholder");
            
            if (existingPlaceholder != null)
            {
                Console.WriteLine($"✅ Placeholder existant trouvé: {firstName} {lastName}");
                return existingPlaceholder;
            }
            
            // 3. Créer un nouveau placeholder
            var placeholder = new Person
            {
                FirstName = firstName,
                LastName = lastName,
                Sex = sex,
                FamilyID = familyId,
                CityID = 1, // Ville par défaut
                Status = "placeholder",
                Alive = true,
                CreatedBy = null // Les placeholders n'ont pas de créateur
            };
            
            _context.Persons.Add(placeholder);
            await _context.SaveChangesAsync();
            
            Console.WriteLine($"🆕 Nouveau placeholder créé: {firstName} {lastName}");
            return placeholder;
        }

        // DTO pour la création d'une nouvelle personne
    public class CreatePersonDto
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
        
        // Parents (mode dropdown)
        public int? FatherID { get; set; }
        public int? MotherID { get; set; }
        
        // Parents (mode manuel - placeholder)
        public string? FatherFirstName { get; set; }
        public string? FatherLastName { get; set; }
        public string? MotherFirstName { get; set; }
        public string? MotherLastName { get; set; }
    }

    // 👑 GET: api/Persons/{personId}/role - Récupérer le rôle d'un utilisateur
    [HttpGet("{personId}/role")]
    [Authorize]
    public async Task<ActionResult> GetUserRole(int personId)
    {
        var connexion = await _context.Connexions
            .FirstOrDefaultAsync(c => c.IDPerson == personId);

        if (connexion == null)
        {
            return NotFound(new { message = "Compte utilisateur introuvable pour cette personne" });
        }

        return Ok(new { 
            personId = personId,
            role = connexion.Role,
            canModifyRole = User.FindFirst("role")?.Value == "Admin"
        });
    }

    // 👑 PUT: api/Persons/{personId}/role - Mettre à jour le rôle d'un utilisateur (Admin uniquement)
    [HttpPut("{personId}/role")]
    [Authorize]
    public async Task<ActionResult> UpdateUserRole(int personId, [FromBody] UpdateRoleDto updateRole)
    {
        // 🔐 Vérifier que l'utilisateur connecté est Admin
        var userRole = User.FindFirst("role")?.Value ?? User.FindFirst(ClaimTypes.Role)?.Value ?? "Member";
        if (userRole != "Admin")
        {
            return StatusCode(403, new { message = "Seuls les administrateurs peuvent modifier les rôles" });
        }

        // Trouver la connexion associée à cette personne
        var connexion = await _context.Connexions
            .FirstOrDefaultAsync(c => c.IDPerson == personId);

        if (connexion == null)
        {
            return NotFound(new { message = "Compte utilisateur introuvable pour cette personne" });
        }

        // Mettre à jour le rôle
        connexion.Role = updateRole.Role;
        await _context.SaveChangesAsync();

        return Ok(new { 
            message = $"Rôle mis à jour: {updateRole.Role}",
            personId = personId,
            role = connexion.Role
        });
    }

    public class UpdateRoleDto
    {
        public string Role { get; set; } = "Member"; // "Admin" ou "Member"
    }

    public class UpdatePersonDto
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
        
        // Parents (mode dropdown)
        public int? FatherID { get; set; }
        public int? MotherID { get; set; }
        
        // Parents (mode manuel - placeholder)
        public string? FatherFirstName { get; set; }
        public string? FatherLastName { get; set; }
        public string? MotherFirstName { get; set; }
        public string? MotherLastName { get; set; }
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
}
