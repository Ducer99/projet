using FamilyTreeAPI.Data;
using FamilyTreeAPI.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.AspNetCore.RateLimiting;
using System.Threading.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Ignorer les cycles de référence pour éviter les erreurs JSON
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.WriteIndented = true;
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Rate limiting — 10 tentatives / minute sur les routes d'authentification
builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter("auth", limiterOptions =>
    {
        limiterOptions.PermitLimit = 10;
        limiterOptions.Window = TimeSpan.FromMinutes(1);
        limiterOptions.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        limiterOptions.QueueLimit = 0;
    });
    // Renvoyer 429 Too Many Requests
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.OnRejected = async (context, cancellationToken) =>
    {
        context.HttpContext.Response.ContentType = "application/json";
        await context.HttpContext.Response.WriteAsync(
            "{\"message\":\"Trop de tentatives. Réessayez dans 1 minute.\"}",
            cancellationToken
        );
    };
});

// Register EmailService
builder.Services.AddScoped<IEmailService, EmailService>();

// Register PollAudienceService
builder.Services.AddScoped<PollAudienceService>();

// Database configuration
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<FamilyTreeContext>(options =>
    options.UseNpgsql(connectionString));

// JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"];
if (string.IsNullOrEmpty(jwtKey))
    throw new InvalidOperationException("JWT Key is not configured. Set Jwt:Key in appsettings or via env var Jwt__Key.");
var key = Encoding.ASCII.GetBytes(jwtKey);

builder.Services.AddAuthentication(x =>
{
    x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(x =>
{
    x.RequireHttpsMetadata = false;
    x.SaveToken = true;
    x.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = false,
        ValidateAudience = false
    };
    // Lire le JWT depuis le cookie httpOnly en priorité
    x.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            // 1. Cookie httpOnly (priorité)
            var cookieToken = context.Request.Cookies["jwt"];
            if (!string.IsNullOrEmpty(cookieToken))
            {
                context.Token = cookieToken;
            }
            // 2. Fallback : Authorization: Bearer <token> (dev / mobile)
            return Task.CompletedTask;
        }
    };
});

// CORS configuration - Support localhost + production (Vercel)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy =>
        {
            var allowedOrigins = new List<string>
            {
                "http://localhost:3000",
                "http://127.0.0.1:3000",
                "http://localhost:3001",
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "https://dapper-beignet-f164d8.netlify.app"
            };

            // Add extra production URL from environment variable
            var frontendUrl = builder.Configuration["FRONTEND_URL"];
            if (!string.IsNullOrEmpty(frontendUrl))
            {
                allowedOrigins.Add(frontendUrl);
            }

            policy.WithOrigins(allowedOrigins.ToArray())
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// HTTPS géré par Render (SSL termination au proxy) — ne pas activer UseHttpsRedirection
// pour éviter les redirections infinies derrière un reverse proxy.

// Servir les fichiers statiques (uploads + React build)
app.UseStaticFiles();

// Activer le routing par défaut pour les fichiers dans wwwroot
app.UseDefaultFiles();

// ✅ CORS doit être AVANT Authentication/Authorization
app.UseCors("AllowReactApp");
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// 🚀 IMPORTANT : Fallback pour React Router (SPA)
// Toutes les routes non-API renvoient vers index.html
app.MapFallbackToFile("index.html");

app.Run();

// Expose Program pour WebApplicationFactory dans les tests d'intégration
public partial class Program { }
