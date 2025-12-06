# 🚀 PHASE 4 EN COURS - Migration FamilyTreeOrganic.tsx

## 📋 Status : EN COURS

**Date début** : 11 Novembre 2025  
**Objectif** : Migrer FamilyTreeOrganic.tsx vers l'architecture union-based  
**Complexité** : Élevée (D3.js + Architecture)

---

## ✅ Prérequis Validés

- [x] Phase 3 complète et validée
- [x] Architecture union-based fonctionnelle dans FamilyTreeVisualization
- [x] Service `familyTreeService.ts` opérationnel
- [x] Utilisateur confirme Phase 3 OK
- [x] Sauvegarde créée : `FamilyTreeOrganic.tsx.backup`

---

## 📊 Analyse du Fichier Actuel

### Structure Actuelle
- **Lignes** : 967
- **Framework** : D3.js v7
- **Architecture** : TreeNode (treeBuilderV2)
- **Problèmes potentiels** :
  - Utilise `buildExtendedFamilyTreeV2` (ancien système)
  - Peut avoir duplication avec polygamie
  - Pas de gestion native des unions multiples

### Fonctionnalités à Préserver
- ✅ Rendu D3 avec arbre hiérarchique
- ✅ Zoom et Pan interactifs
- ✅ Animations et transitions
- ✅ Navigation par clic sur personne
- ✅ Tooltips informatifs
- ✅ Mode focus sur personne
- ✅ Statistiques d'arbre

---

## 🎯 Plan de Migration (6 Étapes)

### Étape 1 : Préparation ✅
- [x] Sauvegarde créée
- [ ] Analyser les dépendances D3
- [ ] Identifier les fonctions critiques

### Étape 2 : Imports et Interfaces
- [ ] Remplacer imports treeBuilderV2
- [ ] Ajouter imports familyTreeService
- [ ] Créer interfaces D3Node compatibles union-based

### Étape 3 : Fonction de Construction
- [ ] Créer `transformUnionsToD3Tree()`
- [ ] Convertir unions → structure D3
- [ ] Gérer les nœuds union séparément

### Étape 4 : Adaptation Layout D3
- [ ] Modifier `d3.tree()` pour unions
- [ ] Ajuster `separation()` pour espacement
- [ ] Adapter les liens (paths)

### Étape 5 : Rendu des Nœuds
- [ ] Différencier rendu person vs union
- [ ] Adapter les groupes SVG
- [ ] Maintenir les interactions

### Étape 6 : Tests et Validation
- [ ] Compiler sans erreurs
- [ ] Tester visuellement
- [ ] Vérifier zoom/pan
- [ ] Valider avec cas polygamie

---

## 🔧 Approche Technique

### Nouvelle Structure D3

```typescript
interface D3PersonNode {
  name: string;
  id: number;
  type: 'person';
  data: FamilyPerson;
  children?: D3Node[];
  x?: number;
  y?: number;
  depth?: number;
}

interface D3UnionNode {
  name: string;
  id: string;
  type: 'union';
  data: {
    union: Union;
    partner?: FamilyPerson;
  };
  children?: D3Node[];
  x?: number;
  y?: number;
  depth?: number;
}

type D3Node = D3PersonNode | D3UnionNode;
```

### Transformation Unions → D3

```typescript
const transformUnionsToD3Tree = (
  unions: Map<string, Union>,
  allPersons: Map<number, FamilyPerson>,
  focusPersonId?: number
): D3Node => {
  // 1. Identifier la personne racine
  // 2. Pour chaque personne avec unions multiples
  // 3. Créer nœud person + nœuds union enfants
  // 4. Pour chaque union, ajouter partenaire + enfants
  // 5. Récursion sur les enfants
};
```

---

## ⏱️ Temps Estimé par Étape

| Étape | Description | Temps |
|-------|-------------|-------|
| 1 | Préparation | 5 min ✅ |
| 2 | Imports et Interfaces | 10 min |
| 3 | Fonction Construction | 30 min |
| 4 | Layout D3 | 20 min |
| 5 | Rendu Nœuds | 25 min |
| 6 | Tests | 20 min |
| **Total** | | **~2 heures** |

---

## 🎯 Checklist de Progression

### Phase 4.1 : Setup (En cours)
- [x] Créer document de suivi
- [ ] Lire fichier actuel complet
- [ ] Identifier toutes les fonctions D3
- [ ] Lister les dépendances

### Phase 4.2 : Imports
- [ ] Modifier imports
- [ ] Créer interfaces D3Node
- [ ] Ajouter états nécessaires

### Phase 4.3 : Construction
- [ ] Fonction transformUnionsToD3Tree()
- [ ] Logique union-based
- [ ] Tests unitaires construction

### Phase 4.4 : D3 Layout
- [ ] Adapter tree layout
- [ ] Ajuster separation
- [ ] Modifier chemins liens

### Phase 4.5 : Rendu
- [ ] Fonction drawPersonNode()
- [ ] Fonction drawUnionNode()
- [ ] Interactions préservées

### Phase 4.6 : Finalisation
- [ ] Tests visuels
- [ ] Validation polygamie
- [ ] Documentation

---

## 📝 Notes de Migration

### Différences Clés : TreeNode vs D3Node

**AVANT (TreeNode)** :
```typescript
interface TreeNode {
  name: string;
  id: number;
  sex: string;
  spouses: Person[];
  children: TreeNode[];
  level: number;
}
```

**APRÈS (D3Node)** :
```typescript
// Nœud Person
{
  type: 'person',
  data: FamilyPerson,
  children: [UnionNode1, UnionNode2] // Unions comme enfants
}

// Nœud Union
{
  type: 'union',
  data: { union: Union, partner: Person },
  children: [ChildNode1, ChildNode2] // Enfants de cette union
}
```

### Avantages de la Nouvelle Structure

1. **Séparation claire** : Personnes ≠ Unions
2. **Pas de duplication** : Une personne = un nœud
3. **Unions multiples** : Enfants du nœud person
4. **Scalable** : Fonctionne avec N unions
5. **Cohérent** : Même logique que FamilyTreeVisualization

---

## 🚨 Points d'Attention

### 1. Layout D3
- `d3.tree()` s'attend à une hiérarchie stricte
- Unions créent des branches horizontales
- Nécessite ajustement de `separation()`

### 2. Chemins des Liens
- Person → Union : ligne verticale
- Union → Partner : ligne courte
- Union → Children : lignes ramifiées

### 3. Performance
- `buildCompleteFamily` peut être coûteux
- Utiliser `useMemo` pour éviter recalculs
- Garder optimisations D3 existantes

### 4. Interactions
- Clic sur person : navigation
- Clic sur union : peut afficher détails mariage
- Zoom/Pan : préserver comportement

---

## 🎯 Objectif Final

### Rendu Visuel Attendu

```
       👨 Ruben (racine)
            │
    ┌───────┼───────┐
    │       │       │
[Union1] [Union2] [Union3]
    │       │       │
 💕 P1   💕 P2   💕 P3
    │       │       │
 👶 E1   👶 E2   👶 E3
```

**VS Ancien** :
```
👨 Ruben
 └─ 💕 P1
     └─ 👶 E1
👨 Ruben (x2) ❌
 └─ 💕 P2
     └─ 👶 E2
👨 Ruben (x3) ❌
 └─ 💕 P3
     └─ 👶 E3
```

---

## 📊 Métriques de Succès

- [ ] ✅ Compilation sans erreurs TypeScript
- [ ] ✅ Arbre D3 s'affiche correctement
- [ ] ✅ Pas de duplication visuelle
- [ ] ✅ Unions multiples horizontales
- [ ] ✅ Zoom/Pan fonctionnels
- [ ] ✅ Navigation par clic OK
- [ ] ✅ Tooltips opérationnels
- [ ] ✅ Performance acceptable (<2s render)
- [ ] ✅ Validation utilisateur positive

---

**Status Actuel** : 🟡 ÉTAPE 1/6 - Préparation  
**Prochaine Action** : Analyser le fichier actuel en détail

---

**Début de la migration** : 11 Novembre 2025  
**Mise à jour** : En cours...
