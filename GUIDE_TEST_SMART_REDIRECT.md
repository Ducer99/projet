# ✅ GUIDE DE TEST - Smart Redirect Flow

**Date** : 4 décembre 2025  
**Fonctionnalité** : Gestion des utilisateurs "Sans Domicile Familial"  
**Fichiers modifiés** : 5 fichiers (Backend: 2, Frontend: 3)

---

## 🎯 Ce qui a été implémenté

### Backend (.NET)

1. **AuthController.cs** (ligne 69)
   - Ajout du flag `NeedsFamilyOnboarding` dans la réponse de login
   - Détection automatique : `user.FamilyID == null || user.FamilyID == 0`

2. **FamiliesController.cs** (✅ Nouveau fichier - 150 lignes)
   - Endpoint `POST /api/families/create` : Créer une nouvelle famille
   - Endpoint `POST /api/families/join` : Rejoindre via code d'invitation

### Frontend (React + TypeScript)

3. **JoinOrCreateFamily.tsx** (✅ Nouvelle page - 350 lignes)
   - Interface moderne avec 2 options cliquables
   - Formulaires de création/rejoindre
   - Appels API avec Authorization Bearer
   - Mise à jour localStorage automatique
   - Redirections vers /dashboard après succès

4. **AuthContext.tsx** (lignes 6, 24-45)
   - Modification de la signature `login()` pour retourner `{ needsFamilyOnboarding }`
   - Extraction du flag depuis la réponse API (camelCase + PascalCase)

5. **Login.tsx** (lignes 32-60)
   - Smart Redirect Logic après login
   - Si `needsFamilyOnboarding = true` → `/join-or-create-family`
   - Si `needsFamilyOnboarding = false` → `/dashboard`

6. **App.tsx** (lignes 8, 48)
   - Import du composant `JoinOrCreateFamily`
   - Ajout de la route `/join-or-create-family`

---

## 🧪 Tests à effectuer

### Test 1 : Utilisateur avec famille (Scénario nominal)

**Objectif** : Vérifier que les utilisateurs existants avec un FamilyID accèdent directement au Dashboard.

#### Étapes

1. **Ouvrir** : http://localhost:3000/login
2. **Se connecter** avec un compte qui a déjà un FamilyID (ex: `ducer@gmail.com`)
3. **Vérifier** :
   - ✅ Toast de succès "Bienvenue"
   - ✅ Redirection vers `/dashboard` (pas `/join-or-create-family`)
   - ✅ Dashboard s'affiche normalement avec les données de la famille

#### Résultat attendu

```
Login → API Response { needsFamilyOnboarding: false } → /dashboard ✅
```

---

### Test 2 : Utilisateur sans famille - Créer une famille

**Objectif** : Tester le flux complet de création de famille pour un utilisateur SDF.

#### Prérequis

En base de données, créer un utilisateur test avec `FamilyID = null` :

```sql
-- SQL pour créer un utilisateur test sans famille
INSERT INTO "Connexion" 
("Email", "Password", "UserName", "IsActive", "EmailVerified", "FamilyID", "Level", "Role", "CreatedDate")
VALUES 
('sdf@test.com', '$2a$11$hashed_password', 'Test SDF', true, true, NULL, 1, 'Member', NOW());
```

Ou manuellement dans pgAdmin :
- Table `Connexion`
- Trouver un utilisateur existant
- Mettre `FamilyID` à `null`
- Noter l'email de cet utilisateur

#### Étapes

1. **Ouvrir** : http://localhost:3000/login
2. **Se connecter** avec le compte SDF (ex: `sdf@test.com`)
3. **Vérifier** :
   - ✅ Redirection automatique vers `/join-or-create-family`
   - ✅ Page affiche "Bienvenue ! 🎉"
   - ✅ 2 cards visibles : "J'ai un code" et "Créer nouvelle famille"
   
4. **Cliquer** sur "🌳 Créer une nouvelle famille"
5. **Vérifier** :
   - ✅ Formulaire s'affiche avec champ "Nom de la famille"
   - ✅ Bouton "Retour" visible
   
6. **Saisir** : "Famille TEST"
7. **Cliquer** : "Créer ma famille"
8. **Vérifier** :
   - ✅ Toast de succès "Famille créée ! 🎉"
   - ✅ Redirection vers `/dashboard` après 1.5s
   - ✅ Dashboard affiche le nom de la nouvelle famille
   
9. **Vérifier en base de données** :
   ```sql
   SELECT * FROM "Family" WHERE "FamilyName" = 'Famille TEST';
   -- Devrait retourner 1 ligne avec FamilyID (ex: 15)
   
   SELECT "FamilyID", "Role" FROM "Connexion" WHERE "Email" = 'sdf@test.com';
   -- Devrait retourner FamilyID = 15, Role = "Admin"
   ```

#### Résultat attendu

```
Login → needsFamilyOnboarding: true → /join-or-create-family
  → Créer "Famille TEST" → API Success → LocalStorage updated → /dashboard ✅
```

---

### Test 3 : Utilisateur sans famille - Rejoindre une famille

**Objectif** : Tester le flux complet de rejoindre une famille existante.

#### Prérequis

1. Créer un utilisateur SDF (comme Test 2)
2. Connaître un FamilyID existant (ex: `10`)

#### Étapes

1. **Ouvrir** : http://localhost:3000/login
2. **Se connecter** avec le compte SDF
3. **Vérifier** : Redirection vers `/join-or-create-family`
4. **Cliquer** sur "💌 J'ai un code d'invitation"
5. **Vérifier** :
   - ✅ Formulaire s'affiche avec input + icône clé
   - ✅ Placeholder : "Ex: ABC123XYZ ou https://..."
   
6. **Saisir** : "FAMILY_10" (ou juste "10")
7. **Cliquer** : "Rejoindre la famille"
8. **Vérifier** :
   - ✅ Toast de succès "Vous avez rejoint la famille ! 🎉"
   - ✅ Toast affiche le nom de la famille (ex: "Bienvenue dans Famille TOUKEP")
   - ✅ Redirection vers `/dashboard` après 1.5s
   - ✅ Dashboard affiche les données de la famille rejointe
   
9. **Vérifier en base de données** :
   ```sql
   SELECT "FamilyID", "Role" FROM "Connexion" WHERE "Email" = 'sdf@test.com';
   -- Devrait retourner FamilyID = 10, Role = "Member" (pas Admin)
   ```

#### Résultat attendu

```
Login → needsFamilyOnboarding: true → /join-or-create-family
  → Rejoindre "FAMILY_10" → API Success → LocalStorage updated → /dashboard ✅
```

---

### Test 4 : Code d'invitation invalide

**Objectif** : Tester la gestion des erreurs.

#### Étapes

1. **Suivre Test 3** jusqu'à l'étape 6
2. **Saisir** : "FAMILY_99999" (FamilyID inexistant)
3. **Cliquer** : "Rejoindre la famille"
4. **Vérifier** :
   - ✅ Toast d'erreur "Famille introuvable"
   - ✅ Utilisateur reste sur `/join-or-create-family`
   - ✅ Formulaire reste visible (peut réessayer)

#### Résultat attendu

```
API Error 404 → Toast d'erreur → Reste sur la page ✅
```

---

### Test 5 : Utilisateur déjà dans une famille

**Objectif** : Empêcher un utilisateur de créer/rejoindre s'il a déjà un FamilyID.

#### Étapes

1. **Ouvrir** : http://localhost:3000/login
2. **Se connecter** avec un compte qui a déjà un FamilyID
3. **Manuellement naviguer** vers : http://localhost:3000/join-or-create-family
4. **Cliquer** : "Créer une nouvelle famille"
5. **Saisir** : "Famille DOUBLON"
6. **Cliquer** : "Créer ma famille"
7. **Vérifier** :
   - ✅ Toast d'erreur "Vous appartenez déjà à une famille"
   - ✅ Aucun changement en base de données

#### Résultat attendu

```
API Error 400 → Toast d'erreur → Protection contre doublon ✅
```

---

### Test 6 : Bouton Retour

**Objectif** : Tester la navigation entre choix et formulaires.

#### Étapes

1. **Ouvrir** : http://localhost:3000/join-or-create-family
2. **Cliquer** : "Créer une nouvelle famille"
3. **Vérifier** : Formulaire s'affiche
4. **Cliquer** : "Retour"
5. **Vérifier** :
   - ✅ Retour aux 2 cards de choix
   - ✅ Champ "Nom de famille" est vide (reset)
   
6. **Cliquer** : "J'ai un code d'invitation"
7. **Cliquer** : "Retour"
8. **Vérifier** :
   - ✅ Retour aux 2 cards de choix
   - ✅ Champ "Code" est vide (reset)

#### Résultat attendu

```
Navigation fluide avec reset des champs ✅
```

---

### Test 7 : Validation des champs

**Objectif** : Vérifier que les champs obligatoires sont validés.

#### Test 7A : Créer sans nom

1. **Cliquer** : "Créer une nouvelle famille"
2. **Laisser vide** le champ "Nom de la famille"
3. **Cliquer** : "Créer ma famille"
4. **Vérifier** :
   - ✅ Toast warning "Veuillez entrer le nom de votre famille"
   - ✅ Pas d'appel API (console réseau vide)

#### Test 7B : Rejoindre sans code

1. **Cliquer** : "J'ai un code d'invitation"
2. **Laisser vide** le champ "Code"
3. **Cliquer** : "Rejoindre la famille"
4. **Vérifier** :
   - ✅ Toast warning "Veuillez entrer votre code d'invitation"
   - ✅ Pas d'appel API

#### Résultat attendu

```
Validation côté client fonctionne ✅
```

---

### Test 8 : Loading states

**Objectif** : Vérifier les états de chargement pendant les appels API.

#### Étapes

1. **Ouvrir** : Onglet "Network" dans DevTools
2. **Suivre Test 2** ou **Test 3**
3. **Observer** pendant l'appel API :
   - ✅ Bouton affiche "Création..." ou "Connexion..."
   - ✅ Bouton est disabled (grisé)
   - ✅ Bouton "Retour" est disabled
   - ✅ Spinner visible (icône de chargement)
   
4. **Après réponse API** :
   - ✅ Loading disparaît
   - ✅ Toast s'affiche
   - ✅ Redirection se fait

#### Résultat attendu

```
Loading states empêchent double-clic et donnent feedback ✅
```

---

## 🔍 Checklist de validation complète

### Backend

- [ ] AuthController retourne `NeedsFamilyOnboarding` (Test 1 + 2)
- [ ] Flag = `true` quand FamilyID null (Test 2)
- [ ] Flag = `false` quand FamilyID existe (Test 1)
- [ ] POST /api/families/create fonctionne (Test 2)
- [ ] POST /api/families/join fonctionne (Test 3)
- [ ] Erreur 400 si déjà dans famille (Test 5)
- [ ] Erreur 404 si code invalide (Test 4)
- [ ] Authorization Bearer requis (Test 2 + 3)

### Frontend

- [ ] Route `/join-or-create-family` existe (Test 2)
- [ ] Page s'affiche correctement (Test 2)
- [ ] 2 cards cliquables (Test 2)
- [ ] Formulaire "Créer" fonctionne (Test 2)
- [ ] Formulaire "Rejoindre" fonctionne (Test 3)
- [ ] Bouton "Retour" fonctionne (Test 6)
- [ ] Validation champs obligatoires (Test 7)
- [ ] Loading states visibles (Test 8)
- [ ] Toasts de succès/erreur (Test 2-5)
- [ ] LocalStorage mis à jour (Test 2 + 3)
- [ ] Redirection vers /dashboard (Test 2 + 3)
- [ ] Smart Redirect depuis Login (Test 1 + 2)

---

## 📊 Résultats attendus

| Test | Statut | Notes |
|------|--------|-------|
| Test 1 : Utilisateur avec famille | ⏳ À tester | Devrait aller direct au Dashboard |
| Test 2 : Créer famille | ⏳ À tester | FamilyID + Role Admin en base |
| Test 3 : Rejoindre famille | ⏳ À tester | FamilyID + Role Member en base |
| Test 4 : Code invalide | ⏳ À tester | Toast erreur affiché |
| Test 5 : Double famille | ⏳ À tester | Protection API fonctionne |
| Test 6 : Navigation | ⏳ À tester | Bouton Retour reset les champs |
| Test 7 : Validation | ⏳ À tester | Champs obligatoires validés |
| Test 8 : Loading | ⏳ À tester | Spinners et disabled states |

---

## 🐛 Problèmes potentiels & Solutions

### Problème 1 : "Unauthorized" lors de l'appel API

**Symptôme** : Toast d'erreur "Unauthorized" après avoir cliqué "Créer ma famille"

**Cause** : Token JWT manquant ou expiré

**Solution** :
1. Vérifier que `localStorage.getItem('token')` retourne un token
2. Se déconnecter et se reconnecter
3. Vérifier dans DevTools > Application > Local Storage > token

---

### Problème 2 : Redirection ne fonctionne pas

**Symptôme** : Reste sur `/join-or-create-family` après succès

**Cause** : setTimeout non déclenché ou navigate ne fonctionne pas

**Solution** :
1. Vérifier la console pour des erreurs React
2. Vérifier que `useNavigate()` est bien importé
3. Réduire le timeout de 1500ms à 500ms pour test

---

### Problème 3 : FamilyID null en base après création

**Symptôme** : Toast de succès mais FamilyID toujours null

**Cause** : Erreur dans le Backend lors de l'update

**Solution** :
1. Vérifier les logs du backend (terminal "Start Backend API")
2. Chercher des erreurs SQL
3. Vérifier que `await _context.SaveChangesAsync()` est appelé

---

### Problème 4 : "Family already exists"

**Symptôme** : Erreur "Une famille avec ce nom existe déjà"

**Cause** : Contrainte UNIQUE sur FamilyName en base

**Solution** :
- C'est normal si implémenté
- Tester avec un nom différent (ex: "Famille TEST 2")
- Ou supprimer la contrainte UNIQUE si non désirée

---

## 💾 Commandes SQL utiles pour les tests

### Créer un utilisateur SDF

```sql
INSERT INTO "Connexion" 
("Email", "Password", "UserName", "IsActive", "EmailVerified", "FamilyID", "Level", "Role", "CreatedDate")
VALUES 
('sdf@test.com', '$2a$11$N9qo8uLOickgx2ZMRZoMye2wqMdh5lKlCfvLdoG4/ky2xlWz6S4dW', -- password: test123
 'Test SDF', true, true, NULL, 1, 'Member', NOW());
```

### Mettre un utilisateur en SDF

```sql
UPDATE "Connexion" 
SET "FamilyID" = NULL 
WHERE "Email" = 'votre-email@example.com';
```

### Vérifier les familles créées

```sql
SELECT * FROM "Family" 
ORDER BY "CreatedDate" DESC 
LIMIT 10;
```

### Vérifier les membres d'une famille

```sql
SELECT c."Email", c."UserName", c."FamilyID", c."Role", f."FamilyName"
FROM "Connexion" c
LEFT JOIN "Family" f ON c."FamilyID" = f."FamilyID"
WHERE c."FamilyID" = 10; -- Remplacer par votre FamilyID
```

### Supprimer une famille de test

```sql
-- Attention : Supprimer d'abord les membres (mettre FamilyID à null)
UPDATE "Connexion" SET "FamilyID" = NULL WHERE "FamilyID" = 15;

-- Puis supprimer la famille
DELETE FROM "Family" WHERE "FamilyID" = 15;
```

---

## 🎉 Succès confirmé

Une fois tous les tests passés, vous devriez avoir :

✅ **Backend** :
- Flag `NeedsFamilyOnboarding` dans réponse login
- Endpoint `/api/families/create` fonctionnel
- Endpoint `/api/families/join` fonctionnel
- Gestion des erreurs (déjà dans famille, code invalide)
- Autorisation JWT vérifiée

✅ **Frontend** :
- Page `/join-or-create-family` accessible
- Design moderne avec 2 cards cliquables
- Formulaires avec validation
- Loading states et toasts
- Smart Redirect depuis Login
- LocalStorage mis à jour automatiquement
- Navigation fluide vers Dashboard

✅ **Base de données** :
- Nouvelles familles créées avec bon `FamilyID`
- Utilisateurs attachés avec bon `Role` (Admin vs Member)
- Pas de doublons possibles (protection API)

---

## 📞 Support

Si un test échoue :
1. Consulter la section "Problèmes potentiels" ci-dessus
2. Vérifier les logs Backend (terminal)
3. Vérifier la console Browser (DevTools)
4. Vérifier l'onglet Network pour les appels API
5. Vérifier la base de données PostgreSQL

**Fichiers à consulter** :
- `/backend/Controllers/AuthController.cs` (ligne 69)
- `/backend/Controllers/FamiliesController.cs` (lignes 23-137)
- `/frontend/src/pages/JoinOrCreateFamily.tsx`
- `/frontend/src/contexts/AuthContext.tsx` (ligne 24)
- `/frontend/src/pages/Login.tsx` (ligne 47)

---

**Date de création** : 4 décembre 2025  
**Version** : 1.0  
**Status** : ✅ Prêt pour tests manuels
