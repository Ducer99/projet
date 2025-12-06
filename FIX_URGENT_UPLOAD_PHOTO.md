# 🔥 FIX URGENT : Upload Photo (2 lignes à changer)

**Date** : 23 Novembre 2025  
**Temps fix** : 5 minutes  
**Impact** : 🔴 **CRITIQUE** - Feature bloquée

---

## 🎯 Résumé Ultra-Court

**Problème** : Upload photo échoue (400/415/500)

**Cause** : Backend attend JSON, reçoit multipart/form-data

**Solution** : 2 modifications backend

---

## ✅ Frontend (Déjà Corrigé)

```typescript
// ✅ CORRECT (ligne 272 - EditMember.tsx)
await api.put(`/persons/${id}`, formData);
// ⚠️ Pas de header Content-Type (auto-généré)
```

---

## ⏳ Backend (À Corriger - 5 minutes)

### Modification 1 : Controller (2 lignes)

**Avant** (❌ Erreur) :
```csharp
[HttpPut("{id}")]
public async Task<IActionResult> UpdatePerson(int id, [FromBody] PersonUpdateDto dto)
```

**Après** (✅ Correct) :
```csharp
[HttpPut("{id}")]
public async Task<IActionResult> UpdatePerson(int id, [FromForm] PersonUpdateDto dto, [FromForm] IFormFile? photo)
//                                                      ^^^^^^^^                        ^^^^^^^^^^^^^^^^^^^^^^^^
//                                                      1. [FromForm]                   2. Ajouter paramètre photo
```

### Modification 2 : Traiter le Fichier

```csharp
if (photo != null && photo.Length > 0)
{
    // Validation
    if (!photo.ContentType.StartsWith("image/"))
        return BadRequest("Type invalide");
    if (photo.Length > 5 * 1024 * 1024)
        return BadRequest("Trop gros (max 5 MB)");
    
    // Sauvegarde
    var fileName = $"{id}_{Guid.NewGuid()}{Path.GetExtension(photo.FileName)}";
    var uploadsFolder = Path.Combine(_env.WebRootPath, "uploads", "photos");
    Directory.CreateDirectory(uploadsFolder);
    var filePath = Path.Combine(uploadsFolder, fileName);
    
    using (var stream = new FileStream(filePath, FileMode.Create))
    {
        await photo.CopyToAsync(stream);
    }
    
    person.PhotoUrl = $"/uploads/photos/{fileName}";
}
```

### Modification 3 : Program.cs (1 ligne)

```csharp
var app = builder.Build();

app.UseStaticFiles();  // ← Ajouter cette ligne (pour servir /uploads/photos)

app.UseRouting();
// ...
```

---

## 🧪 Test Rapide

1. **Upload photo** → ✅ Status 200 OK
2. **Fichier créé** → `backend/wwwroot/uploads/photos/24_abc.jpg`
3. **Accessible** → `http://localhost:5000/uploads/photos/24_abc.jpg`

---

## 📊 Timeline

| Tâche | Temps |
|-------|-------|
| Changer [FromBody] → [FromForm] | 30 sec |
| Ajouter IFormFile? photo | 30 sec |
| Implémenter logique sauvegarde | 3 min |
| Ajouter UseStaticFiles() | 30 sec |
| Test | 1 min |
| **TOTAL** | **~5 min** |

---

## 📂 Fichiers Modifiés

- ✅ `frontend/src/pages/EditMember.tsx` (ligne 272) - Déjà corrigé
- ⏳ `backend/Controllers/PersonsController.cs` - À modifier
- ⏳ `backend/Program.cs` - Ajouter UseStaticFiles()

---

## 🔗 Documentation Complète

Voir : **`BUG_CRITIQUE_MULTIPART_FORM_DATA.md`**
- Code backend complet (80 lignes)
- Tests de validation
- Erreurs courantes
- Debugging guide

---

**Fix créé le 23 Novembre 2025**  
*"2 lignes changées = Feature débloquée"* 🚀
