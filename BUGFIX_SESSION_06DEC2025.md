# 🐛 Session de Correction de Bugs - 6 Décembre 2025

## 📋 Résumé
Session de débogage et correction de l'inscription utilisateur et du système d'authentification JWT.

---

## ✅ Bugs Corrigés

### 1. **Token "fantôme" sur routes publiques**
**Problème** : L'intercepteur Axios ajoutait systématiquement un token (même périmé) sur toutes les requêtes, y compris les routes publiques comme `/auth/register-simple` et `/auth/login`.

**Impact** : 
- Erreurs 401/403 sur l'inscription
- Loading infini lors de l'inscription
- Serveur tentait de valider un token invalide

**Solution** :
- Modification de `frontend/src/services/api.ts`
- Ajout d'une liste de routes publiques exclues de l'authentification
- Routes exclues : `/auth/login`, `/auth/register`, `/auth/register-simple`, `/auth/google-login`

**Code** :
```typescript
const publicRoutes = ['/auth/login', '/auth/register', '/auth/register-simple', '/auth/google-login'];
const isPublicRoute = publicRoutes.some(route => config.url?.includes(route));

if (token && !isPublicRoute) {
  config.headers.Authorization = `Bearer ${token}`;
}
```

---

### 2. **Erreur 404 sur `/families/join`**
**Problème** : Mismatch de casse entre frontend et backend
- Frontend : `/api/families/join` (minuscule)
- Backend : `/api/Families/join` (majuscule via `[Route("api/[controller]")]`)

**Impact** : 404 Not Found à l'étape 3 de l'inscription

**Solution** :
- Modification de `backend/Controllers/FamiliesController.cs`
- Route explicite en minuscules : `[Route("api/families")]`

**Code** :
```csharp
[ApiController]
[Route("api/families")] // ⭐ Minuscule pour correspondre au frontend
[Authorize]
public class FamiliesController : ControllerBase
```

---

### 3. **Code d'invitation vide (InvitationCode vs inviteCode)**
**Problème** : Mismatch de noms de propriétés
- Frontend envoyait : `{ inviteCode: "KAM-6644" }` (camelCase)
- Backend attendait : `{ InvitationCode: "KAM-6644" }` (PascalCase)

**Impact** : Code d'invitation vide côté backend → famille introuvable

**Solution** :
- Modification de `frontend/src/pages/Register.tsx`
- Envoi avec la bonne casse : `InvitationCode` (PascalCase)

**Code** :
```typescript
await api.post('/families/join', { 
  InvitationCode: inviteCode.toUpperCase() 
});
```

---

### 4. **Redirection vers `/login` après inscription**
**Problème** : Le `PrivateRoute` vérifie `isAuthenticated` du contexte, mais après l'inscription, le contexte n'est pas encore à jour même si le token est dans localStorage.

**Impact** : L'utilisateur est redirigé vers `/login` au lieu du dashboard

**Solution A - Register.tsx** :
- Sauvegarde de l'utilisateur dans localStorage après `complete-profile`

```typescript
if (profileResponse.data.user) {
  localStorage.setItem('user', JSON.stringify(profileResponse.data.user));
}
```

**Solution B - PrivateRoute.tsx** :
- Vérification AUSSI du localStorage en plus du contexte

```typescript
const hasToken = !!localStorage.getItem('token');
const hasUser = !!localStorage.getItem('user');
const isAuthenticatedWithLocalStorage = hasToken && hasUser;
const shouldAllowAccess = isAuthenticated || isAuthenticatedWithLocalStorage;
```

---

### 5. **Intercepteur API trop strict (401 sur routes non-critiques)**
**Problème** : L'intercepteur déconnectait l'utilisateur sur TOUTE erreur 401, même sur des routes optionnelles comme `/auth/family-info`.

**Impact** : Déconnexion intempestive juste après l'inscription

**Solution** :
- Ajout d'une liste de routes non-critiques
- Pas de déconnexion si l'erreur 401 vient d'une route non-critique

**Code** :
```typescript
const nonCriticalRoutes = ['/auth/family-info', '/events/upcoming', '/persons/tree'];
const isNonCritical = nonCriticalRoutes.some(route => error.config?.url?.includes(route));

if (!isNonCritical) {
  // Déconnecter uniquement si route critique
  localStorage.removeItem('token');
  window.location.href = '/login';
}
```

---

### 6. **🔴 CRITIQUE : FamilyID manquant dans le token JWT**
**Problème** : Le token JWT ne contenait pas le `familyId` après l'inscription
- Étape 2 (`complete-profile`) génère un token avec `familyId = 0`
- Étape 3 (`families/join`) met à jour la BDD mais **ne régénère PAS le token**
- Le Dashboard filtre `/persons` par `familyId` du token → aucun membre retourné

**Impact** : **L'utilisateur inscrit n'apparaît pas dans les membres de la famille**

**Solution** :

**A. Backend - FamiliesController.cs** :
1. Ajout de `IConfiguration` pour générer les tokens
2. Ajout de la méthode `GenerateJwtToken()`
3. `/families/create` retourne un nouveau token avec `familyId`
4. `/families/join` retourne un nouveau token avec `familyId`

**Code** :
```csharp
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
```

**B. Frontend - Register.tsx** :
- Sauvegarde du nouveau token après `/families/create`
- Sauvegarde du nouveau token après `/families/join`

**Code** :
```typescript
const joinResponse = await api.post('/families/join', { 
  InvitationCode: inviteCode.toUpperCase() 
});

// 🔑 BUGFIX: Sauvegarder le nouveau token avec FamilyID mis à jour
if (joinResponse.data.token) {
  localStorage.setItem('token', joinResponse.data.token);
  console.log('🔑 Token updated with FamilyID after joining family');
}
```

---

## 🧪 Tests de Validation

### Test 1 : Inscription complète
1. ✅ Créer un compte avec email + mot de passe
2. ✅ Compléter le profil (prénom, nom, sexe)
3. ✅ Rejoindre une famille avec code d'invitation
4. ✅ Redirection vers le dashboard
5. ✅ **Vérifier que l'utilisateur apparaît dans les membres**

### Test 2 : Token JWT valide
1. ✅ Après inscription, vérifier le token dans localStorage
2. ✅ Décoder le token JWT (jwt.io)
3. ✅ Vérifier que `familyId` > 0
4. ✅ Vérifier que `personId` > 0

### Test 3 : API /persons
1. ✅ Appeler `/persons` depuis le Dashboard
2. ✅ Vérifier que la liste contient l'utilisateur inscrit
3. ✅ Vérifier que le filtre par `familyId` fonctionne

---

## 📝 Notes Importantes

### Erreur `content_script.js`
- ⚠️ **FAUSSE PISTE** : Cette erreur vient d'une extension de navigateur (gestionnaire de mots de passe, bloqueur de pub, Google Traduction)
- ✅ **Solution** : Tester en navigation privée pour confirmer
- Ne PAS perdre de temps à déboguer cette erreur

### Pour déboguer les problèmes de token
```typescript
// Vérifier le token dans la console
const token = localStorage.getItem('token');
console.log('Token:', token);

// Décoder le token (sans vérification de signature)
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('Token payload:', payload);
// Doit contenir: { id, familyId, personId, ... }
```

### Logs backend utiles
```csharp
Console.WriteLine($"🔑 Nouveau token généré avec FamilyID: {user.FamilyID}");
Console.WriteLine($"🔍 Recherche famille avec code: {invitationCode}");
Console.WriteLine($"✅ Famille trouvée: {family.FamilyName} (ID: {family.FamilyID})");
```

---

## 🎯 Prochaines Étapes (si problème persiste)

1. **Nettoyer le localStorage**
   - Supprimer `token` et `user`
   - S'inscrire avec un NOUVEL email

2. **Vérifier le token après inscription**
   ```javascript
   const token = localStorage.getItem('token');
   const payload = JSON.parse(atob(token.split('.')[1]));
   console.log('FamilyID dans le token:', payload.familyId);
   ```

3. **Vérifier les logs backend**
   - Chercher : `🔑 Nouveau token généré avec FamilyID:`
   - Si absent, le backend n'a pas été redémarré

4. **Vérifier la requête /persons**
   ```javascript
   // Dans la console du Dashboard
   api.get('/persons').then(r => console.log('Membres:', r.data));
   ```

---

## 📊 Récapitulatif des Fichiers Modifiés

### Frontend
- ✅ `frontend/src/services/api.ts` - Intercepteur API
- ✅ `frontend/src/pages/Register.tsx` - Sauvegarde tokens
- ✅ `frontend/src/components/PrivateRoute.tsx` - Vérification localStorage
- ✅ `frontend/src/pages/Dashboard.tsx` - Logs de débogage

### Backend
- ✅ `backend/Controllers/AuthController.cs` - Logs register-simple
- ✅ `backend/Controllers/FamiliesController.cs` - Génération token JWT

---

## ✨ Résultat Final

**Avant** : L'inscription échouait à plusieurs étapes et l'utilisateur n'apparaissait jamais dans les membres.

**Après** : 
- ✅ Inscription fluide en 3 étapes
- ✅ Redirection automatique vers le dashboard
- ✅ Token JWT valide avec `familyId`
- ✅ Utilisateur visible dans la liste des membres
- ✅ Toutes les fonctionnalités du dashboard opérationnelles

---

*Session de débogage : 6 Décembre 2025*
*Durée : ~2 heures*
*Bugs critiques résolus : 6*
