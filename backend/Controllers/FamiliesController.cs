using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using FamilyTreeAPI.Data;
using FamilyTreeAPI.Models;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Text;

namespace FamilyTreeAPI.Controllers
{
    [ApiController]
    [Route("api/families")] // ⭐ Route en minuscules pour correspondre au frontend
    [Authorize]
    public class FamiliesController : ControllerBase
    {
        private readonly FamilyTreeContext _context;
        private readonly IConfiguration _configuration;

        public FamiliesController(FamilyTreeContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        // 🌳 POST: api/families/create
        // Créer une nouvelle famille
        [HttpPost("create")]
        public async Task<ActionResult> CreateFamily([FromBody] CreateFamilyRequest request)
        {
            // Récupérer l'utilisateur connecté
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized(new { message = "Utilisateur non authentifié" });
            }

            var user = await _context.Connexions.FindAsync(userId);
            if (user == null)
            {
                return NotFound(new { message = "Utilisateur introuvable" });
            }

            // Vérifier que l'utilisateur n'a pas déjà une famille
            if (user.FamilyID != null && user.FamilyID > 0)
            {
                return BadRequest(new { message = "Vous appartenez déjà à une famille" });
            }

            // Créer la nouvelle famille
            var family = new Family
            {
                FamilyName = request.FamilyName.Trim(),
                CreatedDate = DateTime.UtcNow
            };

            _context.Families.Add(family);
            await _context.SaveChangesAsync();

            // Attacher l'utilisateur à la famille (en tant que fondateur/admin)
            user.FamilyID = family.FamilyID;
            user.Role = "Admin"; // Le créateur devient admin
            await _context.SaveChangesAsync();

            // 🔑 BUGFIX: Régénérer le token avec le FamilyID mis à jour
            var newToken = GenerateJwtToken(user);
            Console.WriteLine($"🔑 Nouveau token généré avec FamilyID: {user.FamilyID}");

            return Ok(new
            {
                Token = newToken, // ⭐ Retourner le nouveau token
                FamilyID = family.FamilyID,
                FamilyName = family.FamilyName,
                Message = $"Famille '{family.FamilyName}' créée avec succès"
            });
        }

        // 💌 POST: api/families/join
        // Rejoindre une famille via un code d'invitation
        [HttpPost("join")]
        public async Task<ActionResult> JoinFamily([FromBody] JoinFamilyRequest request)
        {
            // Récupérer l'utilisateur connecté
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized(new { message = "Utilisateur non authentifié" });
            }

            var user = await _context.Connexions.FindAsync(userId);
            if (user == null)
            {
                return NotFound(new { message = "Utilisateur introuvable" });
            }

            // Vérifier que l'utilisateur n'a pas déjà une famille
            if (user.FamilyID != null && user.FamilyID > 0)
            {
                return BadRequest(new { message = "Vous appartenez déjà à une famille" });
            }

            // 🔍 Rechercher la famille par code d'invitation (ex: "KAM-6644", "FAM-4528", etc.)
            string invitationCode = request.InvitationCode.Trim().ToUpper();
            
            Console.WriteLine($"🔍 Recherche famille avec code: {invitationCode}");
            
            var family = await _context.Families
                .FirstOrDefaultAsync(f => f.InviteCode == invitationCode);
            
            if (family == null)
            {
                Console.WriteLine($"❌ Aucune famille trouvée avec le code: {invitationCode}");
                return NotFound(new { message = "Code d'invitation invalide" });
            }
            
            Console.WriteLine($"✅ Famille trouvée: {family.FamilyName} (ID: {family.FamilyID})");

            // Attacher l'utilisateur à la famille
            user.FamilyID = family.FamilyID;
            user.Role = "Member"; // Les nouveaux membres ont le rôle "Member"
            await _context.SaveChangesAsync();

            // 🔑 BUGFIX: Régénérer le token avec le FamilyID mis à jour
            var newToken = GenerateJwtToken(user);
            Console.WriteLine($"🔑 Nouveau token généré avec FamilyID: {user.FamilyID}");

            return Ok(new
            {
                Token = newToken, // ⭐ Retourner le nouveau token
                FamilyID = family.FamilyID,
                FamilyName = family.FamilyName,
                Message = $"Vous avez rejoint la famille '{family.FamilyName}'"
            });
        }
        
        // 🔑 Générer un JWT token
        private string GenerateJwtToken(Connexion user)
        {
            var key = new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(
                System.Text.Encoding.UTF8.GetBytes(_configuration["Jwt:Key"] ?? "VotreClefSecreteTresLongueEtComplexe123456789")
            );
            var creds = new Microsoft.IdentityModel.Tokens.SigningCredentials(
                key, 
                Microsoft.IdentityModel.Tokens.SecurityAlgorithms.HmacSha256
            );

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.ConnexionID.ToString()),
                new Claim(ClaimTypes.Name, user.UserName ?? string.Empty),
                new Claim("familyId", user.FamilyID?.ToString() ?? "0"),
                new Claim("personId", user.IDPerson?.ToString() ?? "0")
            };

            var token = new System.IdentityModel.Tokens.Jwt.JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"] ?? "FamilyTreeAPI",
                audience: _configuration["Jwt:Audience"] ?? "FamilyTreeClient",
                claims: claims,
                expires: DateTime.Now.AddDays(30),
                signingCredentials: creds
            );

            return new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler().WriteToken(token);
        }
    }

    // DTO Request Models
    public class CreateFamilyRequest
    {
        public string FamilyName { get; set; } = string.Empty;
    }

    public class JoinFamilyRequest
    {
        public string InvitationCode { get; set; } = string.Empty;
    }
}
