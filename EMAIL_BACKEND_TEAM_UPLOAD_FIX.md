# 📧 Email Backend Team : Upload Photo Fix

**Copier-coller cet email directement à votre équipe backend**

---

**Objet** : 🔴 URGENT - Fix Upload Photo (5 min de dev)

---

Bonjour l'équipe Backend,

L'upload de photo de profil échoue actuellement avec une **erreur 400 Bad Request** ou **415 Unsupported Media Type**.

## 🎯 Diagnostic

**Cause identifiée** : Incompatibilité de format de données
- ✅ Frontend envoie correctement `multipart/form-data` avec le fichier
- ❌ Backend attend `[FromBody]` (JSON uniquement)

**Impact** :
- 🚫 Impossible d'uploader des photos
- 😠 Feature complète bloquée

---

## ✅ Solution (5 minutes de développement)

### 1️⃣ Modifier le Controller (2 lignes)

**Fichier** : `backend/Controllers/PersonsController.cs`

**AVANT** (actuellement) :
```csharp
[HttpPut("{id}")]
public async Task<IActionResult> UpdatePerson(int id, [FromBody] PersonUpdateDto dto)
{
    // ...
}
```

**APRÈS** (à corriger) :
```csharp
[HttpPut("{id}")]
public async Task<IActionResult> UpdatePerson(
    int id, 
    [FromForm] PersonUpdateDto dto,      // ← Changer [FromBody] → [FromForm]
    [FromForm] IFormFile? photo)         // ← Ajouter ce paramètre
{
    // Traiter le fichier photo
    if (photo != null && photo.Length > 0)
    {
        // Validation type
        if (!photo.ContentType.StartsWith("image/"))
            return BadRequest(new { message = "Type de fichier non autorisé" });
        
        // Validation taille (max 5 MB)
        if (photo.Length > 5 * 1024 * 1024)
            return BadRequest(new { message = "Fichier trop volumineux (max 5 MB)" });
        
        // Générer nom unique
        var fileName = $"{id}_{Guid.NewGuid()}{Path.GetExtension(photo.FileName)}";
        
        // Créer dossier si inexistant
        var uploadsFolder = Path.Combine(_env.WebRootPath, "uploads", "photos");
        Directory.CreateDirectory(uploadsFolder);
        
        // Sauvegarder fichier
        var filePath = Path.Combine(uploadsFolder, fileName);
        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await photo.CopyToAsync(stream);
        }
        
        // Mettre à jour URL en base
        person.PhotoUrl = $"/uploads/photos/{fileName}";
    }
    
    // Mise à jour autres champs (existant)
    person.FirstName = dto.FirstName;
    person.LastName = dto.LastName;
    // ...
    
    await _context.SaveChangesAsync();
    return Ok(person);
}
```

### 2️⃣ Injecter IWebHostEnvironment (si pas déjà fait)

**Dans le constructor** :
```csharp
private readonly ApplicationDbContext _context;
private readonly IWebHostEnvironment _env;  // ← Ajouter

public PersonsController(ApplicationDbContext context, IWebHostEnvironment env)
{
    _context = context;
    _env = env;  // ← Nécessaire pour accéder à wwwroot
}
```

### 3️⃣ Activer les fichiers statiques (1 ligne)

**Fichier** : `backend/Program.cs`

**Ajouter** (après `var app = builder.Build();`) :
```csharp
var app = builder.Build();

app.UseStaticFiles();  // ← Ajouter cette ligne pour servir /uploads

app.UseRouting();
app.UseAuthentication();
// ...
```

---

## 🧪 Tests de Validation

**Test 1** : Upload photo JPG (2 MB)
```
PUT /api/persons/24
Status: 200 OK
Response: { "photoUrl": "/uploads/photos/24_abc123.jpg" }
```

**Test 2** : Vérifier fichier créé
```bash
ls backend/wwwroot/uploads/photos/24_abc123.jpg
```

**Test 3** : Accès URL
```
http://localhost:5000/uploads/photos/24_abc123.jpg
(doit afficher l'image)
```

**Test 4** : Upload fichier invalide (PDF)
```
Status: 400 Bad Request
{ "message": "Type de fichier non autorisé" }
```

---

## 📂 Structure Dossiers Attendue

```
backend/
├── wwwroot/              ← Dossier public (créé auto)
│   └── uploads/
│       └── photos/       ← Photos uploadées ici
│           ├── 24_abc123.jpg
│           ├── 25_def456.png
│           └── ...
├── Controllers/
│   └── PersonsController.cs
└── Program.cs
```

Le dossier `wwwroot/uploads/photos` sera créé automatiquement par le code.

---

## 🔍 Debugging

### Console Développeur (Frontend)

**Requête actuelle** :
```
PUT http://localhost:5000/api/persons/24
Status: 400 Bad Request  ← Erreur actuelle

Request Headers:
  Content-Type: multipart/form-data; boundary=----WebKitFormBoundary...

Request Payload:
  ------WebKitFormBoundary...
  Content-Disposition: form-data; name="photo"; filename="portrait.jpg"
  Content-Type: image/jpeg
  
  [binary data]
  ------WebKitFormBoundary...
  Content-Disposition: form-data; name="firstName"
  
  Borel
  ------WebKitFormBoundary...
```

### Logs Backend Attendus (Après Fix)

```
PersonsController: PUT /persons/24
Photo received: portrait.jpg (2048576 bytes)
Saved to: wwwroot/uploads/photos/24_abc123.jpg
PhotoUrl updated: /uploads/photos/24_abc123.jpg
Person updated successfully
```

---

## ⏱️ Timeline Estimée

| Tâche | Durée |
|-------|-------|
| Changer [FromBody] → [FromForm] | 30 sec |
| Ajouter paramètre IFormFile | 30 sec |
| Implémenter logique sauvegarde | 3 min |
| Ajouter UseStaticFiles() | 30 sec |
| Test upload | 1 min |
| **TOTAL** | **~5 min** |

---

## 📚 Documentation Complète

J'ai créé 3 documents détaillés dans le repo :

1. **`FIX_URGENT_UPLOAD_PHOTO.md`** (ce résumé)
2. **`BUG_CRITIQUE_MULTIPART_FORM_DATA.md`** (guide technique complet 700+ lignes)
3. **`AVATAR_CLIQUABLE_FINAL.md`** (documentation UX)

Tous les détails techniques, cas d'erreurs, et exemples de code y sont disponibles.

---

## ✅ Checklist Implémentation

- [ ] Modifier signature méthode : `[FromForm]` + `IFormFile? photo`
- [ ] Implémenter validation fichier (type + taille)
- [ ] Implémenter sauvegarde fichier (Guid + CopyToAsync)
- [ ] Ajouter `app.UseStaticFiles()` dans Program.cs
- [ ] Injecter `IWebHostEnvironment` dans constructor
- [ ] Tester upload JPG → ✅ 200 OK
- [ ] Tester fichier créé → ✅ Existe dans wwwroot/uploads/photos
- [ ] Tester URL accessible → ✅ Image s'affiche
- [ ] Tester validation (PDF, >5MB) → ✅ 400 Bad Request

---

## 🆘 Besoin d'Aide ?

**Questions** :
- 📧 Email moi pour précisions
- 💬 Slack: #backend-support

**Ressources** :
- [ASP.NET Core File Uploads](https://learn.microsoft.com/en-us/aspnet/core/mvc/models/file-uploads)
- [IFormFile Documentation](https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.http.iformfile)

---

Merci de traiter ce fix en **priorité** (feature bloquée).

Le frontend est déjà corrigé et prêt. Il attend juste ce changement backend.

Cordialement,  
[Votre Nom]

---

**P.S.** : Le code est testé et validé côté frontend. Le fix backend est standard (multipart/form-data) et ne devrait prendre que 5 minutes. Si vous rencontrez des difficultés, consultez `BUG_CRITIQUE_MULTIPART_FORM_DATA.md` pour le code complet ligne par ligne.
