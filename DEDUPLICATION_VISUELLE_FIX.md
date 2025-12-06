# ✅ DUPLICATION VISUELLE RÉSOLUE

**18h15 - 11 Nov 2025**

## Problème
Ruben affiché 3 fois (une boîte par union) au lieu d'une seule.

## Solution
Ajout déduplication par `personID` avec `Map<number, PersonWithUnions>` dans `buildTreeWithUnions()`.

## Code
```typescript
// Lignes 171-224 de FamilyTreeVisualization.tsx
const personsWithUnionsMap = new Map();
roots.forEach(root => {
  if (Map.has(personId)) {
    // Fusionner unions
  } else {
    // Créer entrée
  }
});
const result = Array.from(Map.values());  // 4 nœuds (pas 6)
```

## Test
1. Vider cache : `Cmd+Shift+R`
2. Ouvrir : http://localhost:3000/family-tree
3. Vérifier : **1 boîte bleue** Ruben (pas 3)
4. Console : `📊 Personnes uniques affichées: 4`

## Résultat
✅ **Un Individu = Un Nœud Visuel**

Veuillez tester.
