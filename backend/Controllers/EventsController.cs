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
    public class EventsController : ControllerBase
    {
        private readonly FamilyTreeContext _context;

        public EventsController(FamilyTreeContext context)
        {
            _context = context;
        }

        // GET: api/Events - Liste des événements de la famille
        [HttpGet]
        [Authorize]
        public async Task<ActionResult> GetEvents([FromQuery] string? type, [FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
        {
            var userFamilyId = int.Parse(User.FindFirst("familyId")?.Value ?? "0");
            var userConnexionId = int.Parse(User.FindFirst("id")?.Value ?? "0");
            var userPersonId = int.Parse(User.FindFirst("personId")?.Value ?? "0");
            
            if (userFamilyId == 0)
            {
                return Unauthorized(new { message = "Famille non identifiée" });
            }

            var query = _context.Events
                .Where(e => e.FamilyID == userFamilyId)
                .Include(e => e.Participants)
                    .ThenInclude(p => p.Person)
                .Include(e => e.Photos)
                .AsQueryable();

            // 🔒 Filtre de visibilité : 
            // - Events 'family' : tout le monde peut voir
            // - Events 'private' : seulement le créateur et les participants
            query = query.Where(e => 
                e.Visibility == "family" || 
                e.CreatedBy == userConnexionId ||
                e.Participants.Any(p => p.PersonID == userPersonId)
            );

            // Filtres
            if (!string.IsNullOrEmpty(type))
            {
                query = query.Where(e => e.EventType == type);
            }

            if (startDate.HasValue)
            {
                query = query.Where(e => e.StartDate >= startDate.Value);
            }

            if (endDate.HasValue)
            {
                query = query.Where(e => e.StartDate <= endDate.Value);
            }

            var events = await query
                .OrderByDescending(e => e.StartDate)
                .Select(e => new
                {
                    e.EventID,
                    e.Title,
                    e.Description,
                    e.StartDate,
                    e.EndDate,
                    e.EventType,
                    e.Location,
                    e.Visibility,
                    e.IsRecurring,
                    e.CreatedBy,
                    e.CreatedAt,
                    ParticipantCount = e.Participants.Count,
                    Participants = e.Participants.Select(p => new
                    {
                        p.PersonID,
                        PersonName = p.Person.FirstName + " " + p.Person.LastName,
                        p.Status
                    }),
                    PhotoCount = e.Photos.Count,
                    Photos = e.Photos.Select(ph => new
                    {
                        ph.EventPhotoID,
                        ph.PhotoUrl,
                        ph.Caption
                    })
                })
                .ToListAsync();

            return Ok(events);
        }

        // GET: api/Events/5 - Détails d'un événement
        [HttpGet("{id}")]
        [Authorize]
        public async Task<ActionResult> GetEvent(int id)
        {
            var userFamilyId = int.Parse(User.FindFirst("familyId")?.Value ?? "0");
            var userConnexionId = int.Parse(User.FindFirst("id")?.Value ?? "0");
            var userPersonId = int.Parse(User.FindFirst("personId")?.Value ?? "0");

            var eventData = await _context.Events
                .Where(e => e.EventID == id && e.FamilyID == userFamilyId)
                .Include(e => e.Participants)
                    .ThenInclude(p => p.Person)
                .Include(e => e.Photos)
                .Include(e => e.Creator)
                .FirstOrDefaultAsync();

            if (eventData == null)
            {
                return NotFound();
            }

            // 🔒 Vérification de visibilité
            if (eventData.Visibility == "private")
            {
                bool isCreator = eventData.CreatedBy == userConnexionId;
                bool isParticipant = eventData.Participants.Any(p => p.PersonID == userPersonId);

                if (!isCreator && !isParticipant)
                {
                    return StatusCode(403, new { message = "Cet événement est privé" });
                }
            }

            var result = new
            {
                eventData.EventID,
                eventData.Title,
                eventData.Description,
                eventData.StartDate,
                eventData.EndDate,
                eventData.EventType,
                eventData.Location,
                eventData.Visibility,
                eventData.IsRecurring,
                eventData.CreatedBy,
                CreatorName = eventData.Creator.UserName,
                eventData.CreatedAt,
                eventData.UpdatedAt,
                Participants = eventData.Participants.Select(p => new
                {
                    p.EventParticipantID,
                    p.PersonID,
                    PersonName = p.Person.FirstName + " " + p.Person.LastName,
                    PersonPhotoUrl = p.Person.PhotoUrl,
                    p.Status,
                    p.RespondedAt
                }),
                Photos = eventData.Photos.Select(ph => new
                {
                    ph.EventPhotoID,
                    ph.PhotoUrl,
                    ph.Caption,
                    ph.UploadedAt,
                    ph.UploadedBy
                })
            };

            return Ok(result);
        }

        // POST: api/Events - Créer un événement
        [HttpPost]
        [Authorize]
        public async Task<ActionResult> PostEvent([FromBody] CreateEventDto dto)
        {
            var userFamilyId = int.Parse(User.FindFirst("familyId")?.Value ?? "0");
            var userConnexionId = int.Parse(User.FindFirst("id")?.Value ?? "0");

            if (userFamilyId == 0)
            {
                return Unauthorized(new { message = "Famille non identifiée" });
            }

            // Validation : EndDate >= StartDate
            if (dto.EndDate.HasValue && dto.EndDate < dto.StartDate)
            {
                return BadRequest(new { message = "La date de fin doit être postérieure ou égale à la date de début" });
            }

            // Parser les dates en UTC pour PostgreSQL
            var startDateUtc = DateTime.SpecifyKind(dto.StartDate, DateTimeKind.Utc);
            var endDateUtc = dto.EndDate.HasValue ? DateTime.SpecifyKind(dto.EndDate.Value, DateTimeKind.Utc) : (DateTime?)null;

            var newEvent = new Event
            {
                FamilyID = userFamilyId,
                Title = dto.Title,
                Description = dto.Description,
                StartDate = startDateUtc,
                EndDate = endDateUtc,
                EventType = dto.EventType,
                Location = dto.Location,
                Visibility = dto.Visibility ?? "family",
                IsRecurring = dto.IsRecurring,
                CreatedBy = userConnexionId,
                CreatedAt = DateTime.UtcNow
            };

            _context.Events.Add(newEvent);
            await _context.SaveChangesAsync();

            // Ajouter les participants
            if (dto.ParticipantIDs != null && dto.ParticipantIDs.Any())
            {
                foreach (var personId in dto.ParticipantIDs)
                {
                    _context.EventParticipants.Add(new EventParticipant
                    {
                        EventID = newEvent.EventID,
                        PersonID = personId,
                        Status = "confirmed"
                    });
                }
                await _context.SaveChangesAsync();
            }

            return CreatedAtAction(nameof(GetEvent), new { id = newEvent.EventID }, new
            {
                newEvent.EventID,
                newEvent.Title,
                message = "✅ Événement créé avec succès !"
            });
        }

        // PUT: api/Events/5 - Modifier un événement
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> PutEvent(int id, [FromBody] UpdateEventDto dto)
        {
            var userFamilyId = int.Parse(User.FindFirst("familyId")?.Value ?? "0");
            var userConnexionId = int.Parse(User.FindFirst("id")?.Value ?? "0");
            var userRole = User.FindFirst("role")?.Value ?? "Member";

            var existingEvent = await _context.Events.FindAsync(id);

            if (existingEvent == null)
            {
                return NotFound();
            }

            // Vérifier que c'est bien la même famille
            if (existingEvent.FamilyID != userFamilyId)
            {
                return Forbid();
            }

            // 🔒 Permissions : Admin OU Créateur
            bool isAdmin = userRole == "Admin";
            bool isCreator = existingEvent.CreatedBy == userConnexionId;

            if (!isAdmin && !isCreator)
            {
                return StatusCode(403, new { message = "Vous ne pouvez modifier que les événements que vous avez créés" });
            }

            // Validation
            if (dto.EndDate.HasValue && dto.EndDate < dto.StartDate)
            {
                return BadRequest(new { message = "La date de fin doit être postérieure ou égale à la date de début" });
            }

            // Parser les dates en UTC pour PostgreSQL
            var startDateUtc = DateTime.SpecifyKind(dto.StartDate, DateTimeKind.Utc);
            var endDateUtc = dto.EndDate.HasValue ? DateTime.SpecifyKind(dto.EndDate.Value, DateTimeKind.Utc) : (DateTime?)null;

            // Mise à jour
            existingEvent.Title = dto.Title;
            existingEvent.Description = dto.Description;
            existingEvent.StartDate = startDateUtc;
            existingEvent.EndDate = endDateUtc;
            existingEvent.EventType = dto.EventType;
            existingEvent.Location = dto.Location;
            existingEvent.Visibility = dto.Visibility ?? "family";
            existingEvent.IsRecurring = dto.IsRecurring;
            existingEvent.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "🟢 Modifications enregistrées." });
        }

        // DELETE: api/Events/5 - Supprimer un événement
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteEvent(int id)
        {
            var userFamilyId = int.Parse(User.FindFirst("familyId")?.Value ?? "0");
            var userConnexionId = int.Parse(User.FindFirst("id")?.Value ?? "0");
            var userRole = User.FindFirst("role")?.Value ?? "Member";

            var eventData = await _context.Events.FindAsync(id);

            if (eventData == null)
            {
                return NotFound();
            }

            if (eventData.FamilyID != userFamilyId)
            {
                return Forbid();
            }

            // 🔒 Permissions : Admin OU Créateur
            bool isAdmin = userRole == "Admin";
            bool isCreator = eventData.CreatedBy == userConnexionId;

            if (!isAdmin && !isCreator)
            {
                return StatusCode(403, new { message = "Vous ne pouvez supprimer que les événements que vous avez créés" });
            }

            _context.Events.Remove(eventData);
            await _context.SaveChangesAsync();

            return Ok(new { message = "⚠️ Événement supprimé définitivement" });
        }

        // GET: api/Events/upcoming - Événements à venir (pour le widget Dashboard)
        [HttpGet("upcoming")]
        [Authorize]
        public async Task<ActionResult> GetUpcomingEvents([FromQuery] int days = 90)
        {
            var userFamilyId = int.Parse(User.FindFirst("familyId")?.Value ?? "0");
            var today = DateTime.UtcNow.Date;
            var futureDate = today.AddDays(days);

            // Récupérer tous les événements de la famille
            var allEvents = await _context.Events
                .Where(e => e.FamilyID == userFamilyId)
                .ToListAsync();

            var upcomingEvents = new List<object>();

            foreach (var evt in allEvents)
            {
                DateTime eventDateToCheck;

                // Pour les événements récurrents (anniversaires, commémorations)
                if (evt.IsRecurring)
                {
                    // Calculer la prochaine occurrence cette année ou l'année prochaine
                    var eventThisYear = new DateTime(today.Year, evt.StartDate.Month, evt.StartDate.Day);
                    eventDateToCheck = eventThisYear >= today ? eventThisYear : eventThisYear.AddYears(1);
                }
                else
                {
                    // Pour les événements non récurrents, utiliser la date exacte
                    eventDateToCheck = evt.StartDate.Date;
                }

                // Vérifier si l'événement est dans la période souhaitée (> aujourd'hui, exclure aujourd'hui)
                if (eventDateToCheck > today && eventDateToCheck <= futureDate)
                {
                    var daysUntil = (eventDateToCheck - today).Days;
                    
                    upcomingEvents.Add(new
                    {
                        evt.EventID,
                        evt.Title,
                        evt.Description,
                        StartDate = eventDateToCheck,
                        evt.EventType,
                        evt.IsRecurring,
                        DaysUntil = daysUntil,
                        DateLabel = daysUntil == 0 ? "Aujourd'hui" :
                                    daysUntil == 1 ? "Demain" :
                                    $"Dans {daysUntil} jours"
                    });
                }
            }

            // Trier par date
            var sortedEvents = upcomingEvents
                .OrderBy(e => (DateTime)e.GetType().GetProperty("StartDate")!.GetValue(e)!)
                .ToList();

            return Ok(sortedEvents);
        }

        // POST: api/Events/{id}/photos - Ajouter une photo à un événement
        [HttpPost("{id}/photos")]
        [Authorize]
        public async Task<ActionResult> AddEventPhoto(int id, [FromBody] AddPhotoDto dto)
        {
            var userConnexionId = int.Parse(User.FindFirst("id")?.Value ?? "0");

            var eventData = await _context.Events.FindAsync(id);

            if (eventData == null)
            {
                return NotFound();
            }

            var photo = new EventPhoto
            {
                EventID = id,
                PhotoUrl = dto.PhotoUrl,
                Caption = dto.Caption,
                UploadedBy = userConnexionId,
                UploadedAt = DateTime.UtcNow
            };

            _context.EventPhotos.Add(photo);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                photo.EventPhotoID,
                message = "📸 Photo ajoutée à l'événement."
            });
        }
    }

    // DTOs
    public class CreateEventDto
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string EventType { get; set; } = "other";
        public string? Location { get; set; }
        public string? Visibility { get; set; }
        public bool IsRecurring { get; set; }
        public List<int>? ParticipantIDs { get; set; }
    }

    public class UpdateEventDto
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string EventType { get; set; } = "other";
        public string? Location { get; set; }
        public string? Visibility { get; set; }
        public bool IsRecurring { get; set; }
    }

    public class AddPhotoDto
    {
        public string PhotoUrl { get; set; } = string.Empty;
        public string? Caption { get; set; }
    }
}
