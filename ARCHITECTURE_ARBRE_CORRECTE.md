# Architecture Correcte de l'Arbre Généalogique

## 🚨 Problème Identifié

### Erreur Actuelle:
- **Duplication des personnes**: Ruben apparaît 3 fois (avec chaque partenaire)
- **Modélisation incorrecte**: Les personnes sont dupliquées au lieu de créer des unions séparées
- **Conséquences**:
  - Confusion visuelle
  - Impossibilité de distinguer demi-frères/sœurs
  - Mères biologiques invisibles ou mal liées
  - Comptage incorrect (7 personnes alors qu'il devrait y en avoir moins)

---

## ✅ Solution: Architecture Orientée Unions

### Principe Fondamental:

```
❌ MAUVAISE APPROCHE (actuelle):
Person(Ruben) + Children(Borel, Othniel)
  → Crée plusieurs nœuds "Ruben"

✅ BONNE APPROCHE (nouvelle):
Person(Ruben) UNIQUE
  ├─ Union(Ruben + Eudoxie) → Children(Borel)
  └─ Union(Ruben + Gisele) → Children(Othniel)
```

---

## 📐 Nouvelle Structure de Données

### 1. **Person** (Nœud Unique)
```typescript
interface Person {
  personID: number;        // ID unique
  firstName: string;
  lastName: string;
  sex: 'M' | 'F';
  // ... autres attributs
}
```
**Règle**: Une personne = **UN SEUL nœud** dans toute la base

### 2. **Union** (Relation Parent-Parent)
```typescript
interface Union {
  id: string;              // Ex: "27-28" (père-mère)
  fatherId: number;        // ID du père
  motherId: number;        // ID de la mère
  father: Person;          // Référence au père
  mother: Person;          // Référence à la mère
  children: Person[];      // Enfants de CETTE union
  isMarried: boolean;      // Mariés ou co-parents
  weddingDate?: string;
  divorceDate?: string;
}
```
**Règle**: Les enfants sont liés à **l'union** (pas aux parents individuellement)

### 3. **FamilyTreeNode** (Visualisation)
```typescript
interface FamilyTreeNode {
  person: Person;          // LA personne (unique)
  unions: Union[];         // Toutes ses unions
  generation: number;
  isRoot: boolean;
}
```

---

## 🎯 Exemple Concret: Famille de Ruben

### Données:
- **Ruben KAMO GAMO** (ID: 27)
- **Eudoxie SIPEWOU KAMCHE** (ID: 28)
- **Gisele NGUIMDOM** (ID: 29)
- **Borel Bassot** (ID: 30, père: 27, mère: 28)
- **Othniel** (ID: 31, père: 27, mère: 29)

### Structure Correcte:

```
Personnes (3 adultes, 2 enfants = 5 personnes UNIQUES):
├─ Person(27) = Ruben
├─ Person(28) = Eudoxie
├─ Person(29) = Gisele
├─ Person(30) = Borel
└─ Person(31) = Othniel

Unions (2 unions):
├─ Union("27-28") = Ruben + Eudoxie
│   └─ Enfants: [Borel(30)]
└─ Union("27-29") = Ruben + Gisele
    └─ Enfants: [Othniel(31)]

Arbre de Ruben:
FamilyTreeNode {
  person: Ruben(27),
  unions: [
    Union("27-28") → Eudoxie + [Borel],
    Union("27-29") → Gisele + [Othniel]
  ]
}
```

---

## 🎨 Affichage Visuel

### Vue Standard:
```
       Ruben KAMO GAMO (27)
      /                    \
     /                      \
Union 1                   Union 2
(Ruben + Eudoxie)        (Ruben + Gisele)
    |                         |
    |                         |
  [💕]                      [💕]
    |                         |
Eudoxie (28)              Gisele (29)
    |                         |
    ↓                         ↓
Borel Bassot (30)        Othniel (31)
```

### Vue Organique:
```
┌─────────────┐
│   Ruben     │ (Nœud UNIQUE)
│  KAMO GAMO  │
└─────────────┘
      ║
      ╠═══════════════════╗
      ║                   ║
      ║                   ║
┌─────▼─────┐       ┌─────▼─────┐
│  Eudoxie  │       │   Gisele  │
│  SIPEWOU  │       │ NGUIMDOM  │
└───────────┘       └───────────┘
      │                   │
   ───┴───             ───┴───
   Borel               Othniel
```

---

## 🔧 Avantages de la Nouvelle Architecture

### 1. **Unicité Garantie**
- ✅ Ruben apparaît **une seule fois**
- ✅ Comptage correct des personnes
- ✅ Pas de confusion visuelle

### 2. **Gestion Correcte de la Polygamie**
- ✅ Plusieurs unions pour une même personne
- ✅ Chaque enfant lié à la bonne union
- ✅ Mères biologiques toujours visibles

### 3. **Distinction Claire des Fratries**
```typescript
// Borel et Othniel sont demi-frères
areHalfSiblings(Borel, Othniel) === true
// Même père (Ruben), mères différentes

// Si Ruben avait deux enfants avec Eudoxie:
areFullSiblings(Borel, AutreEnfant) === true
// Même père ET même mère
```

### 4. **Traçabilité Biologique**
- ✅ Chaque enfant → Union spécifique → Père + Mère identifiés
- ✅ Pas d'ambiguïté sur la filiation
- ✅ Génétique correctement représentée

---

## 📊 Statistiques Correctes

### Avant (Architecture Incorrecte):
```
7 PERSONNES  ← Faux! (Ruben compté 3 fois)
0 MARIAGES
```

### Après (Architecture Correcte):
```
5 PERSONNES  ← Correct! (Ruben compté 1 fois)
2 UNIONS (Ruben+Eudoxie, Ruben+Gisele)
0 MARIAGES FORMELS (co-parents)
1 PERSONNE EN POLYGAMIE (Ruben)
2 DEMI-FRÈRES (Borel & Othniel)
```

---

## 🚀 Migration à Effectuer

### Étape 1: Créer `familyTreeService.ts` ✅
Service avec architecture correcte (unions séparées)

### Étape 2: Adapter les Vues
- **Vue Standard**: Afficher chaque union avec ses enfants
- **Vue Organique**: Même personne reliée à plusieurs partenaires

### Étape 3: Tests
```typescript
// Test polygamie
const rubenNode = buildFamilyTreeWithUnions(persons, weddings, 27);
expect(rubenNode.unions.length).toBe(2); // 2 unions

// Test demi-frères
expect(areHalfSiblings(borel, othniel)).toBe(true);

// Test unicité
const allNodes = getAllNodes(tree);
const rubenNodes = allNodes.filter(n => n.person.personID === 27);
expect(rubenNodes.length).toBe(1); // Une seule fois!
```

---

## ⚠️ Points de Vigilance

### 1. **Ne JAMAIS dupliquer une personne**
```typescript
// ❌ MAUVAIS
if (person.hasMultiplePartners) {
  return person.partners.map(p => createNode(person, p));
}

// ✅ BON
return {
  person: person, // UN SEUL nœud
  unions: person.partners.map(p => createUnion(person, p))
};
```

### 2. **Toujours lier les enfants à l'union**
```typescript
// ❌ MAUVAIS
children = persons.filter(p => p.fatherID === ruben.id);

// ✅ BON
union = getUnion(ruben.id, eudoxie.id);
children = union.children;
```

### 3. **Calculer correctement les statistiques**
```typescript
// ❌ MAUVAIS (compte les doublons)
totalPersons = treeNodes.length;

// ✅ BON (compte les personnes uniques)
const uniquePersonIds = new Set(treeNodes.map(n => n.person.personID));
totalPersons = uniquePersonIds.size;
```

---

## 📝 Checklist de Validation

- [ ] Une personne = un seul ID dans toute la base
- [ ] Les unions sont des entités séparées
- [ ] Chaque enfant est lié à une union spécifique
- [ ] La polygamie est gérée (plusieurs unions par personne)
- [ ] Les demi-frères/sœurs sont distinguables
- [ ] Les mères biologiques sont toujours visibles
- [ ] Les statistiques sont correctes (pas de doublons)
- [ ] La vue Standard affiche correctement les fratries
- [ ] La vue Organique montre toutes les unions
- [ ] Le comptage des personnes est exact

---

## 🎓 Concepts Clés

### Relation "Personne → Unions"
```
Une personne POSSÈDE plusieurs unions
Une union RELIE deux personnes
Les enfants APPARTIENNENT À une union
```

### Différence Fondamentale
```
Ancien modèle: Arbre de PERSONNES
Nouveau modèle: Arbre de PERSONNES + UNIONS

Les unions sont des entités de première classe,
pas de simples attributs!
```

---

**Date**: 11 Novembre 2025  
**Status**: 🟡 Architecture créée, migration en cours  
**Priorité**: 🔴 CRITIQUE - Bloque la correcte représentation des familles
