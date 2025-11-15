# Visualisation d'Arbre Généalogique - Version Organique

## 1. Objectif de la Représentation Visuelle

Créer un affichage d'arbre généalogique utilisant une métaphore visuelle d'arbre littérale (tronc, branches, feuilles), offrant une navigation chaleureuse, ludique et esthétique.

### Principes de Design
- ❌ Éviter les boîtes rectangulaires rigides
- ✅ Utiliser des cadres stylisés irréguliers (vintage, ondulés)
- ✅ Branches organiques (courbes de Bézier)
- ✅ Éléments décoratifs (tronc, feuilles, textures naturelles)

---

## 2. Stack Technique

### Librairie Principale : D3.js v7
**Pourquoi D3.js ?**
- Contrôle total sur le rendu SVG
- Performance à grande échelle (milliers de nœuds)
- Transitions et animations fluides
- Support natif des layouts hiérarchiques (tree, cluster)

### Alternatives Considérées
- ❌ React Flow : Trop rigide pour notre cas d'usage
- ❌ GoJS : Commercial, moins flexible
- ✅ D3.js + React : Intégration optimale avec notre stack

---

## 3. Architecture des Données

### 3.1 Modèle Actuel (Base de Données)

```sql
Person {
  PersonID: int,
  FirstName: string,
  LastName: string,
  Sex: string,
  FatherID: int?,
  MotherID: int?,
  PhotoUrl: string?,
  Birthday: DateTime?,
  DeathDate: DateTime?,
  Alive: boolean,
  FamilyID: int
}

Wedding {
  WeddingID: int,
  ManID: int,
  WomanID: int,
  WeddingDate: DateTime?,
  DivorceDate: DateTime?,
  IsActive: boolean
}
```

### 3.2 Format Hiérarchique pour D3.js

```typescript
interface TreeNode {
  // Données de base
  id: number;
  name: string;
  firstName: string;
  lastName: string;
  sex: 'M' | 'F';
  photoUrl?: string;
  
  // Statut
  alive: boolean;
  birthday?: string;
  deathDate?: string;
  age?: number;
  
  // Relations
  children?: TreeNode[];
  spouses?: SpouseInfo[];
  
  // Métadonnées pour la visualisation
  generation: number;  // 0 = racine, +1 = descendants, -1 = ascendants
  isRoot: boolean;
  hasAccount: boolean;
  
  // Position (calculée par D3)
  x?: number;
  y?: number;
  depth?: number;
}

interface SpouseInfo {
  personId: number;
  name: string;
  photoUrl?: string;
  weddingDate?: string;
  divorceDate?: string;
  isActive: boolean;
}
```

### 3.3 Algorithme de Transformation

```typescript
/**
 * Transforme les données plates de l'API en arbre hiérarchique
 */
function buildFamilyTree(
  persons: Person[],
  weddings: Wedding[],
  rootPersonId: number
): TreeNode {
  // 1. Créer un index des personnes par ID
  const personsMap = new Map(persons.map(p => [p.personID, p]));
  
  // 2. Créer un index des mariages par personne
  const weddingsMap = new Map<number, Wedding[]>();
  weddings.forEach(w => {
    if (!weddingsMap.has(w.manID)) weddingsMap.set(w.manID, []);
    if (!weddingsMap.has(w.womanID)) weddingsMap.set(w.womanID, []);
    weddingsMap.get(w.manID)!.push(w);
    weddingsMap.get(w.womanID)!.push(w);
  });
  
  // 3. Fonction récursive de construction
  function buildNode(personId: number, generation: number, visited: Set<number>): TreeNode {
    if (visited.has(personId)) {
      // Éviter les boucles infinies
      return null;
    }
    visited.add(personId);
    
    const person = personsMap.get(personId);
    if (!person) return null;
    
    // Trouver les enfants
    const children = persons
      .filter(p => p.fatherID === personId || p.motherID === personId)
      .map(child => buildNode(child.personID, generation + 1, visited))
      .filter(node => node !== null);
    
    // Trouver les conjoints
    const marriages = weddingsMap.get(personId) || [];
    const spouses = marriages.map(w => {
      const spouseId = w.manID === personId ? w.womanID : w.manID;
      const spouse = personsMap.get(spouseId);
      return spouse ? {
        personId: spouse.personID,
        name: `${spouse.firstName} ${spouse.lastName}`,
        photoUrl: spouse.photoUrl,
        weddingDate: w.weddingDate,
        divorceDate: w.divorceDate,
        isActive: w.isActive
      } : null;
    }).filter(s => s !== null);
    
    return {
      id: person.personID,
      name: `${person.firstName} ${person.lastName}`,
      firstName: person.firstName,
      lastName: person.lastName,
      sex: person.sex,
      photoUrl: person.photoUrl,
      alive: person.alive,
      birthday: person.birthday,
      deathDate: person.deathDate,
      children: children.length > 0 ? children : undefined,
      spouses: spouses.length > 0 ? spouses : undefined,
      generation,
      isRoot: personId === rootPersonId,
      hasAccount: person.canLogin || false
    };
  }
  
  return buildNode(rootPersonId, 0, new Set());
}
```

---

## 4. Spécifications de Design

### 4.1 Style des Nœuds (Profils)

```typescript
interface NodeStyle {
  // Forme du cadre
  shape: 'vintage-photo' | 'ornate-frame' | 'leaf-shape';
  borderRadius: string;  // Ondulé avec clip-path SVG
  
  // Couleurs selon le statut
  borderColor: {
    male: '#4A90E2',      // Bleu
    female: '#E24A90',    // Rose
    root: '#FFD700',      // Or
    hasAccount: '#4CAF50' // Vert
  };
  
  // Dimensions
  width: 150;
  height: 180;
  photoSize: 120;
  
  // Effets
  shadow: '0 4px 12px rgba(0,0,0,0.15)';
  hoverShadow: '0 8px 24px rgba(0,0,0,0.25)';
  transition: 'all 0.3s ease';
}
```

#### SVG Clip-Path pour Cadres Vintage

```svg
<defs>
  <clipPath id="vintage-frame">
    <path d="M10,0 Q0,0 0,10 L0,170 Q0,180 10,180 L140,180 Q150,180 150,170 L150,10 Q150,0 140,0 Z" />
  </clipPath>
  
  <clipPath id="ornate-frame">
    <!-- Forme plus complexe avec courbes Bézier -->
    <path d="M75,0 C30,0 15,5 5,20 C-5,35 0,60 0,90 C0,120 -5,145 5,160 C15,175 30,180 75,180 C120,180 135,175 145,160 C155,145 150,120 150,90 C150,60 155,35 145,20 C135,5 120,0 75,0 Z" />
  </clipPath>
</defs>
```

### 4.2 Style des Liens (Branches)

```typescript
interface LinkStyle {
  // Type de courbe
  curveType: 'branch' | 'organic-bezier';
  
  // Apparence
  stroke: '#8B4513';        // Marron bois
  strokeWidth: {
    parent: 4,              // Plus épais près du tronc
    child: 2,               // Plus fin aux extrémités
    spouse: 3               // Largeur moyenne pour liens maritaux
  };
  
  // Texture (optionnel)
  strokeDasharray: 'none' | '5,3';  // Pour imiter l'écorce
  
  // Animation
  transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
}
```

#### Fonction de Génération de Courbes Organiques

```typescript
function generateOrganicPath(
  source: { x: number, y: number },
  target: { x: number, y: number },
  type: 'parent' | 'spouse'
): string {
  if (type === 'parent') {
    // Courbe verticale (parent -> enfant)
    const midY = (source.y + target.y) / 2;
    return `M ${source.x},${source.y}
            C ${source.x},${midY}
              ${target.x},${midY}
              ${target.x},${target.y}`;
  } else {
    // Courbe horizontale (conjoint)
    const midX = (source.x + target.x) / 2;
    return `M ${source.x},${source.y}
            Q ${midX},${source.y - 20}
              ${target.x},${target.y}`;
  }
}
```

### 4.3 Éléments Décoratifs

```typescript
interface DecorativeElements {
  // Tronc d'arbre à la racine
  trunk: {
    width: 80,
    height: 200,
    gradient: ['#3E2723', '#5D4037', '#6D4C41'],
    texture: 'bark-pattern.svg'
  };
  
  // Feuilles dispersées
  leaves: {
    count: 50,
    sizes: [10, 15, 20],
    colors: ['#4CAF50', '#66BB6A', '#81C784', '#A5D6A7'],
    animation: 'gentle-sway',
    distribution: 'random-around-nodes'
  };
  
  // Racines (optionnel)
  roots: {
    visible: boolean,
    style: 'underground-network'
  };
}
```

---

## 5. Layout et Positionnement

### 5.1 Configuration D3 Tree Layout

```typescript
import * as d3 from 'd3';

function createTreeLayout(width: number, height: number) {
  return d3.tree<TreeNode>()
    .size([width, height])
    .nodeSize([200, 250])  // Espacement horizontal et vertical
    .separation((a, b) => {
      // Plus d'espace entre branches différentes
      return a.parent === b.parent ? 1 : 2;
    });
}
```

### 5.2 Stratégie de Positionnement

```typescript
interface LayoutStrategy {
  // Direction de croissance
  direction: 'top-down' | 'bottom-up' | 'left-right';
  
  // Point focal
  focusNode: number;  // ID de la personne au centre
  
  // Niveaux affichés
  generations: {
    ancestors: number;    // Ex: 3 générations d'ancêtres
    descendants: number;  // Ex: 3 générations de descendants
  };
  
  // Gestion des conjoints
  spousePosition: 'side-by-side' | 'stacked';
  
  // Gestion des frères/sœurs
  siblingsLayout: 'horizontal-row' | 'compact-grid';
}
```

### 5.3 Algorithme de Positionnement des Conjoints

```typescript
function positionSpouses(node: d3.HierarchyPointNode<TreeNode>): void {
  if (!node.data.spouses || node.data.spouses.length === 0) return;
  
  const spouseOffset = 180; // Distance horizontale
  
  node.data.spouses.forEach((spouse, index) => {
    const spouseX = node.x + spouseOffset * (index + 1);
    const spouseY = node.y;
    
    // Ajouter le nœud conjoint à la visualisation
    // (géré séparément car non dans la hiérarchie principale)
  });
}
```

---

## 6. Palette de Couleurs

### 6.1 Couleurs Principales

```css
:root {
  /* Cadres selon le sexe */
  --color-male-border: #4A90E2;
  --color-female-border: #E24A90;
  
  /* Statuts spéciaux */
  --color-root-border: #FFD700;
  --color-account-border: #4CAF50;
  --color-deceased-overlay: rgba(0, 0, 0, 0.3);
  
  /* Branches et bois */
  --color-branch-main: #8B4513;
  --color-branch-secondary: #A0522D;
  --color-trunk: #3E2723;
  
  /* Feuillage */
  --color-leaf-1: #4CAF50;
  --color-leaf-2: #66BB6A;
  --color-leaf-3: #81C784;
  --color-leaf-4: #A5D6A7;
  
  /* Arrière-plan */
  --color-bg-sky: linear-gradient(180deg, #E3F2FD 0%, #FFFFFF 100%);
}
```

### 6.2 Règles d'Application

| Élément | Condition | Couleur |
|---------|-----------|---------|
| Cadre homme | `sex === 'M'` | Bleu (`--color-male-border`) |
| Cadre femme | `sex === 'F'` | Rose (`--color-female-border`) |
| Cadre racine | `isRoot === true` | Or (`--color-root-border`) |
| Badge compte | `hasAccount === true` | Vert (`--color-account-border`) |
| Overlay décédé | `alive === false` | Gris transparent |

---

## 7. Interactions et Animations

### 7.1 Actions Utilisateur

```typescript
interface NodeInteractions {
  // Click sur un nœud
  onClick: (node: TreeNode) => void;
  // Ex: Afficher le profil détaillé
  
  // Hover sur un nœud
  onHover: (node: TreeNode) => void;
  // Ex: Afficher tooltip avec infos rapides
  
  // Double-click sur un nœud
  onDoubleClick: (node: TreeNode) => void;
  // Ex: Recentrer l'arbre sur cette personne
  
  // Right-click
  onContextMenu: (node: TreeNode, event: MouseEvent) => void;
  // Ex: Ouvrir menu contextuel (éditer, supprimer, etc.)
}
```

### 7.2 Animations

```typescript
interface Animations {
  // Apparition initiale
  initialLoad: {
    duration: 1000,
    stagger: 50,  // Délai entre chaque nœud
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
  };
  
  // Transition entre vues
  viewTransition: {
    duration: 800,
    type: 'smooth-zoom'
  };
  
  // Hover
  hover: {
    scale: 1.05,
    duration: 200
  };
  
  // Ajout de nœud
  nodeAdd: {
    type: 'fade-in-up',
    duration: 500
  };
}
```

---

## 8. Plan d'Implémentation

### Phase 1 : Préparation (Semaine 1)
- [ ] Installer D3.js v7 (`npm install d3 @types/d3`)
- [ ] Créer service API pour récupérer données hiérarchiques
- [ ] Implémenter fonction `buildFamilyTree()`
- [ ] Tests unitaires de transformation de données

### Phase 2 : Prototype Basique (Semaine 2)
- [ ] Créer composant React `FamilyTreeD3`
- [ ] Implémenter layout D3 de base (tree layout)
- [ ] Afficher nœuds simples (cercles) et liens (lignes droites)
- [ ] Tests de performance (1000+ nœuds)

### Phase 3 : Stylisation (Semaine 3)
- [ ] Créer SVG clip-paths pour cadres vintage
- [ ] Implémenter courbes de Bézier pour branches
- [ ] Ajouter photos et informations dans les nœuds
- [ ] Appliquer palette de couleurs

### Phase 4 : Décoration (Semaine 4)
- [ ] Ajouter tronc d'arbre à la racine
- [ ] Générer et positionner feuilles décoratives
- [ ] Implémenter textures (écorce, bois)
- [ ] Arrière-plan dégradé ciel

### Phase 5 : Interactions (Semaine 5)
- [ ] Implémenter zoom et pan (D3 zoom behavior)
- [ ] Ajouter tooltips au hover
- [ ] Click pour profil détaillé
- [ ] Double-click pour recentrer
- [ ] Menu contextuel (right-click)

### Phase 6 : Optimisation et Finitions (Semaine 6)
- [ ] Lazy loading des branches lointaines
- [ ] Caching des rendus SVG
- [ ] Responsive design (mobile/tablet/desktop)
- [ ] Tests d'accessibilité (ARIA labels)
- [ ] Documentation utilisateur

---

## 9. Exemple de Code : Composant React

```tsx
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { TreeNode } from '../types/tree';
import { buildFamilyTree } from '../services/treeBuilder';

interface FamilyTreeD3Props {
  persons: Person[];
  weddings: Wedding[];
  rootPersonId: number;
}

export const FamilyTreeD3: React.FC<FamilyTreeD3Props> = ({
  persons,
  weddings,
  rootPersonId
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  
  useEffect(() => {
    if (!svgRef.current) return;
    
    // 1. Construire l'arbre hiérarchique
    const treeData = buildFamilyTree(persons, weddings, rootPersonId);
    
    // 2. Configurer D3
    const width = 1200;
    const height = 800;
    
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);
    
    // Clear previous content
    svg.selectAll('*').remove();
    
    // 3. Créer le layout
    const treeLayout = d3.tree<TreeNode>()
      .size([width - 200, height - 200])
      .nodeSize([180, 250]);
    
    const root = d3.hierarchy(treeData);
    const treeNodes = treeLayout(root);
    
    // 4. Dessiner les liens (branches)
    const g = svg.append('g')
      .attr('transform', 'translate(100, 100)');
    
    g.selectAll('.link')
      .data(treeNodes.links())
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('d', d => {
        const source = d.source as d3.HierarchyPointNode<TreeNode>;
        const target = d.target as d3.HierarchyPointNode<TreeNode>;
        return `M ${source.x},${source.y}
                C ${source.x},${(source.y + target.y) / 2}
                  ${target.x},${(source.y + target.y) / 2}
                  ${target.x},${target.y}`;
      })
      .attr('fill', 'none')
      .attr('stroke', '#8B4513')
      .attr('stroke-width', 3);
    
    // 5. Dessiner les nœuds (personnes)
    const nodes = g.selectAll('.node')
      .data(treeNodes.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.x}, ${d.y})`);
    
    // Cadre du nœud
    nodes.append('rect')
      .attr('x', -75)
      .attr('y', -90)
      .attr('width', 150)
      .attr('height', 180)
      .attr('rx', 10)
      .attr('fill', 'white')
      .attr('stroke', d => d.data.sex === 'M' ? '#4A90E2' : '#E24A90')
      .attr('stroke-width', 3);
    
    // Photo
    nodes.append('image')
      .attr('x', -60)
      .attr('y', -75)
      .attr('width', 120)
      .attr('height', 120)
      .attr('href', d => d.data.photoUrl || '/default-avatar.png')
      .attr('clip-path', 'circle(60px at 60px 60px)');
    
    // Nom
    nodes.append('text')
      .attr('y', 65)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .text(d => d.data.name);
    
  }, [persons, weddings, rootPersonId]);
  
  return (
    <div className="family-tree-container">
      <svg ref={svgRef}></svg>
    </div>
  );
};
```

---

## 10. Ressources et Références

### Documentation
- [D3.js Official Documentation](https://d3js.org/)
- [D3 Hierarchy](https://github.com/d3/d3-hierarchy)
- [SVG Paths Tutorial](https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths)

### Exemples Inspirants
- [Observable - Family Tree Visualization](https://observablehq.com/@d3/tree)
- [D3 Gallery - Trees](https://observablehq.com/@d3/gallery#trees)
- [Interactive Family Tree Example](https://observablehq.com/@mbostock/tree-of-life)

### Assets Graphiques
- Textures de bois : [Unsplash Wood Textures](https://unsplash.com/s/photos/wood-texture)
- Feuilles SVG : [SVG Repo - Leaves](https://www.svgrepo.com/vectors/leaf/)
- Cadres vintage : [Freepik - Vintage Frames](https://www.freepik.com/free-photos-vectors/vintage-frame)

---

## 11. Checklist de Validation

Avant de considérer le projet terminé :

- [ ] L'arbre affiche correctement 3 générations d'ascendants et descendants
- [ ] Les conjoints sont visibles et correctement positionnés
- [ ] Les branches ressemblent à un arbre organique (pas de lignes droites)
- [ ] Les cadres sont stylisés (pas de rectangles simples)
- [ ] La palette de couleurs est appliquée selon le sexe et le statut
- [ ] Le tronc et les feuilles décoratives sont présents
- [ ] L'arbre est responsive (fonctionne sur mobile)
- [ ] Le zoom et le pan fonctionnent correctement
- [ ] Les performances sont acceptables (>60fps sur 1000 nœuds)
- [ ] Les informations sont accessibles (ARIA labels, contraste)

---

**Dernière mise à jour :** 6 novembre 2025
