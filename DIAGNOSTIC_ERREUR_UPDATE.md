# 🔍 DIAGNOSTIC ERREUR : "Error during update"

**Date** : 23 Novembre 2025  
**Statut** : 🔴 EN COURS DE RÉSOLUTION

---

## 🎯 Instructions de Diagnostic (5 minutes)

### Étape 1 : Ouvrir Console Développeur (2 min)

1. **Ouvrir la page** : `http://localhost:3001/edit-member/24`
2. **Appuyer sur F12** (ou Cmd+Option+I sur Mac)
3. **Aller dans l'onglet "Console"**
4. **Aller dans l'onglet "Network"** (ou "Réseau")

### Étape 2 : Reproduire l'Erreur (1 min)

1. Cliquer sur l'avatar dans la bannière
2. Sélectionner une image (ex: `portrait.jpg`)
3. **Vérifier** : Preview s'affiche ? ✅ Oui / ❌ Non
4. Cliquer "Sauvegarder"
5. **Observer** : L'erreur apparaît

### Étape 3 : Lire les Logs (2 min)

#### A. Console Tab

**Cherchez ces lignes** :
```javascript
Error updating member: ...
Error details: {
  status: ???,        ← CODE IMPORTANT !
  statusText: "...",
  data: { ... },
  message: "..."
}
```

**Notez le `status`** : 400, 415, 500, ou autre ?

#### B. Network Tab

**Cherchez la requête** : `PUT /api/persons/24`

**Cliquez dessus** et notez :

```
Status Code: ???  ← 200, 400, 415, 500 ?

Request Headers:
  Content-Type: multipart/form-data; boundary=... ← Présent ?

Request Payload:
  ------WebKitFormBoundary...  ← Visible ?
  Content-Disposition: form-data; name="photo"
  [binary data]

Response:
  { ... }  ← Message d'erreur backend
```

---

## 🔴 Interprétation des Codes d'Erreur

### Status 400 (Bad Request)

```
❌ CAUSE : Backend ne peut pas parser FormData
✅ SOLUTION : Backend doit utiliser [FromForm] au lieu de [FromBody]
📧 ACTION : Envoyer EMAIL_BACKEND_TEAM_UPLOAD_FIX.md
```

**Exemple de réponse backend** :
```json
{
  "errors": {
    "dto": ["The dto field is required."]
  }
}
```

**Fix backend** (5 minutes) :
```csharp
// AVANT (❌ Erreur)
[HttpPut("{id}")]
public async Task<IActionResult> UpdatePerson(int id, [FromBody] PersonUpdateDto dto)

// APRÈS (✅ Correct)
[HttpPut("{id}")]
public async Task<IActionResult> UpdatePerson(int id, [FromForm] PersonUpdateDto dto, [FromForm] IFormFile? photo)
```

---

### Status 415 (Unsupported Media Type)

```
❌ CAUSE : Backend n'accepte que application/json
✅ SOLUTION : Backend doit accepter multipart/form-data
📧 ACTION : Envoyer EMAIL_BACKEND_TEAM_UPLOAD_FIX.md
```

**Exemple de réponse backend** :
```json
{
  "title": "Unsupported Media Type",
  "status": 415,
  "detail": "Content-Type 'multipart/form-data' is not supported."
}
```

**Fix backend** : Même solution que 400 (`[FromForm]`)

---

### Status 500 (Internal Server Error)

```
❌ CAUSE : Erreur dans le code backend (exception non gérée)
✅ SOLUTION : Vérifier logs backend console
📧 ACTION : Partager logs backend avec équipe
```

**Exemple de réponse backend** :
```json
{
  "title": "An error occurred while processing your request.",
  "status": 500
}
```

**Logs backend à chercher** :
```
System.IO.DirectoryNotFoundException: Could not find path '...'
OU
System.NullReferenceException: Object reference not set...
OU
Microsoft.AspNetCore.Mvc.ModelBinding.ModelBinderAttribute: Failed to bind...
```

---

### Status 200 (OK) mais erreur JavaScript

```
❌ CAUSE : Réponse backend incorrecte (format inattendu)
✅ SOLUTION : Vérifier structure de la réponse
```

**Vérifier dans Network → Response** :
```json
// Attendu ✅
{
  "id": 24,
  "firstName": "Borel",
  "photoUrl": "/uploads/photos/24_abc.jpg"
}

// Incorrect ❌
"Person updated successfully"  ← String au lieu d'objet
```

---

## 🧪 Tests de Diagnostic Rapides

### Test 1 : Upload SANS Photo (JSON Path)

**Objectif** : Vérifier si le problème vient uniquement du multipart

**Steps** :
1. Ouvrir page EditMember
2. Modifier SEULEMENT le prénom (ne pas toucher à la photo)
3. Sauvegarder

**Résultat attendu** :
- ✅ Si ça marche → Problème uniquement avec multipart/FormData
- ❌ Si ça échoue → Problème général backend

---

### Test 2 : Vérifier Backend Endpoint

**Curl Test** (Terminal) :
```bash
# Test JSON classique (sans photo)
curl -X PUT http://localhost:5000/api/persons/24 \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "sex": "M",
    "alive": true,
    "cityID": 1
  }'

# Résultat :
# ✅ 200 OK → Backend fonctionne pour JSON
# ❌ 400/500 → Problème backend général
```

---

### Test 3 : Vérifier Serveur Backend

**Terminal backend** :
```bash
# Vérifier que le backend tourne
curl http://localhost:5000/api/persons

# Résultat :
# ✅ Liste des personnes → Backend OK
# ❌ Connection refused → Backend pas lancé
```

---

## 📋 CHECKLIST DE VÉRIFICATION

### Frontend ✅

- [x] Code modifié (ligne 272 - no Content-Type header)
- [x] Code compile sans erreur
- [x] FormData créé correctement
- [x] Logs détaillés ajoutés
- [ ] **Test** : Status code identifié ?

### Backend ⏳

- [ ] Backend lancé et accessible ?
- [ ] Endpoint `PUT /api/persons/{id}` existe ?
- [ ] Endpoint accepte `[FromForm]` ?
- [ ] Paramètre `IFormFile? photo` présent ?
- [ ] `app.UseStaticFiles()` configuré ?

### Network 🔍

- [ ] **Requête envoyée** : Status code ?
- [ ] **Content-Type** : `multipart/form-data; boundary=...` ?
- [ ] **Request Payload** : FormData visible ?
- [ ] **Response** : Message d'erreur ?

---

## 🚑 SOLUTIONS RAPIDES

### Solution 1 : Backend Non Modifié (Probable)

**Symptôme** : Status 400 ou 415

**Solution Temporaire** : Désactiver upload photo temporairement

```typescript
// EditMember.tsx - ligne 243
const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  setSaving(true);

  try {
    // TEMPORAIRE : Toujours utiliser JSON (ignorer photoFile)
    const payload: any = {
      firstName,
      lastName,
      sex,
      birthday: birthday || null,
      deathDate: deathDate || null,
      alive,
      email: email || null,
      activity: activity || null,
      photoUrl: photoUrl || null,  // ← Utiliser URL existante
      notes: notes || null,
      cityID,
    };
    
    // ... parents ...
    
    await api.put(`/persons/${id}`, payload);  // ← Toujours JSON
```

**Impact** :
- ✅ L'édition des membres fonctionne à nouveau
- ❌ Upload de photo désactivé temporairement
- ⏳ En attendant fix backend

---

### Solution 2 : Backend Port Incorrect

**Symptôme** : Connection refused, CORS error

**Vérification** :
```typescript
// frontend/src/services/api.ts
console.log('API Base URL:', api.defaults.baseURL);
```

**Solution** : Vérifier que le port correspond
```typescript
// Doit être http://localhost:5000 (ou le bon port backend)
```

---

### Solution 3 : CORS Non Configuré

**Symptôme** : CORS policy error dans console

**Solution Backend (Program.cs)** :
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

app.UseCors("AllowAll");  // ← AVANT UseRouting()
app.UseRouting();
```

---

## 📧 ACTIONS RECOMMANDÉES

### 1. Identifier le Code d'Erreur (2 min)

```
➜ Ouvrir F12 → Console
➜ Noter le status code
➜ Copier le message d'erreur complet
```

### 2. Partager avec Backend Team (3 min)

**Email** :
```
Objet: 🔴 URGENT - Erreur Upload Photo (Status ???)

Bonjour,

L'upload photo échoue avec :
- Status Code: ??? (400, 415, 500)
- Message: "..."
- Détails: [copier logs console]

Le frontend est prêt et envoie correctement FormData.
Le backend doit implémenter [FromForm] + IFormFile.

Doc complète: EMAIL_BACKEND_TEAM_UPLOAD_FIX.md

Merci !
```

### 3. Solution Temporaire (5 min)

Si le backend n'est pas dispo rapidement :
- ✅ Désactiver upload photo (forcer JSON)
- ✅ L'édition fonctionne à nouveau
- ⏳ Réactiver après fix backend

---

## 🎯 PROCHAINES ÉTAPES

1. **Maintenant** : Exécuter diagnostic (5 min)
2. **Identifier** : Status code + message erreur
3. **Décider** :
   - Status 400/415 → Envoyer email backend + attendre fix (5 min)
   - Status 500 → Vérifier logs backend + débugger
   - Autre → Investiguer plus

4. **Option** : Solution temporaire (désactiver upload)

---

## 📞 SUPPORT

**Questions** :
- 💬 Slack: #frontend-support, #backend-support
- 📧 Email équipe

**Documentation** :
- 📖 `EMAIL_BACKEND_TEAM_UPLOAD_FIX.md` (email backend)
- 📖 `BUG_CRITIQUE_MULTIPART_FORM_DATA.md` (guide complet)
- 📖 `INDEX_DOCUMENTATION_AVATAR_UPLOAD.md` (navigation)

---

**Diagnostic créé le 23 Novembre 2025**  
*"Un bon diagnostic = 80% de la solution"* 🔍✨

---

## ⚡ TL;DR

1. **F12** → Console + Network
2. **Reproduire** l'erreur
3. **Noter** le status code (400, 415, 500)
4. **Si 400/415** → Backend doit changer `[FromBody]` → `[FromForm]`
5. **Si 500** → Vérifier logs backend
6. **Envoyer** `EMAIL_BACKEND_TEAM_UPLOAD_FIX.md`

**Timeline** : 5 min diagnostic + 5 min fix backend = **10 minutes total**
