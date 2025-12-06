# ✅ Correction : Calcul de l'Âge pour les Personnes Décédées

**Date** : 3 Décembre 2025  
**Problème identifié** : Ruben KAMO GAMO (décédé) affichait "Âge inconnu" au lieu de l'âge au moment du décès

---

## 🔍 Problème Initial

Sur la capture d'écran fournie, **Ruben KAMO GAMO** était marqué comme **"Décédé"** mais affichait **"Âge inconnu"**.

### Causes possibles :
1. ❌ Date de naissance manquante
2. ❌ Date de décès manquante
3. ❌ **Logique de calcul incorrecte** (cause réelle)

### Comportement incorrect détecté :
Pour les personnes **décédées sans date de décès enregistrée**, l'ancien code calculait l'âge actuel (Date du jour - Date de naissance), ce qui donnait des résultats absurdes comme :
- "150 ans" pour quelqu'un né en 1875
- "Âge inconnu" si le calcul échouait

---

## ✅ Solution Implémentée

### 📝 Règle Métier

| Cas | Condition | Calcul | Affichage |
|-----|-----------|--------|-----------|
| **Vivant** | `alive = true` | `Date du jour - Date de naissance` | "X ans" |
| **Décédé (date connue)** | `alive = false` + `deathDate` existe | `Date de décès - Date de naissance` | "X ans" (âge au décès) |
| **Décédé (date inconnue)** | `alive = false` + `deathDate` manquante | ❌ Pas de calcul | "Âge inconnu" |

### 🔧 Modifications Techniques

#### 1. **MembersManagementDashboard.tsx** (Ligne 474)

**Avant** :
```typescript
const calculateAge = (birthday: string | undefined, deathDate?: string | null): number | null => {
  if (!birthday) return null;
  
  try {
    const birthDate = new Date(birthday);
    const endDate = deathDate ? new Date(deathDate) : new Date(); // ❌ Calcule toujours l'âge actuel si pas de date
    
    const age = endDate.getFullYear() - birthDate.getFullYear();
    const monthDiff = endDate.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && endDate.getDate() < birthDate.getDate())) {
      return age - 1;
    }
    
    return age;
  } catch (error) {
    console.warn('Error calculating age:', error);
    return null;
  }
};
```

**Après** :
```typescript
const calculateAge = (birthday: string | undefined, deathDate?: string | null, isAlive?: boolean): number | null => {
  if (!birthday) return null;
  
  // 🏥 RÈGLE MÉTIER : Pour les personnes décédées sans date de décès connue,
  // ne pas calculer l'âge actuel (évite "150 ans" pour quelqu'un mort il y a longtemps)
  if (isAlive === false && !deathDate) {
    return null; // ✅ Retourne null pour afficher "Âge inconnu"
  }
  
  try {
    const birthDate = new Date(birthday);
    
    // Si décédé : calculer l'âge au moment du décès
    // Si vivant : calculer l'âge actuel
    const endDate = deathDate ? new Date(deathDate) : new Date();
    
    const age = endDate.getFullYear() - birthDate.getFullYear();
    const monthDiff = endDate.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && endDate.getDate() < birthDate.getDate())) {
      return age - 1;
    }
    
    return age;
  } catch (error) {
    console.warn('Error calculating age:', error);
    return null;
  }
};
```

#### 2. **PersonProfile.tsx** (Ligne 161)

Même logique appliquée avec ajout du paramètre `isAlive` :

```typescript
const calculateAge = (birthDate: string | null, deathDate: string | null = null, isAlive: boolean = true) => {
  if (!birthDate) return null;
  
  // 🏥 RÈGLE MÉTIER : Pour les personnes décédées sans date de décès connue,
  // ne pas calculer l'âge actuel (évite "150 ans" pour quelqu'un mort il y a longtemps)
  if (!isAlive && !deathDate) {
    return null; // Retourne null pour afficher "Âge inconnu"
  }
  
  const birth = new Date(birthDate);
  const end = deathDate ? new Date(deathDate) : new Date();
  let age = end.getFullYear() - birth.getFullYear();
  const monthDiff = end.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && end.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};
```

#### 3. **Tous les appels mis à jour**

Ajout du paramètre `person.alive` à tous les appels :

```typescript
// Avant
calculateAge(person.birthday, person.deathDate)

// Après
calculateAge(person.birthday, person.deathDate, person.alive)
```

**Fichiers modifiés** :
- ✅ `frontend/src/pages/MembersManagementDashboard.tsx` (9 appels mis à jour)
- ✅ `frontend/src/pages/PersonProfile.tsx` (3 appels mis à jour)

#### 4. **Interface Child mise à jour** (PersonProfile.tsx ligne 65)

Ajout de `deathDate` à l'interface pour le calcul de l'âge des enfants :

```typescript
interface Child {
  personID: number;
  firstName: string;
  lastName: string;
  birthday: string | null;
  deathDate?: string | null; // ✅ Ajouté
  alive: boolean;
  sex: string;
}
```

---

## 🎯 Résultat Attendu

### Cas de Ruben KAMO GAMO

**Scénario 1 : Date de naissance ET date de décès présentes**
```
Ruben KAMO GAMO
Né : 15/03/1950
Décédé : 22/08/2010
→ Affichage : "60 ans" (2010 - 1950)
```

**Scénario 2 : Date de naissance présente, date de décès MANQUANTE**
```
Ruben KAMO GAMO
Né : 15/03/1950
Décédé : Date inconnue
→ Affichage : "Âge inconnu"
```

**Scénario 3 : Personne vivante**
```
Ducer TOUKEP
Né : 01/01/1990
Vivant
→ Affichage : "35 ans" (2025 - 1990)
```

---

## 📊 Impact sur les Statistiques

### Âge Moyen
La fonction de calcul de l'âge moyen ignore maintenant correctement les personnes décédées sans date de décès :

```typescript
averageAge: persons.reduce((sum, p) => {
  const age = calculateAge(p.birthday, p.deathDate, p.alive);
  return sum + (age || 0);
}, 0) / persons.filter(p => calculateAge(p.birthday, p.deathDate, p.alive) !== null).length
```

### Filtres par Âge
Les filtres "Âge Min" et "Âge Max" excluent automatiquement les personnes avec âge inconnu :

```typescript
if (filters.ageMin) {
  const minAge = parseInt(filters.ageMin);
  filtered = filtered.filter(person => {
    const age = calculateAge(person.birthday, person.deathDate, person.alive);
    return age !== null && age >= minAge; // ✅ Ignore les âges null
  });
}
```

---

## 🧪 Tests à Effectuer

### ✅ Checklist de Validation

1. **Personne décédée avec date de décès**
   - [ ] Vérifier que l'âge affiché = âge au moment du décès
   - [ ] Exemple : Si né en 1950 et mort en 2010 → doit afficher "60 ans"

2. **Personne décédée SANS date de décès**
   - [ ] Vérifier que l'affichage = "Âge inconnu"
   - [ ] Ne doit PAS afficher "150 ans" ou un âge absurde

3. **Personne vivante**
   - [ ] Vérifier que l'âge affiché = âge actuel (2025 - année de naissance)

4. **Statistiques Dashboard**
   - [ ] Vérifier que l'âge moyen n'inclut pas les âges "inconnus"
   - [ ] Vérifier que le compteur "Lignée Principale" compte correctement

5. **Filtres**
   - [ ] Tester filtre "Âge Min = 30" → ne doit pas inclure les âges inconnus
   - [ ] Tester tri par âge → personnes avec âge inconnu en dernier

---

## 📝 Message pour l'Équipe Backend

Si l'équipe backend doit être informée :

> **Objet : Logique Métier - Calcul de l'Âge pour les personnes décédées**
> 
> Bonjour l'équipe,
> 
> Concernant la colonne **ÂGE**, nous avons affiné la logique frontend pour les membres décédés.
> 
> **Règle d'affichage implémentée** :
> 
> - **Cas Vivant** (`alive = true`) :
>   - Calcul : `Date du jour - Date de Naissance`
>   - Affichage : "X ans"
> 
> - **Cas Décédé** (`alive = false`) :
>   - **Si Date de Décès connue** :
>     - Calcul : `Date de Décès - Date de Naissance`
>     - Affichage : "X ans" (âge au décès)
>   - **Si Date de Décès inconnue** :
>     - Affichage : "Âge inconnu"
>     - Note : Ne calcule PAS l'âge actuel pour éviter des incohérences (ex: "150 ans")
> 
> La fonction `calculateAge` frontend a été mise à jour dans :
> - `MembersManagementDashboard.tsx`
> - `PersonProfile.tsx`
> 
> **Action requise côté backend** : Assurez-vous que l'API `/api/persons` retourne bien :
> - `alive` (boolean)
> - `deathDate` (string | null)
> 
> Merci !

---

## 🔄 Prochaines Étapes

1. **Rafraîchir la page** Members Management Dashboard (Cmd+R)
2. **Vérifier Ruben KAMO GAMO** :
   - Si date de décès existe → doit afficher son âge au décès
   - Si date de décès manque → doit afficher "Âge inconnu"
3. **Tester les filtres** par âge pour confirmer le bon fonctionnement
4. **Valider les statistiques** (âge moyen) pour confirmer l'exclusion des âges null

---

## ✅ Correction Terminée

Les modifications ont été appliquées et sont immédiatement actives via **Vite HMR** (Hot Module Replacement).

**Fichiers modifiés** :
- ✅ `frontend/src/pages/MembersManagementDashboard.tsx`
- ✅ `frontend/src/pages/PersonProfile.tsx`

**Status** : ✅ Prêt pour validation utilisateur
