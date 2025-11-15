using FamilyTreeAPI.Data;
using FamilyTreeAPI.Models;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace FamilyTreeAPI.Services
{
    /// <summary>
    /// Service pour gérer le ciblage et le filtrage des participants aux sondages
    /// </summary>
    public class PollAudienceService
    {
        private readonly FamilyTreeContext _context;
        private readonly ILogger<PollAudienceService> _logger;

        public PollAudienceService(FamilyTreeContext context, ILogger<PollAudienceService> logger)
        {
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Vérifie si un utilisateur fait partie de l'audience ciblée d'un sondage
        /// </summary>
        public async Task<bool> CanUserAccessPoll(int userId, Poll poll)
        {
            try
            {
                // Si visibilité = 'all', tout le monde dans la famille peut accéder
                if (poll.VisibilityType == "all")
                {
                    return true;
                }

                // Récupérer la personne associée à l'utilisateur
                var user = await _context.Connexions
                    .Include(c => c.Person)
                    .FirstOrDefaultAsync(c => c.ConnexionID == userId);

                if (user?.Person == null)
                {
                    _logger.LogWarning($"User {userId} has no associated Person");
                    return false;
                }

                var person = user.Person;

                // Parser le JSON target_audience
                if (string.IsNullOrEmpty(poll.TargetAudience))
                {
                    _logger.LogWarning($"Poll {poll.PollID} has visibility_type '{poll.VisibilityType}' but no target_audience");
                    return false;
                }

                var targetAudience = JsonSerializer.Deserialize<PollTargetAudienceDto>(poll.TargetAudience);
                if (targetAudience == null)
                {
                    return false;
                }

                // Vérifier selon le type de ciblage
                switch (poll.VisibilityType)
                {
                    case "lineage":
                        return await CheckLineageAccess(person, targetAudience);

                    case "generation":
                        return await CheckGenerationAccess(person, targetAudience);

                    case "manual":
                        return await CheckManualAccess(person.PersonID, poll.PollID, targetAudience);

                    default:
                        return false;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error checking poll access for user {userId} and poll {poll.PollID}");
                return false;
            }
        }

        /// <summary>
        /// Vérifie l'accès par lignée (paternelle ou maternelle)
        /// </summary>
        private async Task<bool> CheckLineageAccess(Person person, PollTargetAudienceDto targetAudience)
        {
            if (targetAudience.FamilyIds == null || !targetAudience.FamilyIds.Any())
            {
                return false;
            }

            // Vérifier si la personne appartient à une des familles ciblées
            if (targetAudience.LineageType == "paternal")
            {
                return person.PaternalFamilyID.HasValue && 
                       targetAudience.FamilyIds.Contains(person.PaternalFamilyID.Value);
            }
            else if (targetAudience.LineageType == "maternal")
            {
                return person.MaternalFamilyID.HasValue && 
                       targetAudience.FamilyIds.Contains(person.MaternalFamilyID.Value);
            }

            return false;
        }

        /// <summary>
        /// Vérifie l'accès par génération (descendants d'ancêtres spécifiques)
        /// </summary>
        private async Task<bool> CheckGenerationAccess(Person person, PollTargetAudienceDto targetAudience)
        {
            if (targetAudience.AncestorIds == null || !targetAudience.AncestorIds.Any())
            {
                return false;
            }

            // Vérifier si la personne est un descendant direct des ancêtres ciblés
            foreach (var ancestorId in targetAudience.AncestorIds)
            {
                if (await IsDescendantOf(person.PersonID, ancestorId, targetAudience.GenerationLevel))
                {
                    return true;
                }
            }

            return false;
        }

        /// <summary>
        /// Vérifie l'accès manuel (liste explicite de personnes)
        /// </summary>
        private async Task<bool> CheckManualAccess(int personId, int pollId, PollTargetAudienceDto targetAudience)
        {
            // Vérifier dans la table poll_participants
            var hasAccess = await _context.PollParticipants
                .AnyAsync(pp => pp.PollId == pollId && pp.PersonId == personId);

            if (hasAccess)
            {
                return true;
            }

            // Vérifier aussi dans le JSON si présent
            if (targetAudience.PersonIds != null && targetAudience.PersonIds.Contains(personId))
            {
                return true;
            }

            return false;
        }

        /// <summary>
        /// Vérifie si une personne est descendante d'un ancêtre à un certain niveau
        /// </summary>
        private async Task<bool> IsDescendantOf(int personId, int ancestorId, int? maxGenerations)
        {
            if (personId == ancestorId)
            {
                return true;
            }

            var person = await _context.Persons.FindAsync(personId);
            if (person == null)
            {
                return false;
            }

            int currentGeneration = 1;
            var queue = new Queue<(int? ParentId, int Generation)>();
            queue.Enqueue((person.FatherID, currentGeneration));
            queue.Enqueue((person.MotherID, currentGeneration));

            while (queue.Count > 0)
            {
                var (parentId, generation) = queue.Dequeue();

                if (!parentId.HasValue)
                {
                    continue;
                }

                if (parentId.Value == ancestorId)
                {
                    return true;
                }

                // Si maxGenerations défini, ne pas dépasser
                if (maxGenerations.HasValue && generation >= maxGenerations.Value)
                {
                    continue;
                }

                var parent = await _context.Persons.FindAsync(parentId.Value);
                if (parent != null)
                {
                    queue.Enqueue((parent.FatherID, generation + 1));
                    queue.Enqueue((parent.MotherID, generation + 1));
                }
            }

            return false;
        }

        /// <summary>
        /// Génère une description lisible de l'audience ciblée
        /// </summary>
        public async Task<string> GetAudienceDescription(Poll poll)
        {
            if (poll.VisibilityType == "all")
            {
                return "Tous les membres de la famille";
            }

            if (string.IsNullOrEmpty(poll.TargetAudience))
            {
                return "Audience non définie";
            }

            try
            {
                var targetAudience = JsonSerializer.Deserialize<PollTargetAudienceDto>(poll.TargetAudience);
                if (targetAudience == null)
                {
                    return "Audience non définie";
                }

                switch (poll.VisibilityType)
                {
                    case "lineage":
                        if (targetAudience.FamilyIds != null && targetAudience.FamilyIds.Any())
                        {
                            var families = await _context.Families
                                .Where(f => targetAudience.FamilyIds.Contains(f.FamilyID))
                                .Select(f => f.FamilyName)
                                .ToListAsync();
                            
                            var lineageType = targetAudience.LineageType == "paternal" ? "paternelle" : "maternelle";
                            return $"Lignée {lineageType}: {string.Join(", ", families)}";
                        }
                        return "Lignée spécifique";

                    case "generation":
                        if (targetAudience.AncestorIds != null && targetAudience.AncestorIds.Any())
                        {
                            var ancestors = await _context.Persons
                                .Where(p => targetAudience.AncestorIds.Contains(p.PersonID))
                                .Select(p => p.FirstName + " " + p.LastName)
                                .ToListAsync();
                            
                            var genLevel = targetAudience.GenerationLevel.HasValue 
                                ? $" (génération {targetAudience.GenerationLevel})" 
                                : "";
                            return $"Descendants de: {string.Join(", ", ancestors)}{genLevel}";
                        }
                        return "Génération spécifique";

                    case "manual":
                        var count = await _context.PollParticipants
                            .Where(pp => pp.PollId == poll.PollID)
                            .CountAsync();
                        return $"{count} membre(s) sélectionné(s)";

                    default:
                        return "Audience personnalisée";
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error generating audience description for poll {poll.PollID}");
                return "Erreur de lecture de l'audience";
            }
        }

        /// <summary>
        /// Récupère toutes les familles disponibles pour le ciblage par lignée
        /// </summary>
        public async Task<List<Family>> GetAvailableFamilies(int userFamilyId)
        {
            return await _context.Families
                .Where(f => f.FamilyID == userFamilyId)
                .ToListAsync();
        }

        /// <summary>
        /// Récupère tous les membres de la famille pour le ciblage manuel
        /// </summary>
        public async Task<List<Person>> GetFamilyMembers(int familyId)
        {
            return await _context.Persons
                .Where(p => p.FamilyID == familyId)
                .OrderBy(p => p.LastName)
                .ThenBy(p => p.FirstName)
                .ToListAsync();
        }
    }
}
