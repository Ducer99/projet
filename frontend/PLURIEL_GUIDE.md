# Guide d'utilisation du système de pluriel et accord

## 📚 Vue d'ensemble

Ce guide explique comment utiliser le système de pluralisation et d'accord grammatical dans l'application Family Tree.

## 🎯 Problème résolu

Avant :
- ❌ "1 membres" (incorrect)
- ❌ "5 personne" (incorrect)
- ❌ "Voir tous les événements (0)" (redondant)

Après :
- ✅ "1 membre" (correct)
- ✅ "5 membres" (correct)
- ✅ "Voir les 5 événements" (dynamique et intelligent)

## 🛠️ Fonctions disponibles

### 1. `pluralize(count, singular, plural?)`

Retourne le mot au singulier ou au pluriel selon le nombre.

```typescript
import { pluralize } from '../utils/pluralize';

// Utilisation basique
pluralize(1, 'membre')     // → "membre"
pluralize(5, 'membre')     // → "membres"
pluralize(0, 'membre')     // → "membres"

// Pluriel irrégulier
pluralize(1, 'cheval', 'chevaux')  // → "cheval"
pluralize(3, 'cheval', 'chevaux')  // → "chevaux"
```

### 2. `pluralizeWithCount(count, singular, plural?)`

Retourne le nombre + le mot accordé.

```typescript
import { pluralizeWithCount } from '../utils/pluralize';

pluralizeWithCount(1, 'personne')  // → "1 personne"
pluralizeWithCount(10, 'personne') // → "10 personnes"
pluralizeWithCount(0, 'membre')    // → "0 membres"
```

### 3. `smartPluralize(count, word)`

Utilise un dictionnaire de mots irréguliers pour pluraliser automatiquement.

```typescript
import { smartPluralize } from '../utils/pluralize';

smartPluralize(1, 'personne')      // → "personne"
smartPluralize(5, 'personne')      // → "personnes"
smartPluralize(3, 'événement')     // → "événements"
smartPluralize(2, 'grand-parent')  // → "grands-parents"
```

### 4. `articleDefini(count, singular, plural)`

Accorde l'article défini (le/la/les).

```typescript
import { articleDefini } from '../utils/pluralize';

articleDefini(1, 'le', 'les')  // → "le"
articleDefini(5, 'le', 'les')  // → "les"
articleDefini(1, 'la', 'les')  // → "la"
```

### 5. `articleIndefini(count, singular, plural)`

Accorde l'article indéfini (un/une/des).

```typescript
import { articleIndefini } from '../utils/pluralize';

articleIndefini(1, 'un', 'des')   // → "un"
articleIndefini(5, 'un', 'des')   // → "des"
articleIndefini(1, 'une', 'des')  // → "une"
```

### 6. `accordAdjectif(count, isFeminine, ...)`

Accorde un adjectif selon le genre et le nombre.

```typescript
import { accordAdjectif } from '../utils/pluralize';

// Masculin
accordAdjectif(1, false, 'nouveau')  // → "nouveau"
accordAdjectif(5, false, 'nouveau')  // → "nouveaux"

// Féminin
accordAdjectif(1, true, 'nouveau')   // → "nouvelle"
accordAdjectif(5, true, 'nouveau')   // → "nouvelles"

// Irrégulier
accordAdjectif(1, false, 'beau', 'belle', 'beaux', 'belles')  // → "beau"
accordAdjectif(5, true, 'beau', 'belle', 'beaux', 'belles')   // → "belles"
```

## 💡 Exemples d'utilisation dans les composants

### Dashboard - Statistiques

```tsx
import { pluralize } from '../utils/pluralize';

<VStack spacing={1}>
  <Text fontSize="3xl" fontWeight="bold">{stats.membersCount}</Text>
  <Text fontSize="xs">{pluralize(stats.membersCount, 'Membre')}</Text>
</VStack>
```

**Résultat** :
- Si `membersCount = 1` : "1 Membre"
- Si `membersCount = 25` : "25 Membres"

### Dashboard - Boutons "Voir tous"

```tsx
import { pluralize } from '../utils/pluralize';

<Button onClick={() => navigate('/persons')}>
  Voir {members.length === 0 
    ? 'tous les membres' 
    : `${members.length === 1 ? 'le' : 'les'} ${members.length} ${pluralize(members.length, 'membre')}`
  }
</Button>
```

**Résultat** :
- Si `members.length = 0` : "Voir tous les membres"
- Si `members.length = 1` : "Voir le 1 membre"
- Si `members.length = 10` : "Voir les 10 membres"

### PersonsList - Compteur

```tsx
import { pluralize } from '../utils/pluralize';

<Text fontSize="sm" color="gray.600">
  {persons.length} {pluralize(persons.length, 'membre')} dans la famille
</Text>
```

**Résultat** :
- Si `persons.length = 1` : "1 membre dans la famille"
- Si `persons.length = 50` : "50 membres dans la famille"

### EventsCalendar - Titre dynamique

```tsx
import { pluralizeWithCount } from '../utils/pluralize';

<Heading>
  {pluralizeWithCount(events.length, 'événement')} {events.length > 1 ? 'à venir' : 'à venir'}
</Heading>
```

**Résultat** :
- Si `events.length = 1` : "1 événement à venir"
- Si `events.length = 15` : "15 événements à venir"

### Cas complexe - Accord complet

```tsx
import { articleDefini, pluralize, accordAdjectif } from '../utils/pluralize';

const count = upcomingEvents.length;
const isFeminine = false; // "événement" est masculin

<Text>
  {articleDefini(count, 'Le', 'Les')} {count} {accordAdjectif(count, isFeminine, 'prochain')} {pluralize(count, 'événement')}
</Text>
```

**Résultat** :
- Si `count = 1` : "Le 1 prochain événement"
- Si `count = 5` : "Les 5 prochains événements"

## 📖 Dictionnaire des mots irréguliers

Le système inclut un dictionnaire de mots français courants :

```typescript
{
  'personne': 'personnes',
  'membre': 'membres',
  'événement': 'événements',
  'mariage': 'mariages',
  'génération': 'générations',
  'photo': 'photos',
  'famille': 'familles',
  'enfant': 'enfants',
  'parent': 'parents',
  'grand-parent': 'grands-parents',
  'arrière-grand-parent': 'arrière-grands-parents',
  'anniversaire': 'anniversaires',
  'décès': 'décès',
  'naissance': 'naissances',
  'jour': 'jours',
  'mois': 'mois',
  'année': 'années',
  'siècle': 'siècles',
}
```

## ✅ Checklist de migration

### Fichiers déjà migrés
- ✅ `Dashboard.tsx` - Statistiques et boutons
- ✅ `PersonsList.tsx` - Compteur de membres

### Fichiers à migrer
- ⏳ `EventsCalendar.tsx`
- ⏳ `AlbumsList.tsx`
- ⏳ `WeddingForm.tsx`
- ⏳ `PersonProfile.tsx`
- ⏳ `FamilyTree.tsx`

## 🎨 Bonnes pratiques

### ✅ À FAIRE

1. **Toujours utiliser `pluralize()` pour les compteurs**
```tsx
{count} {pluralize(count, 'membre')}
```

2. **Utiliser `smartPluralize()` pour les mots du dictionnaire**
```tsx
{smartPluralize(count, 'événement')}
```

3. **Gérer le cas zéro intelligemment**
```tsx
{count === 0 ? 'Aucun membre' : `${count} ${pluralize(count, 'membre')}`}
```

4. **Accorder les articles**
```tsx
{articleDefini(count, 'le', 'les')} {count} {pluralize(count, 'membre')}
```

### ❌ À ÉVITER

1. **Pluriel codé en dur**
```tsx
{count} membres  // ❌ Toujours pluriel
```

2. **Conditions manuelles répétées**
```tsx
{count === 1 ? 'membre' : 'membres'}  // ❌ Utiliser plutôize() à la place
```

3. **Oublier le cas zéro**
```tsx
{count} {pluralize(count, 'membre')}  // ⚠️ Affichera "0 membres" au lieu de "Aucun membre"
```

## 🔧 Ajouter un nouveau mot irrégulier

Si vous avez un nouveau mot avec un pluriel irrégulier, ajoutez-le dans `frontend/src/utils/pluralize.ts` :

```typescript
export const irregularPlurals: Record<string, string> = {
  // ... mots existants
  'bijou': 'bijoux',      // Nouveau mot
  'travail': 'travaux',   // Nouveau mot
};
```

## 📊 Impact sur l'UX

**Avant** :
- Textes figés : "10 personnes trouvées"
- Incohérences : "1 membres"
- Expérience amateur

**Après** :
- Textes dynamiques : "1 personne trouvée" / "10 personnes trouvées"
- Grammaire correcte
- Expérience professionnelle et polie

## 🌍 Internationalisation future

Ce système peut être étendu pour supporter plusieurs langues :

```typescript
// pluralize.en.ts (futur)
export function pluralize(count: number, singular: string): string {
  return count === 1 ? singular : `${singular}s`;
}

// pluralize.fr.ts (actuel)
// Logique complexe avec dictionnaire
```

## 📝 Résumé

- ✅ Utilisez `pluralize()` pour 90% des cas
- ✅ Utilisez `smartPluralize()` pour les mots du dictionnaire
- ✅ Utilisez `pluralizeWithCount()` pour "X membres"
- ✅ Accordez les articles avec `articleDefini()` et `articleIndefini()`
- ✅ Accordez les adjectifs avec `accordAdjectif()`
- ✅ Gérez le cas zéro explicitement
- ✅ Ajoutez les nouveaux mots irréguliers dans le dictionnaire

---

**Auteur** : GitHub Copilot  
**Date** : Janvier 2025  
**Version** : 1.0
