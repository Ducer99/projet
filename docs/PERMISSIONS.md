# 🔒 Système de Permissions - Kinship Haven

## Vue d'ensemble

L'application utilise un système de rôles pour contrôler l'accès aux fonctionnalités de gestion des membres.

---

## 👥 Rôles disponibles

### 1. **Admin** (`role = "Admin"`)
- **Permissions complètes** sur toute la famille
- Peut **créer** de nouveaux membres
- Peut **modifier** n'importe quel membre
- Peut **supprimer** des membres
- Accès à **MemberForm.tsx** (formulaire complet avec parents)

### 2. **Member** (`role = "Member"`)
- **Permissions limitées** au profil personnel
- Peut **uniquement modifier son propre profil** via MyProfile.tsx
- **Ne peut PAS** modifier d'autres membres
- **Ne peut PAS** accéder à MemberForm.tsx
- Peut **consulter** les fiches des autres membres (lecture seule)

---

## 📋 Matrice des Permissions

| Action | Admin | Member |
|--------|-------|--------|
| **Voir son propre profil** | ✅ | ✅ |
| **Modifier son propre profil** | ✅ | ✅ |
| **Voir les autres membres** | ✅ | ✅ |
| **Modifier les autres membres** | ✅ | ❌ |
| **Ajouter un nouveau membre** | ✅ | ❌ |
| **Supprimer un membre** | ✅ | ❌ |
| **Gérer les liens familiaux (parents)** | ✅ | ❌ |
| **Régénérer le code d'invitation** | ✅ | ❌ |

---

## 🔐 Implémentation technique

### Backend - Modèle `Connexion`

```csharp
public class Connexion
{
    [StringLength(50)]
    public string Role { get; set; } = "Member"; // "Admin" ou "Member"
}
```

### Frontend - Interface `User`

```typescript
export interface User {
  connexionID: number;
  userName: string;
  level: number;
  idPerson: number;
  familyID: number;
  personName: string;
  familyName: string;
  role: string; // "Admin" ou "Member"
}
```

### Vérification du rôle dans les composants

```typescript
import { useAuth } from '../contexts/AuthContext';

const { user } = useAuth();
const isAdmin = user?.role === 'Admin';

// Affichage conditionnel
{isAdmin && (
  <Button onClick={() => navigate('/add-member')}>
    Ajouter un membre
  </Button>
)}

// Protection complète d'une page
if (!isAdmin) {
  return <AccessDenied />;
}
```

---

## 📁 Fichiers protégés

### 1. **MemberForm.tsx** (Admin uniquement)
- **Route** : `/add-member`, `/edit-member/:id`
- **Protection** : Affiche un message d'erreur si non-admin
- **Message** : "🔒 Accès réservé aux administrateurs"

```typescript
const isAdmin = user?.role === 'Admin';

if (!isAdmin) {
  return (
    <Box>
      <Heading>🔒 Accès réservé aux administrateurs</Heading>
      <Text>Vous pouvez uniquement modifier votre propre profil via "Mon Profil".</Text>
    </Box>
  );
}
```

### 2. **PersonsList.tsx** (Boutons conditionnels)
- **Bouton "Ajouter un membre"** : Visible uniquement pour Admin
- **Bouton "Modifier"** (dans la liste) : Visible uniquement pour Admin
- **Bouton "Voir"** : Visible pour tous (lecture seule)

```typescript
{isAdmin && (
  <Button onClick={() => navigate('/add-member')}>
    Ajouter un membre
  </Button>
)}

{isAdmin && (
  <Button onClick={() => navigate(`/edit-member/${person.personID}`)}>
    Modifier
  </Button>
)}
```

### 3. **MyProfile.tsx** (Tous les utilisateurs)
- **Route** : `/my-profile`
- **Protection** : Aucune (tous les utilisateurs connectés)
- **Comportement** : Modifie **uniquement** le profil de l'utilisateur connecté
- **Parents** : Affichage en **lecture seule**

---

## 🔄 Flux utilisateur

### 👤 Membre normal (Member)

1. **Inscription** → Création compte avec `role = "Member"`
2. **CompleteProfile.tsx** → Renseigne ses informations personnelles (sans parents)
3. **Dashboard** → Accès au tableau de bord
4. **Mon Profil** (MyProfile.tsx) → Peut modifier son propre profil
5. **Liste Membres** → Peut **voir** les autres membres (bouton "Voir")
6. **Fiche Membre** → Consultation en **lecture seule**

❌ **Ne peut PAS** :
- Ajouter un nouveau membre
- Modifier un autre membre
- Gérer les liens familiaux (parents)

### 🔑 Administrateur (Admin)

1. **Inscription** → Création compte avec `role = "Admin"` (ou promotion ultérieure)
2. **CompleteProfile.tsx** → Renseigne ses informations personnelles
3. **Dashboard** → Accès au tableau de bord avec options admin
4. **Mon Profil** → Peut modifier son propre profil
5. **Liste Membres** → Voit les boutons **"Ajouter"** et **"Modifier"**
6. **MemberForm.tsx** → Peut créer/modifier **n'importe quel membre**
7. **Gestion Parents** → Peut lier les parents via dropdown ou saisie manuelle

✅ **Peut TOUT faire** :
- Ajouter des membres
- Modifier tous les membres
- Supprimer des membres
- Gérer les liens familiaux
- Régénérer les codes d'invitation

---

## 🛡️ Sécurité additionnelle

### Backend (à implémenter)

Pour renforcer la sécurité, ajouter des vérifications côté backend :

```csharp
[HttpPut("{id}")]
[Authorize]
public async Task<IActionResult> UpdatePerson(int id, [FromBody] Person updatedPerson)
{
    var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    var connexion = await _context.Connexions.FindAsync(int.Parse(userIdClaim));
    
    // Vérifier que c'est un admin OU que l'utilisateur modifie son propre profil
    if (connexion.Role != "Admin" && connexion.IDPerson != id)
    {
        return Forbid("Vous ne pouvez modifier que votre propre profil");
    }
    
    // ... suite de la logique
}
```

### Routes protégées

Ajouter un **PrivateRoute** avec vérification de rôle :

```typescript
// frontend/src/components/AdminRoute.tsx
export const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  
  if (user?.role !== 'Admin') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

// Dans App.tsx
<Route path="/add-member" element={
  <AdminRoute>
    <MemberForm />
  </AdminRoute>
} />
```

---

## 📝 Résumé des 3 formulaires

### 1️⃣ **CompleteProfile.tsx** (Tous - Inscription)
- **Utilisateurs** : Tous les nouveaux inscrits
- **Champs** : Tous les champs personnels **SAUF parents**
- **Parents** : ❌ Aucun champ parent
- **Usage** : Compléter le profil après inscription

### 2️⃣ **MyProfile.tsx** (Tous - Mon profil)
- **Utilisateurs** : Tous les utilisateurs connectés
- **Champs** : Tous les champs personnels
- **Parents** : ✅ Affichage en **lecture seule**
- **Usage** : Modifier son propre profil

### 3️⃣ **MemberForm.tsx** (Admin uniquement - Gestion)
- **Utilisateurs** : **Administrateurs uniquement**
- **Champs** : Tous les champs personnels
- **Parents** : ✅ **Modifiables** (dropdown + saisie manuelle)
- **Usage** : Ajouter/modifier n'importe quel membre de la famille

---

## ✅ Checklist de sécurité

- [x] Champ `role` ajouté dans le modèle `Connexion` (Backend)
- [x] Interface `User` inclut le champ `role` (Frontend)
- [x] MemberForm.tsx protégé avec vérification `isAdmin`
- [x] Bouton "Ajouter un membre" caché pour non-admin (PersonsList)
- [x] Bouton "Modifier" caché pour non-admin (PersonsList)
- [x] MyProfile.tsx accessible à tous (profil personnel uniquement)
- [ ] **TODO** : Protections côté backend (API endpoints)
- [ ] **TODO** : Composant AdminRoute pour les routes protégées
- [ ] **TODO** : Tests unitaires des permissions

---

## 🎯 Recommandations

1. **Toujours vérifier les permissions côté backend** (ne jamais faire confiance au frontend seul)
2. **Journaliser les actions admin** (création, modification, suppression de membres)
3. **Limiter le nombre d'admins** (1-2 par famille maximum)
4. **Permettre aux admins de promouvoir/rétrograder** des membres (interface dédiée)
5. **Ajouter une page "Gestion des accès"** pour les admins (liste des membres avec leurs rôles)

---

**Date de création** : 8 octobre 2025  
**Dernière mise à jour** : 8 octobre 2025
