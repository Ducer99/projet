# 🐛 BUG CRITIQUE : Upload Photo (Multipart/Form-Data)

**Date** : 23 Novembre 2025  
**Priorité** : 🔴 **CRITIQUE**  
**Statut** : ⏳ **EN ATTENTE BACKEND**

---

## 🎯 Résumé Exécutif

**Problème** : L'upload de photo échoue avec erreur **400 Bad Request**, **415 Unsupported Media Type** ou **500 Internal Server Error**.

**Cause Racine** : **Incompatibilité de format de données**
- ✅ **Frontend** : Envoie correctement `FormData` (multipart/form-data)
- ❌ **Backend** : Attend probablement du JSON (`[FromBody]`) au lieu de multipart (`[FromForm]`)

**Impact** :
- 🚫 Impossible d'uploader des photos de profil
- 🚫 Feature complète bloquée
- 😠 Frustration utilisateur

**Solution** : Modifier le backend pour accepter `[FromForm]` avec `IFormFile` (ASP.NET Core)

---

## 🔍 Diagnostic Complet

### 1️⃣ Symptômes Observés

```
Erreur lors de la mise à jour du membre
```

**Console Développeur (F12 → Network)** :
```
PUT /api/persons/24
Status: 400 Bad Request
OU
Status: 415 Unsupported Media Type
OU
Status: 500 Internal Server Error
```

**Request Headers (Correct)** :
```
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary...
```

**Request Payload (FormData)** :
```
------WebKitFormBoundary...
Content-Disposition: form-data; name="photo"; filename="portrait.jpg"
Content-Type: image/jpeg

[binary data]
------WebKitFormBoundary...
Content-Disposition: form-data; name="firstName"

Borel
------WebKitFormBoundary...
```

### 2️⃣ Cause Technique

**Backend actuel (probablement)** :
```csharp
[HttpPut("{id}")]
public async Task<IActionResult> UpdatePerson(int id, [FromBody] PersonUpdateDto dto)
{
    // ❌ [FromBody] attend du JSON (application/json)
    // ❌ Ne peut PAS parser multipart/form-data
    // → Erreur 400 ou 415
}
```

**Ce qui se passe** :
1. Frontend envoie `multipart/form-data` avec fichier binaire
2. Backend essaie de parser en JSON (à cause de `[FromBody]`)
3. Échec du parsing → Exception → Erreur HTTP

---

## ✅ SOLUTION COMPLÈTE

### 🔧 Frontend (Déjà Corrigé) ✅

**Fichier** : `frontend/src/pages/EditMember.tsx`

#### Avant (❌ Erreur Critique)

```typescript
await api.put(`/persons/${id}`, formData, {
  headers: {
    'Content-Type': 'multipart/form-data',  // ❌ ERREUR !
  },
});
```

**Problème** : Définir manuellement `Content-Type` **sans le boundary** → Backend ne peut pas parser.

#### Après (✅ Correct)

```typescript
// ⚠️ IMPORTANT : Ne PAS définir 'Content-Type' manuellement
// Le navigateur génère automatiquement le boundary correct
await api.put(`/persons/${id}`, formData);
```

**Résultat** : Le navigateur envoie automatiquement :
```
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary1a2b3c4d
```

#### Code FormData Complet (Déjà Implémenté)

```typescript
const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  
  if (photoFile) {
    // Cas 1 : Fichier photo présent → FormData
    const formData = new FormData();
    formData.append('photo', photoFile);  // ← Fichier binaire
    formData.append('firstName', firstName);
    formData.append('lastName', lastName);
    formData.append('sex', sex);
    if (birthday) formData.append('birthday', birthday);
    if (deathDate) formData.append('deathDate', deathDate);
    formData.append('alive', String(alive));
    if (email) formData.append('email', email);
    if (activity) formData.append('activity', activity);
    if (notes) formData.append('notes', notes);
    formData.append('cityID', String(cityID));

    // Parents handling
    if (fatherMode === 'select' && fatherID) {
      formData.append('fatherID', String(fatherID));
    } else if (fatherMode === 'manual' && fatherFirstName && fatherLastName) {
      formData.append('fatherFirstName', fatherFirstName);
      formData.append('fatherLastName', fatherLastName);
    }

    if (motherMode === 'select' && motherID) {
      formData.append('motherID', String(motherID));
    } else if (motherMode === 'manual' && motherFirstName && motherLastName) {
      formData.append('motherFirstName', motherFirstName);
      formData.append('motherLastName', motherLastName);
    }

    // ✅ Envoi FormData SANS header Content-Type manuel
    await api.put(`/persons/${id}`, formData);
    
  } else {
    // Cas 2 : Pas de fichier → JSON classique
    const payload = {
      firstName,
      lastName,
      sex,
      birthday: birthday || null,
      deathDate: deathDate || null,
      alive,
      email: email || null,
      activity: activity || null,
      photoUrl: photoUrl || null,
      notes: notes || null,
      cityID,
      // ... parents
    };

    await api.put(`/persons/${id}`, payload);
  }
};
```

---

### 🔧 Backend (À Corriger) ⏳

**Fichier** : `backend/Controllers/PersonsController.cs` (ou similaire)

#### Avant (❌ Erreur)

```csharp
[HttpPut("{id}")]
public async Task<IActionResult> UpdatePerson(int id, [FromBody] PersonUpdateDto dto)
{
    // ❌ [FromBody] ne peut PAS parser multipart/form-data
    // ❌ Attend uniquement application/json
    
    var person = await _context.Persons.FindAsync(id);
    if (person == null) return NotFound();
    
    person.FirstName = dto.FirstName;
    person.LastName = dto.LastName;
    person.PhotoUrl = dto.PhotoUrl;  // ← Seulement URL, pas de fichier
    // ...
    
    await _context.SaveChangesAsync();
    return Ok(person);
}
```

#### Après (✅ Correct)

```csharp
[HttpPut("{id}")]
public async Task<IActionResult> UpdatePerson(
    int id, 
    [FromForm] PersonUpdateDto dto,      // ← [FromForm] au lieu de [FromBody]
    [FromForm] IFormFile? photo)         // ← Paramètre fichier explicite
{
    var person = await _context.Persons.FindAsync(id);
    if (person == null) return NotFound();
    
    // Traitement du fichier photo
    if (photo != null && photo.Length > 0)
    {
        // 1️⃣ Validation type de fichier
        var allowedTypes = new[] { "image/jpeg", "image/png", "image/gif", "image/webp" };
        if (!allowedTypes.Contains(photo.ContentType))
        {
            return BadRequest(new { message = "Type de fichier non autorisé. Utilisez JPG, PNG, GIF ou WebP." });
        }
        
        // 2️⃣ Validation taille (max 5 MB)
        if (photo.Length > 5 * 1024 * 1024)
        {
            return BadRequest(new { message = "Le fichier ne doit pas dépasser 5 MB." });
        }
        
        // 3️⃣ Générer nom unique
        var fileName = $"{id}_{Guid.NewGuid()}{Path.GetExtension(photo.FileName)}";
        
        // 4️⃣ Définir chemin de sauvegarde
        var uploadsFolder = Path.Combine(_env.WebRootPath, "uploads", "photos");
        if (!Directory.Exists(uploadsFolder))
        {
            Directory.CreateDirectory(uploadsFolder);
        }
        var filePath = Path.Combine(uploadsFolder, fileName);
        
        // 5️⃣ Sauvegarder le fichier
        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await photo.CopyToAsync(stream);
        }
        
        // 6️⃣ Mettre à jour l'URL en base de données
        person.PhotoUrl = $"/uploads/photos/{fileName}";
    }
    else if (!string.IsNullOrEmpty(dto.PhotoUrl))
    {
        // Fallback : URL fournie manuellement (sans fichier)
        person.PhotoUrl = dto.PhotoUrl;
    }
    
    // Mise à jour des autres champs
    person.FirstName = dto.FirstName;
    person.LastName = dto.LastName;
    person.Sex = dto.Sex;
    person.Birthday = dto.Birthday;
    person.DeathDate = dto.DeathDate;
    person.Alive = dto.Alive;
    person.Email = dto.Email;
    person.Activity = dto.Activity;
    person.Notes = dto.Notes;
    person.CityID = dto.CityID;
    
    // Parents handling
    if (dto.FatherID.HasValue)
    {
        person.FatherID = dto.FatherID.Value;
    }
    else if (!string.IsNullOrEmpty(dto.FatherFirstName) && !string.IsNullOrEmpty(dto.FatherLastName))
    {
        // Créer nouveau père
        var father = new Person
        {
            FirstName = dto.FatherFirstName,
            LastName = dto.FatherLastName,
            Sex = "M",
            Alive = true,
            CityID = person.CityID
        };
        _context.Persons.Add(father);
        await _context.SaveChangesAsync();
        person.FatherID = father.ID;
    }
    
    if (dto.MotherID.HasValue)
    {
        person.MotherID = dto.MotherID.Value;
    }
    else if (!string.IsNullOrEmpty(dto.MotherFirstName) && !string.IsNullOrEmpty(dto.MotherLastName))
    {
        // Créer nouvelle mère
        var mother = new Person
        {
            FirstName = dto.MotherFirstName,
            LastName = dto.MotherLastName,
            Sex = "F",
            Alive = true,
            CityID = person.CityID
        };
        _context.Persons.Add(mother);
        await _context.SaveChangesAsync();
        person.MotherID = mother.ID;
    }
    
    await _context.SaveChangesAsync();
    
    return Ok(person);
}
```

#### DTO Mis à Jour (PersonUpdateDto)

```csharp
public class PersonUpdateDto
{
    public string FirstName { get; set; } = "";
    public string LastName { get; set; } = "";
    public string Sex { get; set; } = "";
    public DateTime? Birthday { get; set; }
    public DateTime? DeathDate { get; set; }
    public bool Alive { get; set; } = true;
    public string? Email { get; set; }
    public string? Activity { get; set; }
    public string? PhotoUrl { get; set; }  // ← Fallback URL (optionnel)
    public string? Notes { get; set; }
    public int CityID { get; set; }
    
    // Parents (mode sélection)
    public int? FatherID { get; set; }
    public int? MotherID { get; set; }
    
    // Parents (mode manuel)
    public string? FatherFirstName { get; set; }
    public string? FatherLastName { get; set; }
    public string? MotherFirstName { get; set; }
    public string? MotherLastName { get; set; }
}
```

**Note** : Le fichier `photo` est un paramètre séparé (`IFormFile? photo`), pas dans le DTO.

---

## 📂 Configuration Backend Requise

### 1️⃣ Program.cs / Startup.cs

Activer les fichiers statiques pour servir les uploads :

```csharp
var builder = WebApplication.CreateBuilder(args);

// ... autres services

var app = builder.Build();

// ✅ Activer les fichiers statiques (wwwroot)
app.UseStaticFiles();

// ✅ CORS (si frontend séparé)
app.UseCors(policy => policy
    .AllowAnyOrigin()
    .AllowAnyMethod()
    .AllowAnyHeader());

app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
```

### 2️⃣ Structure Dossiers

```
backend/
├── wwwroot/              ← Dossier public (fichiers statiques)
│   └── uploads/
│       └── photos/       ← Créé automatiquement par le code
│           ├── 24_abc123.jpg
│           ├── 25_def456.png
│           └── ...
├── Controllers/
│   └── PersonsController.cs
├── Models/
│   ├── Person.cs
│   └── PersonUpdateDto.cs
└── Program.cs
```

### 3️⃣ Injection IWebHostEnvironment

Dans le controller :

```csharp
public class PersonsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IWebHostEnvironment _env;  // ← Injecter

    public PersonsController(ApplicationDbContext context, IWebHostEnvironment env)
    {
        _context = context;
        _env = env;  // ← Nécessaire pour wwwroot path
    }
    
    // ...
}
```

---

## 🧪 Tests de Validation

### Test 1 : Upload Photo (Cas Normal)

**Action** :
1. Frontend : Cliquer sur avatar, sélectionner `portrait.jpg` (2 MB)
2. Cliquer "Sauvegarder"

**Backend Logs Attendus** :
```
PUT /api/persons/24
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary...
File received: portrait.jpg (2048576 bytes)
Saved to: wwwroot/uploads/photos/24_abc123.jpg
PhotoUrl updated: /uploads/photos/24_abc123.jpg
```

**Frontend Response** :
```json
{
  "id": 24,
  "firstName": "Borel",
  "lastName": "DJOMO KAMO",
  "photoUrl": "/uploads/photos/24_abc123.jpg",
  ...
}
```

**Vérification** :
```bash
# Fichier doit exister
ls -la backend/wwwroot/uploads/photos/24_abc123.jpg

# Accessible via URL
curl http://localhost:5000/uploads/photos/24_abc123.jpg
```

### Test 2 : Upload Fichier Invalide (PDF)

**Action** :
1. Sélectionner `document.pdf`

**Frontend** : Toast erreur (déjà validé côté client)

**Backend** (si validation bypass) :
```json
Status: 400 Bad Request
{
  "message": "Type de fichier non autorisé. Utilisez JPG, PNG, GIF ou WebP."
}
```

### Test 3 : Upload Fichier Trop Gros (>5MB)

**Action** :
1. Sélectionner `photo_10mb.jpg`

**Frontend** : Toast erreur (déjà validé)

**Backend** (si bypass) :
```json
Status: 400 Bad Request
{
  "message": "Le fichier ne doit pas dépasser 5 MB."
}
```

### Test 4 : Mise à Jour Sans Photo (JSON)

**Action** :
1. Modifier seulement le prénom (sans changer photo)
2. Sauvegarder

**Request** : JSON classique (pas FormData)
```json
{
  "firstName": "Borel Updated",
  "lastName": "DJOMO KAMO",
  "photoUrl": "/uploads/photos/24_abc123.jpg",
  ...
}
```

**Backend** : Doit accepter les 2 formats (`[FromForm]` et `[FromBody]`)

**Note** : ASP.NET Core gère automatiquement les 2 formats si le DTO est compatible.

---

## 🔍 Debugging Guide

### Console Développeur (F12)

#### 1️⃣ Network Tab

```
Request URL: http://localhost:5000/api/persons/24
Request Method: PUT
Status Code: 400 Bad Request  ← Erreur actuelle

Request Headers:
  Content-Type: multipart/form-data; boundary=----WebKitFormBoundary...

Request Payload:
  ------WebKitFormBoundary...
  Content-Disposition: form-data; name="photo"; filename="portrait.jpg"
  Content-Type: image/jpeg
  
  [binary data]
  ------WebKitFormBoundary...
```

#### 2️⃣ Console Tab

```javascript
// Erreur actuelle
PUT http://localhost:5000/api/persons/24 400 (Bad Request)
Error: Request failed with status code 400
```

### Backend Logs

#### Erreur Actuelle (Probablement)

```
Microsoft.AspNetCore.Mvc.ModelBinding.ModelBinderAttribute: 
Failed to bind parameter 'PersonUpdateDto dto' [FromBody]

System.Text.Json.JsonException: 
The JSON value could not be converted to PersonUpdateDto.
```

**Cause** : `[FromBody]` ne peut pas parser multipart/form-data.

#### Après Correction (Attendu)

```
PersonsController: PUT /persons/24
Photo received: portrait.jpg (2048576 bytes)
Saved to: D:\Projects\backend\wwwroot\uploads\photos\24_abc123.jpg
Person updated successfully
```

---

## 🚨 Erreurs Courantes

### Erreur 1 : 415 Unsupported Media Type

**Cause** : Backend attend `application/json`, reçoit `multipart/form-data`

**Solution** : Changer `[FromBody]` → `[FromForm]`

### Erreur 2 : 400 Bad Request (Null Reference)

**Cause** : DTO non parsé (champs null)

**Solution** : Vérifier que les noms FormData correspondent au DTO
```typescript
// Frontend
formData.append('firstName', firstName);  // ← Doit correspondre

// Backend DTO
public string FirstName { get; set; }  // ← Exact match (case-insensitive)
```

### Erreur 3 : 500 Internal Server Error (Directory Not Found)

**Cause** : Dossier `wwwroot/uploads/photos` n'existe pas

**Solution** : Créer automatiquement
```csharp
if (!Directory.Exists(uploadsFolder))
{
    Directory.CreateDirectory(uploadsFolder);
}
```

### Erreur 4 : Photo Sauvegardée mais Non Accessible

**Cause** : `app.UseStaticFiles()` manquant

**Solution** : Ajouter dans `Program.cs` AVANT `app.UseRouting()`

### Erreur 5 : Boundary Manquant

**Frontend Erreur** :
```typescript
headers: {
  'Content-Type': 'multipart/form-data',  // ❌ Pas de boundary !
}
```

**Solution** : Supprimer le header, laisser le navigateur le générer automatiquement.

---

## 📊 Checklist Implémentation Backend

### Étape 1 : Modifier Controller

- [ ] Changer `[FromBody]` → `[FromForm]`
- [ ] Ajouter paramètre `IFormFile? photo`
- [ ] Injecter `IWebHostEnvironment` dans constructor
- [ ] Valider type fichier (image/*)
- [ ] Valider taille (<5 MB)
- [ ] Générer nom unique (Guid)
- [ ] Créer dossier uploads si inexistant
- [ ] Sauvegarder fichier avec `CopyToAsync()`
- [ ] Mettre à jour `PhotoUrl` en base
- [ ] Gérer fallback URL (si pas de fichier)

### Étape 2 : Configuration

- [ ] Vérifier `app.UseStaticFiles()` dans Program.cs
- [ ] Créer dossier `wwwroot/uploads/photos` manuellement (ou auto)
- [ ] Configurer CORS si frontend séparé
- [ ] Tester accès fichier : `http://localhost:5000/uploads/photos/test.jpg`

### Étape 3 : Tests

- [ ] Test upload JPG (2 MB) → ✅ Succès
- [ ] Test upload PNG (1 MB) → ✅ Succès
- [ ] Test upload GIF (500 KB) → ✅ Succès
- [ ] Test upload PDF → ❌ 400 Bad Request
- [ ] Test upload 10 MB → ❌ 400 Bad Request
- [ ] Test update sans photo → ✅ Succès (JSON)
- [ ] Test fichier accessible : `/uploads/photos/24_abc.jpg`
- [ ] Test refresh page → Photo affichée

---

## 🎯 Timeline Estimée

| Tâche | Durée | Responsable |
|-------|-------|-------------|
| Modifier Controller | 20 min | Backend Dev |
| Tester upload local | 10 min | Backend Dev |
| Créer dossier uploads | 2 min | Backend Dev |
| Configurer static files | 5 min | Backend Dev |
| Tests E2E | 15 min | QA |
| **TOTAL** | **~52 min** | |

---

## 📸 Exemple Complet End-to-End

### 1️⃣ Frontend Envoie FormData

```typescript
const formData = new FormData();
formData.append('photo', photoFile);        // Fichier binaire
formData.append('firstName', 'Borel');
formData.append('lastName', 'DJOMO KAMO');
formData.append('sex', 'M');
formData.append('birthday', '1990-01-15');
formData.append('alive', 'true');
formData.append('cityID', '1');

await api.put('/persons/24', formData);  // Sans header Content-Type !
```

### 2️⃣ Backend Reçoit et Traite

```csharp
[HttpPut("{id}")]
public async Task<IActionResult> UpdatePerson(
    int id, 
    [FromForm] PersonUpdateDto dto,
    [FromForm] IFormFile? photo)
{
    // dto.FirstName = "Borel"
    // dto.LastName = "DJOMO KAMO"
    // photo.FileName = "portrait.jpg"
    // photo.Length = 2048576 (2 MB)
    
    if (photo != null)
    {
        var fileName = $"{id}_{Guid.NewGuid()}.jpg";
        var path = Path.Combine(_env.WebRootPath, "uploads", "photos", fileName);
        
        using (var stream = new FileStream(path, FileMode.Create))
        {
            await photo.CopyToAsync(stream);
        }
        
        person.PhotoUrl = $"/uploads/photos/{fileName}";
    }
    
    person.FirstName = dto.FirstName;
    person.LastName = dto.LastName;
    // ...
    
    await _context.SaveChangesAsync();
    return Ok(person);
}
```

### 3️⃣ Fichier Sauvegardé

```
backend/wwwroot/uploads/photos/24_abc123-def456.jpg
```

### 4️⃣ URL Retournée au Frontend

```json
{
  "id": 24,
  "firstName": "Borel",
  "lastName": "DJOMO KAMO",
  "photoUrl": "/uploads/photos/24_abc123-def456.jpg",
  ...
}
```

### 5️⃣ Frontend Affiche Photo

```tsx
<Avatar 
  src={`http://localhost:5000/uploads/photos/24_abc123-def456.jpg`}
  name="Borel DJOMO KAMO"
/>
```

---

## ✅ Statut Actuel

**Frontend** : ✅ **CORRIGÉ**
- ✅ FormData correctement créé
- ✅ Header `Content-Type` retiré (auto-généré par navigateur)
- ✅ Validation fichier côté client

**Backend** : ⏳ **EN ATTENTE**
- ⏳ Modifier `[FromBody]` → `[FromForm]`
- ⏳ Ajouter paramètre `IFormFile? photo`
- ⏳ Implémenter logique sauvegarde fichier
- ⏳ Configurer `UseStaticFiles()`

---

## 📞 Support

**Questions Backend** :
- Développeur Backend assigné
- Stack Overflow : [asp.net-core-multipart-form-data](https://stackoverflow.com/questions/tagged/asp.net-core+multipart)

**Documentation** :
- [ASP.NET Core File Uploads](https://learn.microsoft.com/en-us/aspnet/core/mvc/models/file-uploads)
- [IFormFile Interface](https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.http.iformfile)
- [Static Files in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/static-files)

---

**Document créé le 23 Novembre 2025**  
*"Upload de fichiers : Multipart/Form-Data est la clé"* 📦✨

---

## 🎓 Ressources Complémentaires

### Exemple Minimal Backend

```csharp
[ApiController]
[Route("api/[controller]")]
public class PersonsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IWebHostEnvironment _env;

    public PersonsController(ApplicationDbContext context, IWebHostEnvironment env)
    {
        _context = context;
        _env = env;
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdatePerson(
        int id,
        [FromForm] string firstName,
        [FromForm] string lastName,
        [FromForm] IFormFile? photo)
    {
        var person = await _context.Persons.FindAsync(id);
        if (person == null) return NotFound();

        if (photo != null)
        {
            var uploadsFolder = Path.Combine(_env.WebRootPath, "uploads", "photos");
            Directory.CreateDirectory(uploadsFolder);
            
            var fileName = $"{id}_{Guid.NewGuid()}{Path.GetExtension(photo.FileName)}";
            var filePath = Path.Combine(uploadsFolder, fileName);
            
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await photo.CopyToAsync(stream);
            }
            
            person.PhotoUrl = $"/uploads/photos/{fileName}";
        }

        person.FirstName = firstName;
        person.LastName = lastName;
        
        await _context.SaveChangesAsync();
        return Ok(person);
    }
}
```

**Note** : Version simplifiée sans DTO pour démonstration rapide.
