#!/usr/bin/env python3
"""
Script pour appliquer le fix upload photo au backend
"""

import re

# Lire le fichier original
with open('/Users/ducer/Desktop/projet/backend/Controllers/PersonsController.cs.original', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Modifier le constructor pour ajouter IWebHostEnvironment
content = content.replace(
    """    public class PersonsController : ControllerBase
    {
        private readonly FamilyTreeContext _context;

        public PersonsController(FamilyTreeContext context)
        {
            _context = context;
        }""",
    """    public class PersonsController : ControllerBase
    {
        private readonly FamilyTreeContext _context;
        private readonly IWebHostEnvironment _env;

        public PersonsController(FamilyTreeContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }"""
)

# 2. Modifier la signature de PutPerson
content = content.replace(
    "public async Task<IActionResult> PutPerson(int id, UpdatePersonDto personUpdate)",
    "public async Task<IActionResult> PutPerson(int id, [FromForm] UpdatePersonDto personUpdate, [FromForm] IFormFile? photo)"
)

# 3. Ajouter le traitement de la photo après les vérifications de permissions
photo_handling_code = """
            // 📸 Traiter l'upload de photo si présent
            if (photo != null && photo.Length > 0)
            {
                Console.WriteLine($"📸 Photo reçue: {photo.FileName} ({photo.Length} bytes)");
                
                // Validation du type de fichier
                if (!photo.ContentType.StartsWith("image/"))
                {
                    Console.WriteLine($"❌ Type de fichier non autorisé: {photo.ContentType}");
                    return BadRequest(new { message = "Type de fichier non autorisé. Seules les images sont acceptées." });
                }
                
                // Validation de la taille (max 5 MB)
                if (photo.Length > 5 * 1024 * 1024)
                {
                    Console.WriteLine($"❌ Fichier trop volumineux: {photo.Length} bytes");
                    return BadRequest(new { message = "Fichier trop volumineux. Taille maximale : 5 MB." });
                }
                
                try
                {
                    // Générer un nom de fichier unique
                    var fileName = $"{id}_{Guid.NewGuid()}{Path.GetExtension(photo.FileName)}";
                    
                    // Créer le dossier uploads/photos s'il n'existe pas
                    var uploadsFolder = Path.Combine(_env.WebRootPath ?? "wwwroot", "uploads", "photos");
                    Directory.CreateDirectory(uploadsFolder);
                    
                    // Chemin complet du fichier
                    var filePath = Path.Combine(uploadsFolder, fileName);
                    
                    // Sauvegarder le fichier
                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await photo.CopyToAsync(stream);
                    }
                    
                    // Mettre à jour l'URL de la photo
                    personUpdate.PhotoUrl = $"/uploads/photos/{fileName}";
                    
                    Console.WriteLine($"✅ Photo sauvegardée: {filePath}");
                    Console.WriteLine($"✅ PhotoUrl mise à jour: {personUpdate.PhotoUrl}");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"❌ Erreur lors de la sauvegarde de la photo: {ex.Message}");
                    return StatusCode(500, new { message = $"Erreur lors de la sauvegarde de la photo: {ex.Message}" });
                }
            }
"""

# Trouver et remplacer juste après le bloc de vérification des permissions
content = content.replace(
    """            if (!isAdmin && !isCreator && !isOwnProfile && !isChildOfParent)
            {
                Console.WriteLine($"❌ ACCÈS REFUSÉ pour Person {id}");
                return StatusCode(403, new { message = "Vous ne pouvez modifier que votre propre profil, les membres que vous avez créés, ou vos parents (profils temporaires/décédés)" });
            }

            // 👨‍👩‍👦 Gérer les parents (placeholder ou existants)""",
    """            if (!isAdmin && !isCreator && !isOwnProfile && !isChildOfParent)
            {
                Console.WriteLine($"❌ ACCÈS REFUSÉ pour Person {id}");
                return StatusCode(403, new { message = "Vous ne pouvez modifier que votre propre profil, les membres que vous avez créés, ou vos parents (profils temporaires/décédés)" });
            }
""" + photo_handling_code + """
            // 👨‍👩‍👦 Gérer les parents (placeholder ou existants)"""
)

# Sauvegarder le fichier modifié
with open('/Users/ducer/Desktop/projet/backend/Controllers/PersonsController.cs', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Modifications appliquées avec succès !")
print("📝 Fichier modifié : PersonsController.cs")
print("🔄 Redémarrez le backend pour appliquer les changements")
