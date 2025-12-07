using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using FamilyTreeAPI.Data;
using FamilyTreeAPI.Models;
using FamilyTreeAPI.Services;
using BCrypt.Net;
using Google.Apis.Auth; // ⭐ Google OAuth validation

namespace FamilyTreeAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly FamilyTreeContext _context;
        private readonly IConfiguration _configuration;
        private readonly IEmailService _emailService;

        public AuthController(FamilyTreeContext context, IConfiguration configuration, IEmailService emailService)
        {
            _context = context;
            _configuration = configuration;
            _emailService = emailService;
        }

        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<ActionResult> Login([FromBody] LoginRequest request)
        {
            // Trouver l'utilisateur par email (actif ou non)
            var user = await _context.Connexions
                .Include(c => c.Person)
                .FirstOrDefaultAsync(c => c.Email == request.Email);

            // Vérifier si l'utilisateur existe
            if (user == null)
            {
                return Unauthorized(new { message = "Email ou mot de passe incorrect" });
            }

            // Vérifier le mot de passe
            if (!BCrypt.Net.BCrypt.Verify(request.Password, user.Password))
            {
                return Unauthorized(new { message = "Email ou mot de passe incorrect" });
            }

            // Vérifier si le compte est actif
            if (!user.IsActive)
            {
                return StatusCode(403, new { message = "Votre compte n'est pas encore activé. Veuillez compléter votre inscription." });
            }

            // Vérifier si la personne peut se connecter (pas décédée)
            if (user.Person != null && !user.Person.CanLogin)
            {
                return StatusCode(403, new { message = "Ce compte est désactivé. Les profils commémoratifs ne peuvent pas se connecter." });
            }

            // Update last login date
            user.LastLoginDate = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            var token = GenerateJwtToken(user);
            
            // Charger la famille de l'utilisateur séparément
            Family? userFamily = null;
            if (user.FamilyID > 0)
            {
                userFamily = await _context.Families.FindAsync(user.FamilyID);
            }

            // 🚀 Smart Redirect Flow: Vérifier si l'utilisateur a besoin d'un "Family Onboarding"
            bool needsFamilyOnboarding = user.FamilyID == null || user.FamilyID == 0;

            return Ok(new
            {
                Token = token,
                NeedsFamilyOnboarding = needsFamilyOnboarding, // ⭐ Nouveau flag
                User = new
                {
                    user.ConnexionID,
                    user.UserName,
                    user.Level,
                    user.IDPerson,
                    FamilyID = user.FamilyID,
                    user.Role,
                    PersonName = user.Person != null ? $"{user.Person.FirstName} {user.Person.LastName}" : user.UserName,
                    FamilyName = userFamily?.FamilyName
                }
            });
        }

        // 🔐 Google OAuth Login/Register
        [AllowAnonymous]
        [HttpPost("google")]
        public async Task<ActionResult> GoogleLogin([FromBody] GoogleLoginRequest request)
        {
            try
            {
                // 1. Valider le token Google auprès de Google (SÉCURITÉ CRITIQUE !)
                var payload = await GoogleJsonWebSignature.ValidateAsync(request.Token);

                // 2. Le token est valide ! Extraire les infos utilisateur
                var email = payload.Email;
                var firstName = payload.GivenName ?? "";
                var lastName = payload.FamilyName ?? "";
                var photoUrl = payload.Picture;
                var googleUserId = payload.Subject; // ID Google unique

                // 3. Vérifier si l'utilisateur existe déjà
                var existingUser = await _context.Connexions
                    .Include(c => c.Person)
                    .FirstOrDefaultAsync(c => c.Email == email);

                Connexion user;

                if (existingUser != null)
                {
                    // Utilisateur existant -> Login
                    user = existingUser;

                    // Vérifier que le compte est actif
                    if (!user.IsActive)
                    {
                        return StatusCode(403, new { message = "Votre compte n'est pas actif." });
                    }

                    // Update last login
                    user.LastLoginDate = DateTime.UtcNow;
                    await _context.SaveChangesAsync();
                }
                else
                {
                    // Nouvel utilisateur -> Auto-Register
                    var username = $"{firstName} {lastName}".Trim();
                    if (string.IsNullOrEmpty(username))
                    {
                        username = email.Split('@')[0];
                    }

                    user = new Connexion
                    {
                        Email = email,
                        UserName = username,
                        Password = BCrypt.Net.BCrypt.HashPassword(Guid.NewGuid().ToString()), // Password aléatoire (jamais utilisé)
                        IsActive = true, // ⭐ Google users sont activés automatiquement
                        EmailVerified = true, // ⭐ Email vérifié par Google
                        ProfileCompleted = false,
                        Role = "Member",
                        Level = 1,
                        FamilyID = null, // ⭐ Sans Domicile Familial (SDF)
                        CreatedDate = DateTime.UtcNow,
                        LastLoginDate = DateTime.UtcNow
                    };

                    _context.Connexions.Add(user);
                    await _context.SaveChangesAsync();
                }

                // 4. Générer notre propre JWT token pour l'application
                var token = GenerateJwtToken(user);

                // 5. Charger la famille si elle existe
                Family? userFamily = null;
                if (user.FamilyID > 0)
                {
                    userFamily = await _context.Families.FindAsync(user.FamilyID);
                }

                // 6. Smart Redirect Flow
                bool needsFamilyOnboarding = user.FamilyID == null || user.FamilyID == 0;

                return Ok(new
                {
                    Token = token,
                    NeedsFamilyOnboarding = needsFamilyOnboarding,
                    User = new
                    {
                        user.ConnexionID,
                        user.UserName,
                        user.Level,
                        user.IDPerson,
                        FamilyID = user.FamilyID,
                        user.Role,
                        PersonName = user.Person != null ? $"{user.Person.FirstName} {user.Person.LastName}" : user.UserName,
                        FamilyName = userFamily?.FamilyName,
                        PhotoUrl = photoUrl // Info additionnelle de Google
                    }
                });
            }
            catch (InvalidJwtException)
            {
                return BadRequest(new { message = "Token Google invalide" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Erreur serveur : {ex.Message}" });
            }
        }

        // 🆕 Inscription simplifiée : Email + Mot de passe uniquement
        [AllowAnonymous]
        [HttpPost("register-simple")]
        public async Task<ActionResult> RegisterSimple([FromBody] SimpleRegisterRequest request)
        {
            try
            {
                Console.WriteLine($"📥 [register-simple] Request received: Email={request.Email}, UserName={request.UserName}");

                // Check if email already exists
                if (await _context.Connexions.AnyAsync(c => c.Email == request.Email))
                {
                    Console.WriteLine($"⚠️ [register-simple] Email already exists: {request.Email}");
                    return BadRequest(new { message = "Cette adresse email existe déjà" });
                }

                var hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.Password);

                // 🆕 Pour Google OAuth simulation : activer immédiatement si demandé
                bool isGoogleSimulation = request.UserName?.StartsWith("Google User") == true;

                // Créer un compte temporaire sans Person ni Family
                var connexion = new Connexion
                {
                    UserName = request.UserName ?? request.Email.Split('@')[0], // Username temporaire basé sur l'email
                    Password = hashedPassword,
                    Level = 1,
                    IDPerson = null, // NULL jusqu'à la complétion du profil
                    FamilyID = null, // NULL jusqu'au rattachement familial
                    Email = request.Email,
                    CreatedDate = DateTime.UtcNow,
                    IsActive = true, // ⭐ FIXME: Activé immédiatement pour éviter les 403 (TODO: email verification)
                    EmailVerified = isGoogleSimulation ? true : false, // ⭐ Email vérifié si Google
                    ProfileCompleted = false,
                    Role = "Member"
                };

                Console.WriteLine($"💾 [register-simple] Saving connexion to database...");
                _context.Connexions.Add(connexion);
                await _context.SaveChangesAsync();
                Console.WriteLine($"✅ [register-simple] Connexion saved with ID: {connexion.ConnexionID}");

                // Générer le token pour la session (avec un objet Connexion temporaire)
                var tempConnexion = new Connexion
                {
                    ConnexionID = connexion.ConnexionID,
                    UserName = connexion.UserName,
                    Level = connexion.Level,
                    IDPerson = 0,
                    FamilyID = 0
                };
                var token = GenerateJwtToken(tempConnexion);
                Console.WriteLine($"🔑 [register-simple] Token generated successfully");

                return Ok(new
                {
                    Token = token,
                    User = new
                    {
                        connexion.ConnexionID,
                        connexion.Email,
                        ProfileCompleted = false,
                        Message = "Compte créé avec succès. Veuillez compléter votre profil."
                    }
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ [register-simple] ERROR: {ex.Message}");
                Console.WriteLine($"   Stack trace: {ex.StackTrace}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"   Inner exception: {ex.InnerException.Message}");
                }
                return StatusCode(500, new { message = $"Erreur serveur : {ex.Message}" });
            }
        }

        // 🆕 Vérification de l'email avec le code reçu
        [HttpPost("verify-email")]
        public async Task<ActionResult> VerifyEmail([FromBody] VerifyEmailRequest request)
        {
            var connexion = await _context.Connexions
                .FirstOrDefaultAsync(c => c.Email == request.Email);

            if (connexion == null)
            {
                return NotFound(new { message = "Compte non trouvé" });
            }

            // Vérifier si déjà vérifié
            if (connexion.EmailVerified)
            {
                return BadRequest(new { message = "Email déjà vérifié" });
            }

            // Vérifier le code
            if (connexion.EmailVerificationCode != request.Code)
            {
                return BadRequest(new { message = "Code de vérification invalide" });
            }

            // Vérifier l'expiration
            if (connexion.EmailVerificationExpiry == null || connexion.EmailVerificationExpiry < DateTime.UtcNow)
            {
                return BadRequest(new { message = "Code de vérification expiré. Veuillez demander un nouveau code." });
            }

            // Marquer l'email comme vérifié
            connexion.EmailVerified = true;
            connexion.EmailVerificationCode = null;
            connexion.EmailVerificationExpiry = null;

            await _context.SaveChangesAsync();

            // Générer un token JWT pour permettre la connexion
            var token = GenerateJwtToken(connexion);

            return Ok(new
            {
                Token = token,
                User = new
                {
                    connexion.ConnexionID,
                    connexion.Email,
                    connexion.UserName,
                    EmailVerified = true,
                    ProfileCompleted = connexion.ProfileCompleted
                },
                Message = "✅ Email vérifié avec succès ! Vous pouvez maintenant compléter votre profil."
            });
        }

        // 🆕 Renvoyer le code de vérification
        [HttpPost("resend-verification-code")]
        public async Task<ActionResult> ResendVerificationCode([FromBody] ResendCodeRequest request)
        {
            var connexion = await _context.Connexions
                .FirstOrDefaultAsync(c => c.Email == request.Email);

            if (connexion == null)
            {
                return NotFound(new { message = "Compte non trouvé" });
            }

            // Vérifier si déjà vérifié
            if (connexion.EmailVerified)
            {
                return BadRequest(new { message = "Email déjà vérifié" });
            }

            // Limiter à 1 envoi par minute
            if (connexion.EmailVerificationSentAt.HasValue && 
                connexion.EmailVerificationSentAt.Value.AddMinutes(1) > DateTime.UtcNow)
            {
                var secondsRemaining = (int)(connexion.EmailVerificationSentAt.Value.AddMinutes(1) - DateTime.UtcNow).TotalSeconds;
                return BadRequest(new 
                { 
                    message = $"Veuillez attendre {secondsRemaining} secondes avant de renvoyer le code",
                    secondsRemaining 
                });
            }

            // Générer un nouveau code
            var random = new Random();
            var newCode = random.Next(100000, 999999).ToString();

            connexion.EmailVerificationCode = newCode;
            connexion.EmailVerificationExpiry = DateTime.UtcNow.AddMinutes(30);
            connexion.EmailVerificationSentAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            // Envoyer l'email
            try
            {
                await _emailService.SendEmailVerificationCodeAsync(
                    request.Email,
                    connexion.UserName,
                    newCode
                );

                return Ok(new
                {
                    Message = "📧 Un nouveau code de vérification a été envoyé",
                    Email = request.Email
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new 
                { 
                    message = "Erreur lors de l'envoi de l'email", 
                    error = ex.Message 
                });
            }
        }

        // 🆕 Complétion du profil après inscription simplifiée
        [HttpPost("complete-profile")]
        [Authorize]
        public async Task<ActionResult> CompleteProfile([FromBody] CompleteProfileRequest request)
        {
            Console.WriteLine("========== 🔵 COMPLETE-PROFILE DEBUG START ==========");
            Console.WriteLine($"📥 Request received:");
            Console.WriteLine($"   FirstName: '{request.FirstName}' (length: {request.FirstName?.Length ?? 0})");
            Console.WriteLine($"   LastName: '{request.LastName}' (length: {request.LastName?.Length ?? 0})");
            Console.WriteLine($"   Sex: '{request.Sex}' (length: {request.Sex?.Length ?? 0})");
            Console.WriteLine($"   BirthDate: {request.BirthDate}");
            Console.WriteLine($"   BirthCity: '{request.BirthCity}' (length: {request.BirthCity?.Length ?? 0})");
            Console.WriteLine($"   BirthCountry: '{request.BirthCountry}' (length: {request.BirthCountry?.Length ?? 0})");
            Console.WriteLine($"   Activity: '{request.Activity}' (length: {request.Activity?.Length ?? 0})");
            
            var userId = int.Parse(User.FindFirst("id")?.Value ?? "0");
            Console.WriteLine($"👤 User ID from token: {userId}");
            
            var connexion = await _context.Connexions.FindAsync(userId);

            if (connexion == null)
            {
                Console.WriteLine("❌ ERROR: Connexion not found for userId: " + userId);
                return NotFound("Utilisateur non trouvé");
            }

            Console.WriteLine($"✅ Connexion found: ID={connexion.ConnexionID}, Email={connexion.Email}");

            if (connexion.ProfileCompleted)
            {
                Console.WriteLine("❌ ERROR: Profile already completed");
                return BadRequest("Profil déjà complété");
            }

            // Vérifier si la ville existe, sinon la créer
            var city = await _context.Cities
                .FirstOrDefaultAsync(c => c.Name == request.BirthCity && c.CountryName == request.BirthCountry);

            if (city == null)
            {
                city = new City
                {
                    Name = request.BirthCity,
                    CountryName = request.BirthCountry
                };
                _context.Cities.Add(city);
                await _context.SaveChangesAsync();
            }

            // 🆕 Traiter les parents (placeholder automatique)
            Person? father = null;
            Person? mother = null;
            
            // Traiter le père
            if (!string.IsNullOrEmpty(request.FatherFirstName) && !string.IsNullOrEmpty(request.FatherLastName))
            {
                father = await FindOrCreateParentPlaceholder(
                    request.FatherFirstName,
                    request.FatherLastName,
                    "M",
                    city.CityID,
                    userId
                );
            }
            
            // Traiter la mère
            if (!string.IsNullOrEmpty(request.MotherFirstName) && !string.IsNullOrEmpty(request.MotherLastName))
            {
                mother = await FindOrCreateParentPlaceholder(
                    request.MotherFirstName,
                    request.MotherLastName,
                    "F",
                    city.CityID,
                    userId
                );
            }

            // Créer la personne
            Console.WriteLine("📝 Creating Person object...");
            
            // 🔧 WORKAROUND: Tronquer tous les champs texte pour éviter l'erreur VARCHAR(2000)
            var safeActivity = request.Activity;
            if (!string.IsNullOrEmpty(safeActivity) && safeActivity.Length > 1000) 
                safeActivity = safeActivity.Substring(0, 1000);
            
            var safeEmail = connexion.Email;
            if (!string.IsNullOrEmpty(safeEmail) && safeEmail.Length > 1000) 
                safeEmail = safeEmail.Substring(0, 1000);
            
            Console.WriteLine($"🔍 Sex value before Person creation: '{request.Sex}'");
            Console.WriteLine($"   Is null or empty? {string.IsNullOrEmpty(request.Sex)}");
            Console.WriteLine($"   Is 'M'? {request.Sex == "M"}");
            Console.WriteLine($"   Is 'F'? {request.Sex == "F"}");
            
            var person = new Person
            {
                FirstName = request.FirstName,
                LastName = request.LastName,
                Sex = request.Sex,  // ✅ Changé de request.Gender à request.Sex
                Birthday = request.BirthDate.HasValue ? DateTime.SpecifyKind(request.BirthDate.Value, DateTimeKind.Utc) : null,
                CityID = city.CityID,
                Email = safeEmail,
                Alive = true,
                FamilyID = null, // NULL jusqu'au rattachement familial
                Activity = safeActivity,
                // 🔧 WORKAROUND TEMPORAIRE: Ignorer PhotoUrl si trop grande
                PhotoUrl = string.IsNullOrEmpty(request.PhotoUrl) || request.PhotoUrl.Length > 1000 ? null : request.PhotoUrl,
                FatherID = father?.PersonID,
                MotherID = mother?.PersonID,
                Status = "confirmed",
                CanLogin = true,
                CreatedBy = userId,
                ParentLinkConfirmed = father != null || mother != null // Confirmé si au moins un parent
            };

            _context.Persons.Add(person);
            
            // 🐛 DEBUG: Log all field lengths before saving
            Console.WriteLine($"========== DEBUG: CompleteProfile Person Object ==========");
            Console.WriteLine($"FirstName length: {person.FirstName?.Length ?? 0}");
            Console.WriteLine($"LastName length: {person.LastName?.Length ?? 0}");
            Console.WriteLine($"Email length: {person.Email?.Length ?? 0}");
            Console.WriteLine($"Activity length: {person.Activity?.Length ?? 0}");
            Console.WriteLine($"PhotoUrl length: {person.PhotoUrl?.Length ?? 0}");
            Console.WriteLine($"PendingFatherName length: {person.PendingFatherName?.Length ?? 0}");
            Console.WriteLine($"PendingMotherName length: {person.PendingMotherName?.Length ?? 0}");
            Console.WriteLine($"Status length: {person.Status?.Length ?? 0}");
            Console.WriteLine($"Notes length: {person.Notes?.Length ?? 0}");
            
            // Check if father/mother were created
            if (father != null)
            {
                Console.WriteLine($"Father FirstName length: {father.FirstName?.Length ?? 0}");
                Console.WriteLine($"Father LastName length: {father.LastName?.Length ?? 0}");
                Console.WriteLine($"Father Email length: {father.Email?.Length ?? 0}");
                Console.WriteLine($"Father Activity length: {father.Activity?.Length ?? 0}");
                Console.WriteLine($"Father Status length: {father.Status?.Length ?? 0}");
            }
            
            if (mother != null)
            {
                Console.WriteLine($"Mother FirstName length: {mother.FirstName?.Length ?? 0}");
                Console.WriteLine($"Mother LastName length: {mother.LastName?.Length ?? 0}");
                Console.WriteLine($"Mother Email length: {mother.Email?.Length ?? 0}");
                Console.WriteLine($"Mother Activity length: {mother.Activity?.Length ?? 0}");
                Console.WriteLine($"Mother Status length: {mother.Status?.Length ?? 0}");
            }
            Console.WriteLine($"=====================================================");
            
            try 
            {
                Console.WriteLine("💾 Attempting to save Person to database...");
                await _context.SaveChangesAsync();
                Console.WriteLine("✅ Person saved successfully! PersonID: " + person.PersonID);
            }
            catch (Exception ex)
            {
                Console.WriteLine("❌ ERROR saving Person to database:");
                Console.WriteLine($"   Exception Type: {ex.GetType().Name}");
                Console.WriteLine($"   Message: {ex.Message}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"   Inner Exception: {ex.InnerException.Message}");
                }
                Console.WriteLine($"   Stack Trace: {ex.StackTrace}");
                Console.WriteLine("========== 🔴 COMPLETE-PROFILE DEBUG END (ERROR) ==========");
                throw;
            }
            
            // 🔍 Vérifier si cette personne correspond à un parent en attente
            await CheckAndLinkPendingChildren(person);

            // Mettre à jour la connexion
            connexion.IDPerson = person.PersonID;
            connexion.ProfileCompleted = true;
            connexion.UserName = $"{person.FirstName?.ToLower() ?? "user"}.{person.LastName?.ToLower() ?? "name"}";
            
            // Rendre le compte actif si ≥ 18 ans
            var age = DateTime.Today.Year - (person.Birthday?.Year ?? DateTime.Today.Year);
            if (age >= 18)
            {
                connexion.IsActive = true;
            }

            Console.WriteLine("💾 Saving Connexion updates...");
            await _context.SaveChangesAsync();
            Console.WriteLine("✅ Connexion updated successfully!");

            // Générer un nouveau token avec les infos complètes (FamilyID reste NULL)
            Console.WriteLine("🔑 Generating new JWT token...");
            var token = GenerateJwtToken(connexion);
            Console.WriteLine("✅ Token generated!");
            
            Console.WriteLine("========== ✅ COMPLETE-PROFILE DEBUG END (SUCCESS) ==========");

            return Ok(new
            {
                Token = token,
                User = new
                {
                    connexion.ConnexionID,
                    connexion.UserName,
                    connexion.Email,
                    PersonID = person.PersonID,
                    PersonName = $"{person.FirstName} {person.LastName}",
                    ProfileCompleted = true,
                    IsActive = connexion.IsActive,
                    Message = age < 18 
                        ? "Profil complété. En attente de validation parentale." 
                        : "Profil complété avec succès !"
                }
            });
        }

        [HttpPost("attach-family")]
        [Authorize]
        public async Task<ActionResult> AttachFamily([FromBody] AttachFamilyRequest request)
        {
            var userId = int.Parse(User.FindFirst("id")?.Value ?? "0");
            var connexion = await _context.Connexions
                .Include(c => c.Person)
                .FirstOrDefaultAsync(c => c.ConnexionID == userId);

            if (connexion == null || connexion.Person == null)
            {
                return Unauthorized(new { message = "Utilisateur ou profil non trouvé" });
            }

            // Vérifier si déjà attaché à une famille (FamilyID != NULL et != 0)
            if (connexion.FamilyID.HasValue && connexion.FamilyID.Value > 0)
            {
                return BadRequest(new { message = "Vous êtes déjà attaché à une famille" });
            }

            if (request.Action == "create")
            {
                // Create new family
                var inviteCode = GenerateInviteCode();
                
                var family = new Family
                {
                    FamilyName = request.FamilyName ?? "Nouvelle Famille",
                    CreatedDate = DateTime.UtcNow,
                    InviteCode = inviteCode,
                    CreatedBy = connexion.Person.PersonID
                };

                _context.Families.Add(family);
                await _context.SaveChangesAsync();

                // Update connexion and person
                connexion.FamilyID = family.FamilyID;
                connexion.Role = "Admin";
                connexion.Person.FamilyID = family.FamilyID;

                await _context.SaveChangesAsync();

                var token = GenerateJwtToken(connexion);

                return Ok(new
                {
                    Token = token,
                    FamilyID = family.FamilyID,
                    FamilyName = family.FamilyName,
                    Role = "Admin",
                    InviteCode = inviteCode,
                    Message = "Famille créée avec succès !"
                });
            }
            else if (request.Action == "join")
            {
                // Find family by invite code
                var family = await _context.Families
                    .FirstOrDefaultAsync(f => f.InviteCode == request.InviteCode);

                if (family == null)
                {
                    return BadRequest(new { message = "Code d'invitation invalide" });
                }

                // Update connexion and person
                connexion.FamilyID = family.FamilyID;
                connexion.Role = "Member";
                connexion.Person.FamilyID = family.FamilyID;

                await _context.SaveChangesAsync();

                var token = GenerateJwtToken(connexion);

                return Ok(new
                {
                    Token = token,
                    FamilyID = family.FamilyID,
                    FamilyName = family.FamilyName,
                    Role = "Member",
                    Message = $"Vous avez rejoint la famille {family.FamilyName}"
                });
            }

            return BadRequest(new { message = "Action invalide" });
        }

        [HttpPost("register")]
        public async Task<ActionResult> Register([FromBody] RegisterRequest request)
        {
            // Check if email already exists
            if (await _context.Connexions.AnyAsync(c => c.Email == request.Email))
            {
                return BadRequest("Cette adresse email existe déjà");
            }

            // Verify person exists
            var person = await _context.Persons
                .Include(p => p.Family)
                .FirstOrDefaultAsync(p => p.PersonID == request.IDPerson);
                
            if (person == null)
            {
                return BadRequest("Personne non trouvée");
            }

            // Check if person already has a connection
            if (await _context.Connexions.AnyAsync(c => c.IDPerson == request.IDPerson))
            {
                return BadRequest("Cette personne a déjà un compte utilisateur");
            }

            var hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.Password);

            // Generate username from person's name
            var userName = $"{person.FirstName.ToLower()}.{person.LastName.ToLower()}";
            var baseUserName = userName;
            var counter = 1;
            
            // Ensure username is unique
            while (await _context.Connexions.AnyAsync(c => c.UserName == userName))
            {
                userName = $"{baseUserName}{counter}";
                counter++;
            }

            var connexion = new Connexion
            {
                UserName = userName,
                Password = hashedPassword,
                Level = 1, // Default user level
                IDPerson = request.IDPerson,
                FamilyID = person.FamilyID,
                Email = request.Email,
                CreatedDate = DateTime.UtcNow,
                IsActive = true
            };

            _context.Connexions.Add(connexion);
            await _context.SaveChangesAsync();

            // Send welcome email
            try
            {
                await _emailService.SendWelcomeEmailAsync(
                    request.Email,
                    userName,
                    person.Family?.FamilyName ?? "Votre famille"
                );
            }
            catch (Exception ex)
            {
                // Log but don't fail registration if email fails
                Console.WriteLine($"Erreur envoi email: {ex.Message}");
            }

            return Ok("Compte créé avec succès");
        }

        [HttpPost("forgot-password")]
        public async Task<ActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
        {
            var connexion = await _context.Connexions
                .Include(c => c.Person)
                    .ThenInclude(p => p.Father)
                .Include(c => c.Person)
                    .ThenInclude(p => p.Mother)
                .Include(c => c.Person)
                    .ThenInclude(p => p.City)
                .FirstOrDefaultAsync(c => c.Email == request.Email && c.IsActive);

            if (connexion == null)
            {
                return BadRequest("Email non trouvé");
            }

            // Generate a 6-digit verification code
            var random = new Random();
            var verificationCode = random.Next(100000, 999999).ToString();

            // Store the code with expiration (5 minutes)
            connexion.PasswordResetCode = verificationCode;
            connexion.PasswordResetExpiry = DateTime.UtcNow.AddMinutes(5);
            await _context.SaveChangesAsync();

            // Return security questions based on genealogical data
            var securityQuestions = new List<object>();

            if (connexion.Person.Father != null)
            {
                securityQuestions.Add(new
                {
                    Question = "Quel est le prénom de votre père ?",
                    Answer = connexion.Person.Father.FirstName,
                    Type = "father"
                });
            }

            if (connexion.Person.Mother != null)
            {
                securityQuestions.Add(new
                {
                    Question = "Quel est le prénom de votre mère ?",
                    Answer = connexion.Person.Mother.FirstName,
                    Type = "mother"
                });
            }

            if (connexion.Person.Birthday.HasValue)
            {
                securityQuestions.Add(new
                {
                    Question = "En quelle année êtes-vous né(e) ?",
                    Answer = connexion.Person.Birthday.Value.Year.ToString(),
                    Type = "birthyear"
                });
            }

            if (connexion.Person.City != null)
            {
                securityQuestions.Add(new
                {
                    Question = "Dans quelle ville êtes-vous né(e) ?",
                    Answer = connexion.Person.City.Name,
                    Type = "city"
                });
            }

            // Send verification code by email
            try
            {
                await _emailService.SendPasswordResetCodeAsync(request.Email, verificationCode);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erreur envoi email: {ex.Message}");
            }

            return Ok(new
            {
                Message = "Code de vérification généré et envoyé par email",
                VerificationCode = verificationCode, // In development mode, we show it. In production, remove this.
                SecurityQuestions = securityQuestions.Select(q => new
                {
                    Question = ((dynamic)q).Question,
                    Type = ((dynamic)q).Type
                })
            });
        }

        [HttpPost("verify-security-answer")]
        public async Task<ActionResult> VerifySecurityAnswer([FromBody] VerifySecurityRequest request)
        {
            var connexion = await _context.Connexions
                .Include(c => c.Person)
                    .ThenInclude(p => p.Father)
                .Include(c => c.Person)
                    .ThenInclude(p => p.Mother)
                .Include(c => c.Person)
                    .ThenInclude(p => p.City)
                .FirstOrDefaultAsync(c => c.Email == request.Email && c.IsActive);

            if (connexion == null)
            {
                return BadRequest("Email non trouvé");
            }

            bool isCorrect = false;
            string correctAnswer = "";

            switch (request.QuestionType)
            {
                case "father":
                    correctAnswer = connexion.Person.Father?.FirstName ?? "";
                    break;
                case "mother":
                    correctAnswer = connexion.Person.Mother?.FirstName ?? "";
                    break;
                case "birthyear":
                    correctAnswer = connexion.Person.Birthday?.Year.ToString() ?? "";
                    break;
                case "city":
                    correctAnswer = connexion.Person.City?.Name ?? "";
                    break;
            }

            isCorrect = correctAnswer.Equals(request.Answer, StringComparison.OrdinalIgnoreCase);

            if (!isCorrect)
            {
                return BadRequest("Réponse incorrecte");
            }

            return Ok(new { Message = "Réponse correcte" });
        }

        [HttpPost("reset-password")]
        public async Task<ActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            var connexion = await _context.Connexions
                .FirstOrDefaultAsync(c => c.Email == request.Email && c.IsActive);

            if (connexion == null)
            {
                return BadRequest("Email non trouvé");
            }

            // Verify the code
            if (connexion.PasswordResetCode != request.VerificationCode)
            {
                return BadRequest("Code de vérification incorrect");
            }

            if (connexion.PasswordResetExpiry < DateTime.UtcNow)
            {
                return BadRequest("Le code de vérification a expiré");
            }

            // Update password
            connexion.Password = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            connexion.PasswordResetCode = null;
            connexion.PasswordResetExpiry = null;
            await _context.SaveChangesAsync();

            return Ok("Mot de passe réinitialisé avec succès");
        }

        [HttpPost("switch-family")]
        [Authorize]
        public async Task<ActionResult> SwitchFamily([FromBody] SwitchFamilyRequest request)
        {
            var userId = int.Parse(User.FindFirst("id")?.Value ?? "0");
            
            var user = await _context.Connexions
                .Include(c => c.Person)
                .FirstOrDefaultAsync(c => c.ConnexionID == userId);
                
            if (user == null)
            {
                return NotFound("Utilisateur non trouvé");
            }
            
            // Vérifier que la famille demandée est accessible
            if (request.FamilyID != user.Person.PaternalFamilyID && 
                request.FamilyID != user.Person.MaternalFamilyID)
            {
                return Forbid(); // Tentative d'accéder à une famille non autorisée
            }
            
            // Changer la famille active
            user.FamilyID = request.FamilyID;
            await _context.SaveChangesAsync();
            
            // Générer un nouveau token avec la nouvelle familyId
            var token = GenerateJwtToken(user);
            
            var activeFamily = await _context.Families.FindAsync(request.FamilyID);
            
            return Ok(new
            {
                Token = token,
                Message = $"Famille changée vers : {activeFamily?.FamilyName}",
                FamilyID = request.FamilyID,
                FamilyName = activeFamily?.FamilyName
            });
        }
        
        [HttpGet("available-families")]
        [Authorize]
        public async Task<ActionResult> GetAvailableFamilies()
        {
            var userId = int.Parse(User.FindFirst("id")?.Value ?? "0");
            
            var user = await _context.Connexions
                .Include(c => c.Person)
                .FirstOrDefaultAsync(c => c.ConnexionID == userId);
                
            if (user == null)
            {
                return NotFound();
            }
            
            var families = new List<object>();
            
            if (user.Person.PaternalFamilyID.HasValue)
            {
                var paternalFamily = await _context.Families.FindAsync(user.Person.PaternalFamilyID.Value);
                if (paternalFamily != null)
                {
                    families.Add(new
                    {
                        FamilyID = paternalFamily.FamilyID,
                        Name = paternalFamily.FamilyName,
                        Type = "Paternelle",
                        IsActive = user.FamilyID == user.Person.PaternalFamilyID
                    });
                }
            }
            
            if (user.Person.MaternalFamilyID.HasValue)
            {
                var maternalFamily = await _context.Families.FindAsync(user.Person.MaternalFamilyID.Value);
                if (maternalFamily != null)
                {
                    families.Add(new
                    {
                        FamilyID = maternalFamily.FamilyID,
                        Name = maternalFamily.FamilyName,
                        Type = "Maternelle",
                        IsActive = user.FamilyID == user.Person.MaternalFamilyID
                    });
                }
            }
            
            return Ok(new
            {
                Families = families,
                FamilyID = user.FamilyID,
                HasMultipleFamilies = families.Count > 1
            });
        }
        
        // 🔄 Régénérer le code d'invitation (Admin uniquement)
        [HttpPost("regenerate-invite-code")]
        [Authorize]
        public async Task<ActionResult> RegenerateInviteCode()
        {
            var userId = int.Parse(User.FindFirst("id")?.Value ?? "0");
            
            var user = await _context.Connexions
                .FirstOrDefaultAsync(c => c.ConnexionID == userId);
                
            if (user == null)
            {
                return NotFound();
            }
            
            // Vérifier que l'utilisateur est Admin
            if (user.Role != "Admin")
            {
                return Forbid(); // Seul l'admin peut régénérer le code
            }
            
            // Récupérer la famille de l'utilisateur
            if (!user.FamilyID.HasValue)
            {
                return BadRequest(new { message = "Vous n'êtes rattaché à aucune famille" });
            }
            
            var family = await _context.Families.FindAsync(user.FamilyID.Value);
            if (family == null)
            {
                return NotFound(new { message = "Famille introuvable" });
            }
            
            // Générer un nouveau code
            var newCode = GenerateInviteCode(family.FamilyName);
            family.InviteCode = newCode;
            
            await _context.SaveChangesAsync();
            
            return Ok(new
            {
                Message = "Code d'invitation régénéré avec succès",
                NewInviteCode = newCode
            });
        }
        
        // 📋 Obtenir les infos de la famille (y compris le code si Admin)
        [HttpGet("family-info")]
        [Authorize]
        public async Task<ActionResult> GetFamilyInfo()
        {
            var userId = int.Parse(User.FindFirst("id")?.Value ?? "0");
            
            var user = await _context.Connexions
                .Include(c => c.Person)
                .FirstOrDefaultAsync(c => c.ConnexionID == userId);
                
            if (user == null)
            {
                return NotFound();
            }
            
            // Si l'utilisateur n'a pas encore de famille, retourner null
            if (user.FamilyID == null || user.FamilyID == 0)
            {
                return Ok(new
                {
                    FamilyID = 0,
                    FamilyName = "Aucune famille",
                    Description = "",
                    CreatedDate = DateTime.UtcNow,
                    UserRole = user.Role,
                    InviteCode = (string?)null,
                    CanRegenerateCode = false
                });
            }
            
            // Charger la famille séparément car on a .Ignore(c => c.Family)
            var family = await _context.Families
                .FirstOrDefaultAsync(f => f.FamilyID == user.FamilyID);
            
            if (family == null)
            {
                return Ok(new
                {
                    FamilyID = 0,
                    FamilyName = "Aucune famille",
                    Description = "",
                    CreatedDate = DateTime.UtcNow,
                    UserRole = user.Role,
                    InviteCode = (string?)null,
                    CanRegenerateCode = false
                });
            }
            
            var response = new
            {
                FamilyID = family.FamilyID,
                FamilyName = family.FamilyName,
                Description = family.Description,
                CreatedDate = family.CreatedDate,
                UserRole = user.Role,
                InviteCode = user.Role == "Admin" ? family.InviteCode : null, // Code visible seulement pour l'admin
                CanRegenerateCode = user.Role == "Admin"
            };
            
            return Ok(response);
        }
        
        // � Obtenir les statistiques de la famille
        [HttpGet("family-stats")]
        [Authorize]
        public async Task<ActionResult> GetFamilyStats()
        {
            var userId = int.Parse(User.FindFirst("id")?.Value ?? "0");
            
            var user = await _context.Connexions
                .FirstOrDefaultAsync(c => c.ConnexionID == userId);
                
            if (user == null || user.FamilyID == null || user.FamilyID == 0)
            {
                // Retourner des stats à 0 si l'utilisateur n'a pas encore de famille
                return Ok(new
                {
                    MembersCount = 0,
                    GenerationsCount = 0,
                    PhotosCount = 0,
                    EventsCount = 0,
                    MarriagesCount = 0
                });
            }
            
            var familyId = user.FamilyID.Value;
            
            // Nombre de membres
            var membersCount = await _context.Persons
                .Where(p => p.FamilyID == familyId)
                .CountAsync();
            
            // Nombre de générations (calcul basé sur la profondeur de l'arbre)
            var allPersons = await _context.Persons
                .Where(p => p.FamilyID == familyId)
                .Select(p => new PersonNode { PersonID = p.PersonID, FatherID = p.FatherID, MotherID = p.MotherID })
                .ToListAsync();
            
            int generationsCount = CalculateGenerations(allPersons);
            
            // Nombre de photos
            var photosCount = await _context.Photos
                .Where(p => p.Album!.FamilyID == familyId)
                .CountAsync();
            
            // Nombre d'événements
            var eventsCount = await _context.Events
                .Where(e => e.FamilyID == familyId)
                .CountAsync();
            
            // Nombre de mariages
            var marriagesCount = await _context.Weddings
                .Where(w => w.PatrilinealFamilyID == familyId || 
                           _context.Persons.Any(p => p.FamilyID == familyId && (p.PersonID == w.ManID || p.PersonID == w.WomanID)))
                .CountAsync();
            
            return Ok(new
            {
                MembersCount = membersCount,
                GenerationsCount = generationsCount,
                PhotosCount = photosCount,
                EventsCount = eventsCount,
                MarriagesCount = marriagesCount
            });
        }
        
        // Classe helper pour le calcul des générations
        private class PersonNode
        {
            public int PersonID { get; set; }
            public int? FatherID { get; set; }
            public int? MotherID { get; set; }
        }
        
        // Calculer le nombre de générations
        private int CalculateGenerations(List<PersonNode> persons)
        {
            if (persons.Count == 0) return 0;
            
            // Trouver les personnes racines (sans parents)
            var roots = persons.Where(p => p.FatherID == null && p.MotherID == null).ToList();
            if (roots.Count == 0) return 1; // Au moins une génération
            
            int maxDepth = 0;
            foreach (var root in roots)
            {
                int depth = GetMaxDepth(root.PersonID, persons, 1);
                maxDepth = Math.Max(maxDepth, depth);
            }
            
            return maxDepth;
        }
        
        private int GetMaxDepth(int personId, List<PersonNode> persons, int currentDepth)
        {
            var children = persons.Where(p => p.FatherID == personId || p.MotherID == personId).ToList();
            if (children.Count == 0) return currentDepth;
            
            int maxChildDepth = currentDepth;
            foreach (var child in children)
            {
                int childDepth = GetMaxDepth(child.PersonID, persons, currentDepth + 1);
                maxChildDepth = Math.Max(maxChildDepth, childDepth);
            }
            
            return maxChildDepth;
        }
        
        // �🔧 Fonction utilitaire pour générer un code d'invitation
        private string GenerateInviteCode(string familyName)
        {
            // Prendre les 3 premières lettres en majuscule
            var prefix = familyName.Length >= 3 
                ? familyName.Substring(0, 3).ToUpper() 
                : familyName.ToUpper().PadRight(3, 'X');
            
            // Générer 4 chiffres aléatoires
            var random = new Random();
            var number = random.Next(0, 10000).ToString("D4");
            
            var code = $"{prefix}-{number}";
            
            // Vérifier l'unicité (rare collision mais prudent)
            var maxAttempts = 100;
            var attempts = 0;
            
            while (_context.Families.Any(f => f.InviteCode == code) && attempts < maxAttempts)
            {
                number = random.Next(0, 10000).ToString("D4");
                code = $"{prefix}-{number}";
                attempts++;
            }
            
            return code;
        }
        
        // 🔍 Fonction de recherche ou création de parent
        private async Task<Person?> FindOrCreateParent(
            string fullName,
            DateTime? birthDate,
            DateTime? deathDate,
            string status,
            string sex,
            int familyId,
            int createdBy)
        {
            if (string.IsNullOrWhiteSpace(fullName)) return null;
            
            var normalizedName = fullName.Trim().ToLower();
            var nameParts = normalizedName.Split(new[] { ' ' }, 2, StringSplitOptions.RemoveEmptyEntries);
            
            if (nameParts.Length < 2) return null;
            
            var firstName = nameParts[0];
            var lastName = nameParts[1];
            
            // 🔍 Chercher correspondance existante (nom + sexe + famille + date naissance optionnelle)
            var existing = await _context.Persons
                .Where(p =>
                    p.FirstName.ToLower().Trim() == firstName &&
                    p.LastName.ToLower().Trim() == lastName &&
                    p.Sex == sex &&
                    (familyId == 0 || p.FamilyID == familyId || p.FamilyID == null) &&
                    (birthDate == null || p.Birthday == null || p.Birthday == birthDate)
                )
                .FirstOrDefaultAsync();
            
            if (existing != null)
            {
                // Mise à jour si c'était un placeholder et devient deceased
                if (existing.Status == "placeholder" && status == "deceased")
                {
                    existing.Status = "deceased";
                    existing.Alive = false;
                    existing.DeathDate = deathDate.HasValue ? DateTime.SpecifyKind(deathDate.Value, DateTimeKind.Utc) : null;
                    existing.CanLogin = false;
                    await _context.SaveChangesAsync();
                }
                return existing;
            }
            
            // 🆕 Créer nouveau parent
            // 🔧 WORKAROUND: Tronquer les noms trop longs pour éviter l'erreur VARCHAR
            var safeFirstName = CapitalizeFirstLetter(firstName);
            if (safeFirstName.Length > 1000) safeFirstName = safeFirstName.Substring(0, 1000);
            
            var safeLastName = CapitalizeFirstLetter(lastName);
            if (safeLastName.Length > 1000) safeLastName = safeLastName.Substring(0, 1000);
            
            var newParent = new Person
            {
                FirstName = safeFirstName,
                LastName = safeLastName,
                Sex = sex,
                Birthday = birthDate.HasValue ? DateTime.SpecifyKind(birthDate.Value, DateTimeKind.Utc) : null,
                DeathDate = deathDate.HasValue ? DateTime.SpecifyKind(deathDate.Value, DateTimeKind.Utc) : null,
                Alive = status != "deceased",
                Status = status == "deceased" ? "deceased" : "placeholder",
                CanLogin = status != "deceased",
                FamilyID = familyId > 0 ? familyId : null,
                CityID = 1, // Default city
                CreatedBy = createdBy,
                ParentLinkConfirmed = false
            };
            
            _context.Persons.Add(newParent);
            await _context.SaveChangesAsync();
            
            return newParent;
        }
        
        // 🔗 Vérifier et lier les enfants en attente
        private async Task CheckAndLinkPendingChildren(Person newPerson)
        {
            if (newPerson.FamilyID == null) return;
            
            var fullName = $"{newPerson.FirstName} {newPerson.LastName}".Trim().ToLower();
            
            // 🔍 Chercher les enfants qui ont déclaré cette personne comme père
            if (newPerson.Sex == "M")
            {
                var pendingChildren = await _context.Persons
                    .Where(p =>
                        p.PendingFatherName != null &&
                        p.PendingFatherName.ToLower().Trim() == fullName &&
                        (p.FamilyID == newPerson.FamilyID || p.FamilyID == null)
                    )
                    .ToListAsync();
                
                foreach (var child in pendingChildren)
                {
                    child.FatherID = newPerson.PersonID;
                    child.PendingFatherName = null; // Nettoyer
                    child.ParentLinkConfirmed = true;
                }
            }
            
            // 🔍 Chercher les enfants qui ont déclaré cette personne comme mère
            if (newPerson.Sex == "F")
            {
                var pendingChildren = await _context.Persons
                    .Where(p =>
                        p.PendingMotherName != null &&
                        p.PendingMotherName.ToLower().Trim() == fullName &&
                        (p.FamilyID == newPerson.FamilyID || p.FamilyID == null)
                    )
                    .ToListAsync();
                
                foreach (var child in pendingChildren)
                {
                    child.MotherID = newPerson.PersonID;
                    child.PendingMotherName = null; // Nettoyer
                    child.ParentLinkConfirmed = true;
                }
            }
            
            await _context.SaveChangesAsync();
        }
        
        // 📝 Utilitaire pour capitaliser première lettre
        private string CapitalizeFirstLetter(string text)
        {
            if (string.IsNullOrEmpty(text)) return text;
            return char.ToUpper(text[0]) + text.Substring(1).ToLower();
        }

        // 🆕 Méthode pour trouver ou créer un parent "placeholder"
        private async Task<Person?> FindOrCreateParentPlaceholder(
            string firstName, 
            string lastName, 
            string sex, 
            int cityId,
            int createdBy)
        {
            // 1. Vérifier si un utilisateur actif existe déjà avec ce nom
            var existingPerson = await _context.Persons
                .FirstOrDefaultAsync(p => 
                    p.FirstName.ToLower() == firstName.ToLower() && 
                    p.LastName.ToLower() == lastName.ToLower() &&
                    p.Sex == sex &&
                    p.Status == "confirmed");
            
            if (existingPerson != null)
            {
                Console.WriteLine($"✅ Parent trouvé (actif): {firstName} {lastName}");
                return existingPerson;
            }
            
            // 2. Vérifier si un placeholder existe déjà
            var existingPlaceholder = await _context.Persons
                .FirstOrDefaultAsync(p => 
                    p.FirstName.ToLower() == firstName.ToLower() && 
                    p.LastName.ToLower() == lastName.ToLower() &&
                    p.Sex == sex &&
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
                CityID = cityId,
                Status = "placeholder", // Statut spécial
                Alive = true,
                CanLogin = false, // Ne peut pas se connecter tant que non réclamé
                CreatedBy = createdBy,
                ParentLinkConfirmed = false
            };
            
            _context.Persons.Add(placeholder);
            await _context.SaveChangesAsync();
            
            Console.WriteLine($"🆕 Nouveau placeholder créé: {firstName} {lastName} (ID: {placeholder.PersonID})");
            return placeholder;
        }

        // 🆕 ENDPOINT ATOMIQUE : Créer Famille + Inscription Complète
        [AllowAnonymous]
        [HttpPost("create-family")]
        public async Task<ActionResult> CreateFamily([FromBody] RegisterAndCreateFamilyRequest request)
        {
            // Validation email unique
            if (await _context.Connexions.AnyAsync(c => c.Email == request.Email))
            {
                return BadRequest(new { message = "Cette adresse email est déjà utilisée" });
            }

            // Validation nom famille
            if (string.IsNullOrWhiteSpace(request.FamilyName))
            {
                return BadRequest(new { message = "Le nom de la famille est requis" });
            }

            using var transaction = await _context.Database.BeginTransactionAsync();
            
            try
            {
                // 1. CRÉER CONNEXION
                var connexion = new Connexion
                {
                    Email = request.Email.ToLower().Trim(),
                    Password = BCrypt.Net.BCrypt.HashPassword(request.Password),
                    UserName = $"{request.FirstName} {request.LastName}",
                    Role = "Admin", // ⭐ Fondateur = Admin
                    Level = 1,
                    IsActive = true,
                    EmailVerified = false,
                    ProfileCompleted = true,
                    CreatedDate = DateTime.UtcNow,
                    LastLoginDate = DateTime.UtcNow
                };
                _context.Connexions.Add(connexion);
                await _context.SaveChangesAsync();

                // 2. CRÉER FAMILLE
                var family = new Family
                {
                    FamilyName = request.FamilyName.Trim(),
                    InviteCode = GenerateInviteCode(),
                    CreatedDate = DateTime.UtcNow
                };
                _context.Families.Add(family);
                await _context.SaveChangesAsync();

                // 3. CRÉER CITY (si villes fournies)
                int? birthCityId = null;
                if (!string.IsNullOrWhiteSpace(request.BirthCity))
                {
                    var birthCity = await _context.Cities
                        .FirstOrDefaultAsync(c => c.Name == request.BirthCity);
                    
                    if (birthCity == null)
                    {
                        birthCity = new City 
                        { 
                            Name = request.BirthCity,
                            CountryName = request.BirthCountry ?? "Unknown"
                        };
                        _context.Cities.Add(birthCity);
                        await _context.SaveChangesAsync();
                    }
                    birthCityId = birthCity.CityID;
                }
                else
                {
                    // Ville par défaut si non fournie
                    var defaultCity = await _context.Cities.FirstOrDefaultAsync();
                    birthCityId = defaultCity?.CityID ?? 1;
                }

                // 4. CRÉER PERSON
                var person = new Person
                {
                    FirstName = request.FirstName.Trim(),
                    LastName = request.LastName.Trim(),
                    Sex = request.Sex,
                    Birthday = request.BirthDate,
                    Activity = request.Activity?.Trim(),
                    Email = request.Email.ToLower().Trim(),
                    FamilyID = family.FamilyID,
                    CityID = birthCityId ?? 1,
                    Alive = true,
                    Notes = $"Résidence: {request.ResidenceCity}, {request.ResidenceCountry}\nTéléphone: {request.Phone}"
                };
                _context.Persons.Add(person);
                await _context.SaveChangesAsync();

                // 5. LIER CONNEXION → PERSON → FAMILY
                connexion.IDPerson = person.PersonID;
                connexion.FamilyID = family.FamilyID;
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();

                // 6. GÉNÉRER TOKEN FINAL
                var token = GenerateJwtToken(connexion);

                Console.WriteLine($"✅ Nouvelle famille créée: {family.FamilyName} (Code: {family.InviteCode})");
                Console.WriteLine($"✅ Admin: {person.FirstName} {person.LastName} (PersonID: {person.PersonID})");

                return Ok(new
                {
                    token,
                    user = new
                    {
                        id = connexion.ConnexionID,
                        email = connexion.Email,
                        personId = person.PersonID,
                        familyId = family.FamilyID,
                        familyName = family.FamilyName,
                        inviteCode = family.InviteCode,
                        role = "Admin"
                    }
                });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                Console.WriteLine($"❌ Erreur création famille: {ex.Message}");
                return StatusCode(500, new { message = "Erreur lors de la création de la famille", error = ex.Message });
            }
        }

        // 🆕 ENDPOINT ATOMIQUE : Rejoindre Famille + Inscription Complète
        [AllowAnonymous]
        [HttpPost("join-family")]
        public async Task<ActionResult> JoinFamily([FromBody] RegisterAndJoinFamilyRequest request)
        {
            // Validation email unique
            if (await _context.Connexions.AnyAsync(c => c.Email == request.Email))
            {
                return BadRequest(new { message = "Cette adresse email est déjà utilisée" });
            }

            // Validation code invitation
            var family = await _context.Families
                .FirstOrDefaultAsync(f => f.InviteCode == request.InviteCode.ToUpper().Trim());
            
            if (family == null)
            {
                return BadRequest(new { message = "Code d'invitation invalide" });
            }

            using var transaction = await _context.Database.BeginTransactionAsync();
            
            try
            {
                // 1. CRÉER CONNEXION
                var connexion = new Connexion
                {
                    Email = request.Email.ToLower().Trim(),
                    Password = BCrypt.Net.BCrypt.HashPassword(request.Password),
                    UserName = $"{request.FirstName} {request.LastName}",
                    Role = "Member", // ⭐ Membre (pas admin)
                    Level = 1,
                    IsActive = true,
                    EmailVerified = false,
                    ProfileCompleted = true,
                    CreatedDate = DateTime.UtcNow,
                    LastLoginDate = DateTime.UtcNow
                };
                _context.Connexions.Add(connexion);
                await _context.SaveChangesAsync();

                // 2. CRÉER CITY (si villes fournies)
                int? birthCityId = null;
                if (!string.IsNullOrWhiteSpace(request.BirthCity))
                {
                    var birthCity = await _context.Cities
                        .FirstOrDefaultAsync(c => c.Name == request.BirthCity);
                    
                    if (birthCity == null)
                    {
                        birthCity = new City 
                        { 
                            Name = request.BirthCity,
                            CountryName = request.BirthCountry ?? "Unknown"
                        };
                        _context.Cities.Add(birthCity);
                        await _context.SaveChangesAsync();
                    }
                    birthCityId = birthCity.CityID;
                }
                else
                {
                    // Ville par défaut
                    var defaultCity = await _context.Cities.FirstOrDefaultAsync();
                    birthCityId = defaultCity?.CityID ?? 1;
                }

                // 3. CRÉER PERSON
                var person = new Person
                {
                    FirstName = request.FirstName.Trim(),
                    LastName = request.LastName.Trim(),
                    Sex = request.Sex,
                    Birthday = request.BirthDate,
                    Activity = request.Activity?.Trim(),
                    Email = request.Email.ToLower().Trim(),
                    FamilyID = family.FamilyID,
                    CityID = birthCityId ?? 1,
                    Alive = true,
                    Notes = $"Résidence: {request.ResidenceCity}, {request.ResidenceCountry}\nTéléphone: {request.Phone}"
                };
                _context.Persons.Add(person);
                await _context.SaveChangesAsync();

                // 4. LIER CONNEXION → PERSON → FAMILY
                connexion.IDPerson = person.PersonID;
                connexion.FamilyID = family.FamilyID;
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();

                // 5. GÉNÉRER TOKEN FINAL
                var token = GenerateJwtToken(connexion);

                Console.WriteLine($"✅ Nouveau membre rejoint: {family.FamilyName}");
                Console.WriteLine($"✅ Membre: {person.FirstName} {person.LastName} (PersonID: {person.PersonID})");

                return Ok(new
                {
                    token,
                    user = new
                    {
                        id = connexion.ConnexionID,
                        email = connexion.Email,
                        personId = person.PersonID,
                        familyId = family.FamilyID,
                        familyName = family.FamilyName,
                        role = "Member"
                    }
                });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                Console.WriteLine($"❌ Erreur rejoindre famille: {ex.Message}");
                return StatusCode(500, new { message = "Erreur lors de l'inscription à la famille", error = ex.Message });
            }
        }

        private string GenerateJwtToken(Connexion user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var jwtKey = _configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key is not configured");
            var key = Encoding.ASCII.GetBytes(jwtKey);
            
            var claims = new List<Claim>
            {
                new Claim("id", user.ConnexionID.ToString()),
                new Claim(ClaimTypes.NameIdentifier, user.ConnexionID.ToString()), // ✅ Claim standard pour l'ID utilisateur
                new Claim("username", user.UserName),
                new Claim("level", user.Level.ToString()),
                new Claim("role", user.Role) // Ajouter le rôle dans le JWT
            };
            
            // Ajouter personId seulement s'il existe
            if (user.IDPerson.HasValue && user.IDPerson.Value > 0)
            {
                claims.Add(new Claim("personId", user.IDPerson.Value.ToString()));
            }
            
            // Ajouter familyId seulement s'il existe
            if (user.FamilyID.HasValue && user.FamilyID.Value > 0)
            {
                claims.Add(new Claim("familyId", user.FamilyID.Value.ToString()));
            }
            
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddDays(7),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        private string GenerateInviteCode()
        {
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            var random = new Random();
            return new string(Enumerable.Repeat(chars, 9)
                .Select(s => s[random.Next(s.Length)]).ToArray());
        }
    }

    public class SwitchFamilyRequest
    {
        public int FamilyID { get; set; }
    }

    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    // 🆕 Requête d'inscription simplifiée
    public class SimpleRegisterRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string? UserName { get; set; } // ⭐ Optionnel : pour Google OAuth simulation
    }

    // 🔐 Requête Google OAuth
    public class GoogleLoginRequest
    {
        public string Token { get; set; } = string.Empty; // ID Token JWT de Google
    }

    // 🆕 Requête de complétion de profil
    public class CompleteProfileRequest
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Sex { get; set; } = string.Empty; // "M" ou "F" (changé de Gender à Sex pour correspondre au frontend)
        public DateTime? BirthDate { get; set; }
        public string BirthCountry { get; set; } = string.Empty;
        public string BirthCity { get; set; } = string.Empty;
        public string? Activity { get; set; }
        public string? PhotoUrl { get; set; }
        public string? Phone { get; set; }
        
        // 🆕 Système de liaison automatique des parents
        public string? FatherFirstName { get; set; }
        public string? FatherLastName { get; set; }
        public string? MotherFirstName { get; set; }
        public string? MotherLastName { get; set; }
    }

    public class AttachFamilyRequest
    {
        public string Action { get; set; } = string.Empty; // "create" ou "join"
        public string? FamilyName { get; set; }
        public string? InviteCode { get; set; }
    }

    public class RegisterRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public int IDPerson { get; set; }
    }

    public class ForgotPasswordRequest
    {
        public string Email { get; set; } = string.Empty;
    }

    public class VerifySecurityRequest
    {
        public string Email { get; set; } = string.Empty;
        public string QuestionType { get; set; } = string.Empty;
        public string Answer { get; set; } = string.Empty;
    }

    public class ResetPasswordRequest
    {
        public string Email { get; set; } = string.Empty;
        public string VerificationCode { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }

    // 🆕 Requête de vérification d'email
    public class VerifyEmailRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
    }

    // 🆕 Requête de renvoi du code
    public class ResendCodeRequest
    {
        public string Email { get; set; } = string.Empty;
    }
    
    public class RegisterAndCreateFamilyRequest
    {
        // Authentification
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        
        // Identité
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Sex { get; set; } = "M";
        public DateTime? BirthDate { get; set; }
        
        // Lieux
        public string? BirthCountry { get; set; }
        public string? BirthCity { get; set; }
        public string? ResidenceCountry { get; set; }
        public string? ResidenceCity { get; set; }
        
        // Contact & Profession
        public string? Activity { get; set; }
        public string? Phone { get; set; }
        
        // Famille
        public string FamilyName { get; set; } = string.Empty;
    }
    
    public class RegisterAndJoinFamilyRequest
    {
        // Authentification
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        
        // Identité
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Sex { get; set; } = "M";
        public DateTime? BirthDate { get; set; }
        
        // Lieux
        public string? BirthCountry { get; set; }
        public string? BirthCity { get; set; }
        public string? ResidenceCountry { get; set; }
        public string? ResidenceCity { get; set; }
        
        // Contact & Profession
        public string? Activity { get; set; }
        public string? Phone { get; set; }
        
        // Famille
        public string InviteCode { get; set; } = string.Empty;
    }
}
