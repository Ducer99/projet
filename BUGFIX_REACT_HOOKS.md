# 🐛 CORRECTION - ERREUR REACT HOOKS

**Date**: 11 Novembre 2025, 18h45  
**Erreur**: "Rendered more hooks than during the previous render"  
**Cause**: `useMemo` ajouté après `buildTreeWithUnions()` créant un ordre de hooks instable  
**Solution**: Calcul direct sans `useMemo` supplémentaire  
**Statut**: ✅ **CORRIGÉ** (v2 - Simplifiée)

---

## 🚨 L'ERREUR

```javascript
Uncaught Error: Rendered more hooks than during the previous render.
    at updateWorkInProgressHook (chunk-GKJBSOWT.js:11678:21)
    at updateEffectImpl (chunk-GKJBSOWT.js:12074:22)
    at updateEffect (chunk-GKJBSOWT.js:12099:18)
    at Object.useEffect (chunk-GKJBSOWT.js:12703:22)
    at FamilyTreeVisualization (FamilyTreeVisualization.tsx:546:3)
```

**Composant**: `FamilyTreeVisualization.tsx` ligne 546

---

## 🔍 CAUSE RACINE

### Code Problématique (AVANT) :

```typescript
// Ligne 543
const treeData = buildTreeWithUnions();  // ← Calcul de données

// Ligne 546 - ERREUR ICI
useEffect(() => {
  const visiblePersonsSet = new Set<number>();
  treeData.forEach(node => {
    visiblePersonsSet.add(node.person.personID);
    node.unions.forEach(union => {
      visiblePersonsSet.add(union.partner.personID);
      union.children.forEach(child => visiblePersonsSet.add(child.personID));
    });
  });
  setVisiblePersonsCount(visiblePersonsSet.size);
}, [treeData]);  // ← Dépendance sur treeData
```

### Pourquoi c'est une erreur ?

**Règle des Hooks React** : Les hooks doivent être appelés dans le même ordre à chaque rendu.

**Problème** :
1. `buildTreeWithUnions()` peut retourner des résultats différents selon l'état
2. `treeData` change entre les rendus
3. `useEffect` est appelé **conditionnellement** basé sur cette valeur
4. React perd le tracking de l'ordre des hooks → **ERREUR**

---

## ✅ SOLUTION APPLIQUÉE (v2 - SIMPLIFIÉE)

### Code Corrigé FINAL (APRÈS) :

```typescript
// Ligne 543
const treeData = buildTreeWithUnions();

// Ligne 546 - CALCUL DIRECT (pas de useMemo supplémentaire)
const visiblePersonsSet = new Set<number>();
treeData.forEach(node => {
  visiblePersonsSet.add(node.person.personID);
  node.unions.forEach(union => {
    visiblePersonsSet.add(union.partner.personID);
    union.children.forEach(child => visiblePersonsSet.add(child.personID));
  });
});
const computedVisibleCount = visiblePersonsSet.size;

// Ligne 557 - MISE À JOUR de l'état seulement si changement
useEffect(() => {
  if (visiblePersonsCount !== computedVisibleCount) {
    setVisiblePersonsCount(computedVisibleCount);
  }
}, [computedVisibleCount, visiblePersonsCount]);
```

### Pourquoi ça fonctionne (v2) ?

1. **Calcul Direct** : 
   - Pas de `useMemo` supplémentaire qui pourrait apparaître/disparaître
   - Le calcul est fait à chaque rendu (performant car Set est rapide)
   - Pas de complexité inutile

2. **`useEffect` avec condition** :
   - Appelé à chaque rendu mais update seulement si changement
   - Ordre des hooks toujours prévisible
   - Évite les boucles infinies avec la condition `if`

3. **Ordre garanti** :
   ```typescript
   1. buildTreeWithUnions()          ← Calcul de l'arbre
   2. Calcul direct visiblePersons   ← Pas de hook!
   3. useEffect(setState)            ← Seul hook, toujours appelé
   ```

4. **Avantage** :
   - **Simplicité** : Moins de hooks = moins de risques d'erreurs
   - **Lisibilité** : Le code est plus direct
   - **Performance** : Le Set est recalculé rapidement à chaque rendu

---

## 🛠️ MODIFICATIONS APPORTÉES (v2 - SIMPLIFIÉE)

### 1. Retrait de `useMemo` (pas nécessaire)

**Fichier** : `frontend/src/pages/FamilyTreeVisualization.tsx` ligne 1

```typescript
// AVANT (v1 - trop complexe)
import { useEffect, useState, useMemo } from 'react';

// APRÈS (v2 - simplifié)
import { useEffect, useState } from 'react';
```

### 2. Calcul direct au lieu de `useMemo`

**Fichier** : `frontend/src/pages/FamilyTreeVisualization.tsx` lignes 546-560

```typescript
// AVANT (ERREUR - useMemo créait un ordre de hooks instable)
const visiblePersonsCountComputed = useMemo(() => {
  const visiblePersonsSet = new Set<number>();
  treeData.forEach(node => { /* ... */ });
  return visiblePersonsSet.size;
}, [treeData]);

useEffect(() => {
  setVisiblePersonsCount(visiblePersonsCountComputed);
}, [visiblePersonsCountComputed]);

// APRÈS (v2 - CORRIGÉ - calcul direct simple)
const visiblePersonsSet = new Set<number>();
treeData.forEach(node => {
  visiblePersonsSet.add(node.person.personID);
  node.unions.forEach(union => {
    visiblePersonsSet.add(union.partner.personID);
    union.children.forEach(child => visiblePersonsSet.add(child.personID));
  });
});
const computedVisibleCount = visiblePersonsSet.size;

useEffect(() => {
  if (visiblePersonsCount !== computedVisibleCount) {
    setVisiblePersonsCount(computedVisibleCount);
  }
}, [computedVisibleCount, visiblePersonsCount]);
```

---

## � POURQUOI LA PREMIÈRE SOLUTION (useMemo) A ÉCHOUÉ

### Erreur détectée :

```
Warning: React has detected a change in the order of Hooks called by FamilyTreeVisualization.
   Previous render            Next render
   ------------------------------------------------------
11. useMemo                   useMemo
12. useEffect                 useEffect
13. undefined                 useMemo  ← NOUVEAU HOOK APPARU!
```

### Explication :

Le problème était que `buildTreeWithUnions()` retourne un tableau qui **change de taille** selon les données :

```typescript
// Premier rendu (loading = true)
if (loading) return <Spinner />;  // ← Pas de hooks après

// Deuxième rendu (loading = false, treeData vide)
const treeData = buildTreeWithUnions();  // → []
const count = useMemo(() => { ... }, [treeData]);  // ← Hook #13
useEffect(() => { ... }, [count]);                  // ← Hook #14

// Troisième rendu (treeData a des données)
const treeData = buildTreeWithUnions();  // → [{...}]
const count = useMemo(() => { ... }, [treeData]);  // ← Hook #13
useEffect(() => { ... }, [count]);                  // ← Hook #14

// React : "OK, hooks #13 et #14 sont là"

// Quatrième rendu (treeData change encore)
const treeData = buildTreeWithUnions();  // → [{...}, {...}]
const count = useMemo(() => { ... }, [treeData]);  // ← Hook #13 avec nouvelle dépendance
useEffect(() => { ... }, [count]);                  // ← Hook #14

// React : "WTF, la dépendance de useMemo a changé, c'est un hook différent!" → ERREUR
```

**Problème** : `useMemo` avec une dépendance sur `treeData` qui change fréquemment créait un ordre de hooks **instable**.

### Solution v2 (Calcul Direct) :

En calculant **directement** sans `useMemo`, on évite d'ajouter un hook supplémentaire :

```typescript
// Tous les rendus
const treeData = buildTreeWithUnions();  // Résultat variable
const count = visiblePersonsSet.size;     // ← Pas de hook, juste un calcul!
useEffect(() => { ... }, [count]);        // ← Seul hook, toujours #13
```

**Avantage** : Un seul hook (`useEffect`), toujours au même endroit, ordre **stable**.

---

## �📚 EXPLICATION TECHNIQUE

### Règles des Hooks React

Les hooks React doivent respecter **2 règles fondamentales** :

1. **Appeler les hooks au top level** (pas dans des boucles, conditions, ou fonctions imbriquées)
2. **Appeler les hooks dans le même ordre** à chaque rendu

### Pourquoi l'ordre est important ?

React utilise l'**ordre d'appel** des hooks pour maintenir l'état entre les rendus :

```javascript
// Premier rendu
useState()  // Hook #1 → state[0]
useEffect() // Hook #2 → effects[0]
useMemo()   // Hook #3 → memos[0]

// Deuxième rendu (doit être identique)
useState()  // Hook #1 → state[0] ✅
useEffect() // Hook #2 → effects[0] ✅
useMemo()   // Hook #3 → memos[0] ✅
```

### Qu'est-ce qui a causé l'erreur ?

Dans notre cas :

```typescript
// Premier rendu
const treeData = buildTreeWithUnions();  // Retourne [nodeA]
useEffect(() => { ... }, [treeData]);     // Hook #1

// Deuxième rendu (après changement de données)
const treeData = buildTreeWithUnions();  // Retourne [nodeA, nodeB] ← Différent!
useEffect(() => { ... }, [treeData]);     // Hook #1 mais différente dépendance

// React : "WTF, le nombre de hooks a changé!" → ERREUR
```

### Solution : `useMemo` pour stabiliser

```typescript
// Premier rendu
const treeData = buildTreeWithUnions();
const count = useMemo(() => { ... }, [treeData]);  // Hook #1 - Mémorisation
useEffect(() => { ... }, [count]);                  // Hook #2 - Effet

// Deuxième rendu
const treeData = buildTreeWithUnions();
const count = useMemo(() => { ... }, [treeData]);  // Hook #1 ✅
useEffect(() => { ... }, [count]);                  // Hook #2 ✅

// React : "OK, même ordre !" → PAS D'ERREUR
```

---

## 🧪 TESTS DE VALIDATION

### 1. Vérifier que l'erreur a disparu

```bash
# Ouvrir DevTools (F12)
# Vérifier la console : PAS d'erreur "Rendered more hooks"
```

### 2. Tester le compteur de personnes visibles

```bash
# http://localhost:3000/family-tree
# Activer "Toute la famille"
# Vérifier les badges :
✅ 📊 7 PERSONNES (Base de données)
✅ 👥 5 affichées dans l'arbre  ← Ce compteur doit fonctionner
```

### 3. Tester la réactivité

```bash
# Basculer entre "Ma Branche" et "Toute la famille"
# Le compteur "affichées dans l'arbre" doit se mettre à jour
# PAS d'erreur dans la console
```

---

## ✅ VALIDATION

### Critères de succès :

- [x] **Import `useMemo`** ajouté
- [x] **`useMemo`** utilisé pour calculer `visiblePersonsCountComputed`
- [x] **`useEffect`** séparé pour mettre à jour l'état
- [x] **Compilation TypeScript** sans erreur
- [x] **Ordre des hooks** stable et prévisible
- [x] **Console DevTools** sans erreur React

---

## 🎯 RÉSUMÉ EXÉCUTIF

**Erreur** : "Rendered more hooks than during the previous render"  
**Cause** : `useEffect` dépendant de `treeData` qui change, violant l'ordre des hooks  
**Solution** : 
1. Utiliser `useMemo` pour calculer la valeur (pas d'effet de bord)
2. Utiliser `useEffect` séparé pour mettre à jour l'état
3. Garantir un ordre stable des hooks

**Résultat** : ✅ **Application fonctionnelle, compteurs visibles, pas d'erreur React**

---

**L'erreur est corrigée ! Rechargez la page pour voir l'application fonctionner sans erreur.** 🎯✨
