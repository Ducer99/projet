# 🧪 Guide de Test : Upload Photo Complet

**Date** : 23 Novembre 2025  
**Objectif** : Valider que l'upload de photo fonctionne end-to-end

---

## 🎯 Pré-requis

- ✅ Frontend corrigé (ligne 272 - EditMember.tsx)
- ⏳ Backend modifié ([FromForm] + IFormFile)
- ✅ Serveurs lancés :
  - Frontend : `http://localhost:3001`
  - Backend : `http://localhost:5000`

---

## 📋 Plan de Test (8 scénarios)

### ✅ Test 1 : Upload Photo JPG (Cas Normal)

**Objectif** : Vérifier que l'upload fonctionne avec une image valide

**Steps** :
1. Ouvrir `http://localhost:3001/edit-member/24`
2. Survoler l'avatar dans la bannière
3. **Vérifier** : Overlay sombre apparaît + cursor pointer
4. Cliquer sur l'avatar
5. **Vérifier** : Sélecteur de fichiers s'ouvre
6. Sélectionner `portrait.jpg` (2 MB, format JPG)
7. **Vérifier** : Preview instantanée dans l'avatar
8. Cliquer "Sauvegarder"
9. **Vérifier** : Toast succès "Membre mis à jour"
10. Refresh la page
11. **Vérifier** : La photo est toujours affichée

**Résultat Attendu** :
```
✅ Status: 200 OK
✅ Toast: "Borel bassot DJOMO KAMO a été mis à jour avec succès"
✅ Photo affichée dans avatar
✅ Fichier créé: backend/wwwroot/uploads/photos/24_abc123.jpg
```

**Console Développeur (F12 → Network)** :
```
PUT /api/persons/24
Status: 200 OK
Request Headers:
  Content-Type: multipart/form-data; boundary=----WebKitFormBoundary...
Response:
{
  "id": 24,
  "firstName": "Borel",
  "photoUrl": "/uploads/photos/24_abc123.jpg"
}
```

---

### ✅ Test 2 : Upload Photo PNG

**Steps** :
1. Cliquer sur avatar
2. Sélectionner `image.png` (1.5 MB)
3. Sauvegarder

**Résultat Attendu** :
```
✅ Status: 200 OK
✅ Photo PNG affichée
✅ Fichier créé: .../24_def456.png
```

---

### ✅ Test 3 : Upload Photo GIF Animé

**Steps** :
1. Cliquer sur avatar
2. Sélectionner `animation.gif` (800 KB)
3. Sauvegarder

**Résultat Attendu** :
```
✅ Status: 200 OK
✅ GIF animé affiché
✅ Fichier créé: .../24_ghi789.gif
```

---

### ❌ Test 4 : Upload Fichier PDF (Validation Échec)

**Objectif** : Vérifier que les fichiers non-image sont rejetés

**Steps** :
1. Cliquer sur avatar
2. Sélectionner `document.pdf`

**Résultat Attendu (Frontend)** :
```
🔴 Toast erreur (immédiat, avant envoi) :
"Veuillez sélectionner un fichier image"
✅ Pas d'envoi au backend
✅ Avatar inchangé
```

**Si validation bypass (backend)** :
```
Status: 400 Bad Request
Response: { "message": "Type de fichier non autorisé" }
```

---

### ❌ Test 5 : Upload Fichier Trop Gros (>5 MB)

**Steps** :
1. Cliquer sur avatar
2. Sélectionner `photo_10mb.jpg`

**Résultat Attendu (Frontend)** :
```
🔴 Toast erreur (immédiat) :
"L'image ne doit pas dépasser 5 MB"
✅ Pas d'envoi
✅ Avatar inchangé
```

**Si bypass (backend)** :
```
Status: 400 Bad Request
Response: { "message": "Fichier trop volumineux (max 5 MB)" }
```

---

### ✅ Test 6 : Mise à Jour Sans Photo (JSON Path)

**Objectif** : Vérifier que les updates sans photo fonctionnent toujours

**Steps** :
1. Ouvrir `http://localhost:3001/edit-member/24`
2. Modifier seulement le prénom : `Borel` → `Borel Updated`
3. **NE PAS** changer la photo
4. Sauvegarder

**Résultat Attendu** :
```
✅ Status: 200 OK
✅ Prénom mis à jour
✅ Photo inchangée (URL existante conservée)
✅ Request: JSON (pas FormData)
```

**Console Network** :
```
PUT /api/persons/24
Content-Type: application/json
Payload:
{
  "firstName": "Borel Updated",
  "photoUrl": "/uploads/photos/24_abc123.jpg"  ← Conservé
}
```

---

### ✅ Test 7 : Remplacement Photo Existante

**Steps** :
1. Avatar affiche déjà une photo (test 1)
2. Cliquer sur avatar
3. Sélectionner nouvelle photo `new_portrait.jpg`
4. **Vérifier** : Preview affiche nouvelle photo
5. Sauvegarder

**Résultat Attendu** :
```
✅ Status: 200 OK
✅ Ancienne photo remplacée
✅ Nouveau fichier créé: .../24_xyz.jpg
✅ Avatar affiche nouvelle photo
```

---

### ✅ Test 8 : Accès Direct Fichier Uploadé

**Objectif** : Vérifier que les fichiers sont accessibles publiquement

**Steps** :
1. Après test 1, noter l'URL de la photo : `/uploads/photos/24_abc123.jpg`
2. Ouvrir dans navigateur : `http://localhost:5000/uploads/photos/24_abc123.jpg`

**Résultat Attendu** :
```
✅ Image s'affiche dans navigateur
✅ Status: 200 OK
✅ Content-Type: image/jpeg
```

**Si erreur 404** :
```
❌ `app.UseStaticFiles()` manquant dans Program.cs
→ Ajouter cette ligne
```

---

## 🔍 Debugging : Console Développeur

### Ouvrir Console (F12)

**Onglets à vérifier** :
1. **Network** : Requêtes HTTP
2. **Console** : Erreurs JavaScript

### Network Tab - Requête Réussie

```
Request URL: http://localhost:5000/api/persons/24
Request Method: PUT
Status Code: 200 OK

Request Headers:
  Content-Type: multipart/form-data; boundary=----WebKitFormBoundary1a2b3c

Request Payload (FormData):
  ------WebKitFormBoundary1a2b3c
  Content-Disposition: form-data; name="photo"; filename="portrait.jpg"
  Content-Type: image/jpeg
  
  [binary data - 2048576 bytes]
  ------WebKitFormBoundary1a2b3c
  Content-Disposition: form-data; name="firstName"
  
  Borel
  ------WebKitFormBoundary1a2b3c
  Content-Disposition: form-data; name="lastName"
  
  DJOMO KAMO
  ------WebKitFormBoundary1a2b3c
  ...

Response:
{
  "id": 24,
  "firstName": "Borel",
  "lastName": "DJOMO KAMO",
  "photoUrl": "/uploads/photos/24_abc123-def456.jpg",
  "alive": true,
  ...
}
```

### Network Tab - Erreur 400/415 (Backend Non Corrigé)

```
Request URL: http://localhost:5000/api/persons/24
Request Method: PUT
Status Code: 400 Bad Request  ← Erreur backend
OU
Status Code: 415 Unsupported Media Type

Response:
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
  "title": "One or more validation errors occurred.",
  "status": 400,
  "errors": {
    "dto": ["The dto field is required."]
  }
}
```

**Cause** : Backend utilise toujours `[FromBody]` au lieu de `[FromForm]`

---

## 📂 Vérification Fichiers Backend

### Commandes Terminal

```bash
# Vérifier que le dossier uploads existe
ls -la backend/wwwroot/uploads/photos/

# Résultat attendu :
# drwxr-xr-x  2 user  staff   64 Nov 23 14:30 .
# drwxr-xr-x  3 user  staff   96 Nov 23 14:30 ..
# -rw-r--r--  1 user  staff  2048576 Nov 23 14:32 24_abc123-def456.jpg
# -rw-r--r--  1 user  staff  1536000 Nov 23 14:35 24_xyz789-012345.png

# Vérifier taille fichier (doit être > 0)
du -h backend/wwwroot/uploads/photos/24_abc123.jpg

# Résultat : 2.0M backend/wwwroot/uploads/photos/24_abc123.jpg

# Vérifier type MIME
file backend/wwwroot/uploads/photos/24_abc123.jpg

# Résultat : 24_abc123.jpg: JPEG image data, JFIF standard 1.01
```

---

## 🐛 Erreurs Courantes & Solutions

### Erreur 1 : 400 Bad Request (dto field required)

**Symptôme** :
```json
{
  "errors": {
    "dto": ["The dto field is required."]
  }
}
```

**Cause** : Backend utilise `[FromBody]` au lieu de `[FromForm]`

**Solution** :
```csharp
// Changer ceci :
public async Task<IActionResult> UpdatePerson(int id, [FromBody] PersonUpdateDto dto)

// En ceci :
public async Task<IActionResult> UpdatePerson(int id, [FromForm] PersonUpdateDto dto, [FromForm] IFormFile? photo)
```

---

### Erreur 2 : 415 Unsupported Media Type

**Symptôme** :
```
Status: 415 Unsupported Media Type
Content-Type 'multipart/form-data' not supported
```

**Cause** : Backend n'accepte que `application/json`

**Solution** : Même fix que Erreur 1 (`[FromForm]`)

---

### Erreur 3 : 404 Not Found (Accès Fichier)

**Symptôme** :
```
GET http://localhost:5000/uploads/photos/24_abc.jpg
Status: 404 Not Found
```

**Cause** : `app.UseStaticFiles()` manquant

**Solution** (Program.cs) :
```csharp
var app = builder.Build();

app.UseStaticFiles();  // ← Ajouter AVANT UseRouting()

app.UseRouting();
app.UseAuthentication();
```

---

### Erreur 4 : 500 Internal Server Error (Directory Not Found)

**Symptôme** :
```
Status: 500 Internal Server Error
System.IO.DirectoryNotFoundException: Could not find a part of the path
```

**Cause** : Dossier `wwwroot/uploads/photos` inexistant

**Solution** (Controller) :
```csharp
var uploadsFolder = Path.Combine(_env.WebRootPath, "uploads", "photos");
Directory.CreateDirectory(uploadsFolder);  // ← Crée si inexistant
```

---

### Erreur 5 : Photo Preview OK, mais pas sauvegardée

**Symptôme** :
- Frontend : Preview affichée ✅
- Après save : Photo disparaît ❌

**Cause** : Backend ne traite pas le paramètre `photo`

**Solution** : Ajouter logique sauvegarde fichier dans controller

---

### Erreur 6 : CORS Error (Frontend séparé)

**Symptôme** :
```
Access to XMLHttpRequest at 'http://localhost:5000/api/persons/24' 
from origin 'http://localhost:3001' has been blocked by CORS policy
```

**Solution** (Program.cs) :
```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// ...

app.UseCors("AllowAll");  // ← Avant UseRouting()
```

---

## ✅ Checklist Finale

### Frontend
- [x] FormData créé correctement
- [x] Header Content-Type retiré (auto-généré)
- [x] Validation fichier (type + taille)
- [x] Preview instantanée (FileReader)
- [x] Toast erreurs fonctionnels

### Backend
- [ ] `[FromBody]` → `[FromForm]`
- [ ] Paramètre `IFormFile? photo` ajouté
- [ ] Validation type fichier (image/*)
- [ ] Validation taille (<5 MB)
- [ ] Logique sauvegarde (CopyToAsync)
- [ ] Nom unique (Guid)
- [ ] PhotoUrl mise à jour en base
- [ ] `app.UseStaticFiles()` configuré
- [ ] `IWebHostEnvironment` injecté
- [ ] Dossier uploads créé auto

### Tests
- [ ] Upload JPG → ✅ 200 OK
- [ ] Upload PNG → ✅ 200 OK
- [ ] Upload GIF → ✅ 200 OK
- [ ] Upload PDF → ❌ 400 Bad Request
- [ ] Upload >5MB → ❌ 400 Bad Request
- [ ] Update sans photo → ✅ 200 OK (JSON)
- [ ] Remplacement photo → ✅ 200 OK
- [ ] Accès fichier direct → ✅ 200 OK

---

## 📊 Résultats Attendus (Tableau de Bord)

### Scénarios Positifs (✅ Succès)

| Test | Input | Expected | Status |
|------|-------|----------|--------|
| Upload JPG | portrait.jpg (2 MB) | 200 OK, photo affichée | ✅ |
| Upload PNG | image.png (1.5 MB) | 200 OK, photo affichée | ✅ |
| Upload GIF | animation.gif (800 KB) | 200 OK, GIF affiché | ✅ |
| Update sans photo | Modifier prénom | 200 OK, prénom changé | ✅ |
| Remplacement photo | new_photo.jpg | 200 OK, nouvelle photo | ✅ |
| Accès direct | GET /uploads/photos/x.jpg | 200 OK, image visible | ✅ |

### Scénarios Négatifs (❌ Rejet Attendu)

| Test | Input | Expected | Status |
|------|-------|----------|--------|
| Upload PDF | document.pdf | Toast erreur frontend | ✅ |
| Upload >5MB | photo_10mb.jpg | Toast erreur frontend | ✅ |
| Upload Word | document.docx | Toast erreur frontend | ✅ |

---

## 🎬 Vidéo de Démonstration Recommandée

### Script (1 minute)

```
0:00 - "Bonjour, test upload photo"
0:05 - [Ouvrir page EditMember]
0:10 - [Hover avatar] "Overlay sombre apparaît"
0:15 - [Clic avatar] "Sélecteur s'ouvre"
0:20 - [Upload portrait.jpg] "Preview instantanée !"
0:25 - [F12 Network] "FormData multipart/form-data"
0:35 - [Clic Save] "Status 200 OK"
0:40 - [Toast succès] "Membre mis à jour"
0:45 - [Refresh page] "Photo conservée"
0:50 - [Backend terminal] "Fichier créé dans wwwroot/uploads"
0:55 - [Accès direct URL] "Image accessible publiquement"
1:00 - "Test réussi !" ✅
```

---

## 📞 Escalation

**Si tous les tests échouent après 15 minutes** :

1. Vérifier que backend a bien été modifié (`[FromForm]`)
2. Vérifier logs backend console (erreurs stack trace)
3. Consulter documentation complète : `BUG_CRITIQUE_MULTIPART_FORM_DATA.md`
4. Contacter développeur backend senior
5. Envoyer email : `EMAIL_BACKEND_TEAM_UPLOAD_FIX.md`

---

**Guide créé le 23 Novembre 2025**  
*"Tester c'est douter, valider c'est livrer"* 🧪✨
