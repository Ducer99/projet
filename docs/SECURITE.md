# 🔒 Sécurité et Confidentialité

## Modèle de Sécurité : PRIVÉ par Famille

### Principe de Base

**Chaque famille est isolée et privée.**
- ✅ Un utilisateur ne peut voir QUE sa propre famille
- ❌ Un utilisateur NE peut PAS voir les autres familles
- ❌ Aucun accès cross-famille autorisé

---

## 🛡️ Protection Implémentée

### 1. Authentification JWT
Chaque utilisateur reçoit un token JWT contenant :
```json
{
  "personId": "5",
  "familyId": "1",
  "email": "lucas.dupont@example.com"
}
```

### 2. Autorisation par FamilyID

Tous les endpoints vérifient que `user.FamilyID == requested.FamilyID`

#### Endpoints Protégés :

| Endpoint | Protection | Vérification |
|----------|-----------|--------------|
| `GET /api/familytree/full/{familyId}` | ✅ | Vérifie que `familyId == user.FamilyID` |
| `GET /api/familytree/my-branch/{personId}` | ✅ | Vérifie que `person.FamilyID == user.FamilyID` |
| `GET /api/familytree/search/{familyId}` | ✅ | Vérifie que `familyId == user.FamilyID` |
| `GET /api/familytree/roots/{familyId}` | ✅ | Vérifie que `familyId == user.FamilyID` |
| `GET /api/familytree/descendants/{personId}` | ✅ | Vérifie que `person.FamilyID == user.FamilyID` |
| `GET /api/persons/{id}` | ✅ | Vérifie que `person.FamilyID == user.FamilyID` |
| `GET /api/persons/family/{familyId}` | ✅ | Vérifie que `familyId == user.FamilyID` |

---

## 🧪 Tests de Sécurité

### Test 1 : Accès à sa propre famille ✅

```bash
# Lucas (FamilyID=1) accède à sa famille
curl -H "Authorization: Bearer <token_lucas>" \
     http://localhost:5000/api/familytree/full/1

# Résultat : 200 OK - Succès
```

### Test 2 : Accès à une autre famille ❌

```bash
# Lucas (FamilyID=1) essaie d'accéder à FamilyID=2
curl -H "Authorization: Bearer <token_lucas>" \
     http://localhost:5000/api/familytree/full/2

# Résultat : 403 Forbidden - Accès refusé
```

### Test 3 : Accès à une personne d'une autre famille ❌

```bash
# Lucas (FamilyID=1) essaie d'accéder à PersonID=100 (FamilyID=2)
curl -H "Authorization: Bearer <token_lucas>" \
     http://localhost:5000/api/persons/100

# Résultat : 403 Forbidden - Accès refusé
```

---

## 🔐 Code de Vérification

### Backend (C#)
Chaque endpoint protégé contient :

```csharp
// Extraire le FamilyID du token JWT
var userFamilyId = int.Parse(User.FindFirst("familyId")?.Value ?? "0");

// Vérifier l'autorisation
if (userFamilyId != familyId)
{
    return Forbid(); // 403 Forbidden - Accès refusé
}
```

### Frontend (TypeScript)
Le FamilyID est stocké dans le contexte d'authentification :

```typescript
const { user } = useAuth();
// user.familyId est utilisé automatiquement pour tous les appels API
```

---

## 🚨 Codes d'Erreur

| Code | Signification | Raison |
|------|--------------|--------|
| `401 Unauthorized` | Non authentifié | Token JWT manquant ou invalide |
| `403 Forbidden` | Accès refusé | Tentative d'accès à une autre famille |
| `404 Not Found` | Ressource non trouvée | PersonID ou FamilyID n'existe pas |

---

## 📋 Scénarios d'Utilisation

### Scénario 1 : Famille Dupont (FamilyID=1)

**Membres :**
- Jean (PersonID=1)
- Marie (PersonID=2)
- Pierre (PersonID=3)
- Lucas (PersonID=5) - connecté
- Emma (PersonID=6)

**Lucas peut :**
- ✅ Voir l'arbre complet de la famille Dupont (FamilyID=1)
- ✅ Voir le profil de Pierre, Jean, Marie, Emma
- ✅ Chercher dans sa famille
- ✅ Voir ses ancêtres et descendants

**Lucas ne peut PAS :**
- ❌ Voir la famille Martin (FamilyID=2)
- ❌ Voir le profil d'une personne de la famille Martin
- ❌ Chercher dans d'autres familles

### Scénario 2 : Famille Martin (FamilyID=2)

**Membres :**
- Paul (PersonID=10)
- Sophie (PersonID=11) - connectée

**Sophie peut :**
- ✅ Voir l'arbre complet de la famille Martin (FamilyID=2)
- ✅ Voir le profil de Paul

**Sophie ne peut PAS :**
- ❌ Voir la famille Dupont (FamilyID=1)
- ❌ Voir Lucas, Pierre, Jean, etc.

---

## 🔒 Isolation Garantie

### Base de Données
```sql
-- Toutes les requêtes incluent un filtre FamilyID
SELECT * FROM "Person" WHERE "FamilyID" = 1;
SELECT * FROM "Wedding" w 
  JOIN "Person" p ON w."ManID" = p."PersonID" 
  WHERE p."FamilyID" = 1;
```

### Cache et Mémoire
- Aucun cache cross-famille
- Chaque requête vérifie l'autorisation

### Logs
- Les tentatives d'accès non autorisé sont rejetées silencieusement (403)
- Aucune information de l'autre famille n'est divulguée

---

## 🎯 Bonnes Pratiques

### Pour les Développeurs

1. **Toujours vérifier le FamilyID** dans les nouveaux endpoints
2. **Utiliser `[Authorize]`** sur tous les contrôleurs sensibles
3. **Extraire le FamilyID du token JWT**, jamais du paramètre de requête seul
4. **Retourner `Forbid()`** en cas d'accès non autorisé
5. **Ne jamais divulguer** d'informations sur l'existence d'autres familles

### Pour les Utilisateurs

1. **Se connecter avec son propre compte** (email/password)
2. **Le système affiche automatiquement votre famille**
3. **Aucune action requise pour la sécurité** - c'est transparent
4. **Vos données familiales sont privées** et protégées

---

## 🚀 Évolution Future (Non Implémenté)

Si besoin de partager des arbres entre familles :

### Option A : Invitations
- Système d'invitation par email
- Permissions granulaires (lecture seule, modification, admin)
- Révocation possible

### Option B : Arbres Publics
- Possibilité de rendre certaines branches publiques
- Contrôle fin par personne ou génération
- Mode anonyme (dates visibles, noms masqués)

### Option C : Fusion de Familles
- Mariages inter-familles
- Liens entre arbres distincts
- Gestion des permissions complexes

**Pour l'instant : PRIVÉ UNIQUEMENT 🔒**

---

## ✅ Checklist de Sécurité

- [x] JWT avec FamilyID dans les claims
- [x] Vérification FamilyID sur tous les endpoints
- [x] Retour 403 Forbidden en cas d'accès non autorisé
- [x] Filtrage WHERE FamilyID dans toutes les requêtes SQL
- [x] Aucun cache cross-famille
- [x] Tests de sécurité documentés
- [x] Documentation utilisateur claire

**Statut : Sécurité ACTIVE et TESTÉE ✅**
