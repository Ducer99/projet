# Plan de Migration: Architecture Orientée Unions

## 🎯 Objectif
Migrer de l'architecture actuelle (duplication des personnes) vers une architecture orientée unions (personnes uniques + unions séparées).

---

## 📋 État Actuel vs État Cible

| Aspect | Actuel ❌ | Cible ✅ |
|--------|----------|----------|
| **Personnes** | Dupliquées (Ruben x3) | Uniques (Ruben x1) |
| **Unions** | Implicites (attribut spouse) | Explicites (entité Union) |
| **Enfants** | Liés au parent | Liés à l'union |
| **Polygamie** | Mal gérée | Correctement modélisée |
| **Demi-frères** | Indistinguables | Distinguables |
| **Mères** | Parfois invisibles | Toujours visibles |
| **Comptage** | Incorrect (7 personnes) | Correct (5 personnes) |

---

## 🔄 Étapes de Migration

### Phase 1: Préparation ✅
- [x] Créer `familyTreeService.ts` avec architecture correcte
- [x] Documenter l'architecture (`ARCHITECTURE_ARBRE_CORRECTE.md`)
- [x] Créer ce plan de migration

### Phase 2: Adaptation Backend (Optionnel)
**Note**: Le backend peut rester inchangé si les données sont déjà correctes

**À vérifier**:
```sql
-- Vérifier que chaque personne a un ID unique
SELECT personID, COUNT(*) as count
FROM Persons
GROUP BY personID
HAVING count > 1;

-- Résultat attendu: 0 lignes (pas de doublons)
```

**Si le backend crée des doublons** → Corriger les endpoints:
- [ ] `/familytree/full/{familyId}` - Ne pas dupliquer les personnes
- [ ] `/familytree/my-branch/{personId}` - Retourner personnes uniques

### Phase 3: Migration Vue Standard 🔄
**Fichier**: `frontend/src/pages/FamilyTreeVisualization.tsx`

#### 3.1 Importer le nouveau service
```typescript
import {
  buildCompleteFamily,
  getPersonUnions,
  areHalfSiblings,
  areFullSiblings
} from '../services/familyTreeService';
```

#### 3.2 Modifier `buildTree()` pour utiliser les unions
```typescript
// AVANT (actuel)
const buildTree = (): TreeNode[] => {
  const roots = persons.filter(p => !p.fatherID && !p.motherID);
  // Construit arbre avec personnes dupliquées...
};

// APRÈS (avec unions)
const buildTree = (): FamilyTreeDisplay => {
  const { roots, unions, allPersons } = buildCompleteFamily(persons, weddings);
  
  // Construire l'affichage basé sur les unions
  return roots.map(root => ({
    person: root.person,
    unions: root.unions.map(union => ({
      partner: union.fatherId === root.person.personID 
        ? union.mother 
        : union.father,
      children: union.children,
      isMarried: union.isMarried
    }))
  }));
};
```

#### 3.3 Adapter le rendu pour afficher les unions
```typescript
// Pseudo-code
const renderPersonWithUnions = (node: FamilyTreeNode) => {
  return (
    <VStack>
      {/* Personne principale */}
      <PersonCard person={node.person} />
      
      {/* Chaque union séparément */}
      {node.unions.map(union => (
        <UnionBox key={union.id}>
          {/* Partenaire */}
          <PersonCard person={getPartner(node.person, union)} />
          
          {/* Barre d'union */}
          <UnionBar />
          
          {/* Enfants de CETTE union */}
          <HStack>
            {union.children.map(child => (
              <PersonCard key={child.personID} person={child} />
            ))}
          </HStack>
        </UnionBox>
      ))}
    </VStack>
  );
};
```

**Tâches**:
- [ ] Importer nouveau service
- [ ] Adapter `buildTree()` pour utiliser unions
- [ ] Modifier le rendu pour afficher unions séparément
- [ ] Ajouter badge "Demi-frère/sœur" si applicable
- [ ] Tester avec cas de polygamie

### Phase 4: Migration Vue Organique 🔄
**Fichier**: `frontend/src/pages/FamilyTreeOrganic.tsx`

#### 4.1 Adapter la construction de l'arbre D3
```typescript
// AVANT (actuel)
const tree = buildExtendedFamilyTreeV2(persons, weddings, rootId);

// APRÈS (avec unions)
const familyData = buildCompleteFamily(persons, weddings);
const tree = convertToD3Tree(familyData); // Nouvelle fonction
```

#### 4.2 Créer fonction de conversion unions → D3
```typescript
function convertToD3Tree(familyData: CompleteFamily): D3TreeNode {
  // Convertir la structure orientée unions en structure D3
  // Garantir qu'une personne n'apparaît qu'une fois
  // Afficher les unions comme des nœuds intermédiaires
}
```

#### 4.3 Adapter le positionnement des conjoints
```typescript
// Positionnement basé sur les unions
const spousePositions = new Map();
familyData.unions.forEach(union => {
  // Positionner le père
  spousePositions.set(union.fatherId, { x, y });
  
  // Positionner la mère à côté
  spousePositions.set(union.motherId, { x: x + 200, y });
  
  // NE PAS dupliquer si la même personne a plusieurs unions
});
```

**Tâches**:
- [ ] Créer `convertToD3Tree()` pour unions
- [ ] Adapter positionnement (personnes uniques)
- [ ] Afficher lignes d'union entre partenaires
- [ ] Connecter enfants à l'union (pas au parent isolé)
- [ ] Tester avec Ruben (2 unions)

### Phase 5: Tests et Validation 🧪

#### 5.1 Tests Unitaires
```typescript
describe('familyTreeService', () => {
  it('ne duplique pas les personnes', () => {
    const { allPersons } = buildCompleteFamily(testPersons, testWeddings);
    const rubenNodes = Array.from(allPersons.values())
      .filter(p => p.firstName === 'Ruben');
    expect(rubenNodes.length).toBe(1);
  });
  
  it('détecte correctement les unions multiples (polygamie)', () => {
    const rubenNode = buildFamilyTreeWithUnions(testPersons, testWeddings, 27);
    expect(rubenNode.unions.length).toBe(2);
  });
  
  it('distingue demi-frères et frères complets', () => {
    expect(areHalfSiblings(borel, othniel)).toBe(true);
    expect(areFullSiblings(borel, othniel)).toBe(false);
  });
  
  it('affiche toutes les mères biologiques', () => {
    const { unions } = buildCompleteFamily(testPersons, testWeddings);
    unions.forEach(union => {
      expect(union.mother).toBeDefined();
      expect(union.father).toBeDefined();
    });
  });
});
```

#### 5.2 Tests Visuels
**Cas de test: Famille de Ruben**
- [ ] Ruben apparaît **une seule fois** dans le compteur
- [ ] **2 unions** affichées distinctement
- [ ] **Union 1**: Ruben + Eudoxie → Borel
- [ ] **Union 2**: Ruben + Gisele → Othniel
- [ ] **Borel et Othniel** marqués comme "demi-frères"
- [ ] **Gisele** visible et correctement liée à Othniel

**Navigation**:
- [ ] Cliquer sur Ruben → affiche ses 2 unions
- [ ] Cliquer sur Borel → affiche ses parents (Ruben + Eudoxie)
- [ ] Cliquer sur Othniel → affiche ses parents (Ruben + Gisele)

#### 5.3 Tests de Régression
- [ ] Famille simple (1 union) → OK
- [ ] Famille polygame (2+ unions) → OK
- [ ] Famille sans mariages (co-parents) → OK
- [ ] Famille avec mariages + co-parents → OK

### Phase 6: Nettoyage 🧹
**Fichiers à supprimer/archiver**:
- [ ] Archiver `treeBuilderV2.ts` (ancienne version)
- [ ] Supprimer code de duplication dans vues
- [ ] Nettoyer imports inutilisés
- [ ] Mettre à jour documentation

**Fichiers à garder**:
- [x] `familyTreeService.ts` (nouveau service)
- [x] `ARCHITECTURE_ARBRE_CORRECTE.md` (documentation)
- [x] `PLAN_MIGRATION_UNIONS.md` (ce fichier)

---

## 🐛 Problèmes Connus à Résoudre

### 1. Positionnement D3 avec Unions
**Défi**: Comment positionner les nœuds sans dupliquer les personnes?

**Solution**:
```typescript
// Nœuds = Personnes UNIQUES
const nodes = Array.from(allPersons.values());

// Liens = Unions (pas parent→enfant directement)
const links = unions.map(union => ({
  source: union.fatherId,
  target: `union-${union.id}`,  // Nœud intermédiaire
  type: 'parent-to-union'
}));
```

### 2. Affichage Multi-Unions
**Défi**: Comment afficher Ruben avec 2 partenaires côte à côte?

**Solution**:
```
Layout Horizontal:
┌────────┐          ┌────────┐
│ Gisele │──────────│ Ruben  │──────────┌─────────┐
└────────┘          └────────┘          │ Eudoxie │
    │                   │                └─────────┘
    │                   │                     │
    ↓                   ↓                     ↓
 Othniel           (autres?)              Borel
```

### 3. Badge Demi-Frères
**Défi**: Comment indiquer visuellement les demi-frères?

**Solution**:
```tsx
{areHalfSiblings(child, otherChild) && (
  <Badge colorScheme="orange" fontSize="xs">
    ½ Frère/Sœur
  </Badge>
)}
```

---

## 📊 Métriques de Succès

### Avant Migration:
- ❌ **7 "personnes"** affichées (Ruben compté 3x)
- ❌ **0 unions** modélisées
- ❌ **Gisele invisible** dans vue organique
- ❌ **Borel et Othniel** indistinguables (frères ou demi-frères?)

### Après Migration:
- ✅ **5 personnes** uniques
- ✅ **2 unions** modélisées (Ruben+Eudoxie, Ruben+Gisele)
- ✅ **Gisele visible** et liée à Othniel
- ✅ **Borel et Othniel** identifiés comme **demi-frères**
- ✅ **1 personne en polygamie** (Ruben) identifiée
- ✅ **Mères biologiques** toujours visibles

---

## ⚠️ Risques et Mitigation

### Risque 1: Régression sur familles simples
**Mitigation**: Tests exhaustifs sur différents types de familles

### Risque 2: Performance D3 avec unions
**Mitigation**: Optimiser le nombre de nœuds (unions intermédiaires cachées si besoin)

### Risque 3: Confusion utilisateur
**Mitigation**: Ajouter légende expliquant les unions multiples

---

## 📅 Timeline Estimée

| Phase | Durée | Status |
|-------|-------|--------|
| Phase 1: Préparation | 1h | ✅ Complété |
| Phase 2: Backend | 0-2h | ⏭️ Optionnel |
| Phase 3: Vue Standard | 3-4h | 🔄 En attente |
| Phase 4: Vue Organique | 4-5h | 🔄 En attente |
| Phase 5: Tests | 2-3h | 🔄 En attente |
| Phase 6: Nettoyage | 1h | 🔄 En attente |
| **TOTAL** | **11-15h** | **~20% complété** |

---

## 🚀 Prochaines Actions

1. **Immédiat**: 
   - Valider le service `familyTreeService.ts`
   - Créer tests unitaires de base

2. **Court terme**:
   - Migrer Vue Standard (Phase 3)
   - Tester avec données réelles

3. **Moyen terme**:
   - Migrer Vue Organique (Phase 4)
   - Tests complets

4. **Long terme**:
   - Optimisations performance
   - Fonctionnalités avancées (filtres, recherche)

---

**Date**: 11 Novembre 2025  
**Auteur**: AI Assistant  
**Priorité**: 🔴 CRITIQUE  
**Status**: 🟡 Phase 1 complétée, Phase 2-6 en attente
