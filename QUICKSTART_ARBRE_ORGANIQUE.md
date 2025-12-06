# 🚀 Quick Start - Arbre Généalogique Organique

## Installation (Déjà fait ✅)

```bash
cd frontend
npm install d3 @types/d3
```

## Fichiers Créés

```
frontend/
├── public/
│   └── default-avatar.svg          # Avatar par défaut
├── src/
│   ├── pages/
│   │   └── FamilyTreeOrganic.tsx   # Composant principal
│   ├── services/
│   │   ├── treeBuilder.ts          # Service de transformation
│   │   └── __tests__/
│   │       └── treeBuilder.test.ts # Tests unitaires
│   └── App.tsx                     # Route ajoutée

docs/
└── TREE_VISUALIZATION_V2.md        # Specs complètes

GUIDE_ARBRE_ORGANIQUE.md           # Guide d'implémentation
IMPLEMENTATION_ARBRE_ORGANIQUE_RESUME.md  # Résumé exécutif
```

## Accès Rapide

### URL
```
http://localhost:3000/family-tree-organic
```

### Depuis le Dashboard
1. Se connecter
2. Menu → "Arbre Généalogique"  
3. Bouton "Vue Organique"

## Architecture en 3 Étapes

### 1️⃣ Récupération des Données
```typescript
// API REST
const personsRes = await api.get('/persons');
const weddingsRes = await api.get('/marriages/family');
```

### 2️⃣ Transformation Hiérarchique
```typescript
// Service treeBuilder
const tree = buildFamilyTree(
  personsRes.data,  // Liste plate
  weddingsRes.data, // Mariages
  rootPersonId      // Point de départ
);

// Résultat
TreeNode {
  id: 1,
  name: "Jean DUPONT",
  children: [
    { id: 3, name: "Pierre DUPONT", children: [...] }
  ]
}
```

### 3️⃣ Rendu D3.js
```typescript
// Layout hiérarchique
const treeLayout = d3.tree<TreeNode>()
  .size([width, height])
  .nodeSize([200, 300]);

// Appliquer le layout
const root = d3.hierarchy(treeData);
const treeNodes = treeLayout(root);

// Dessiner SVG
svg.selectAll('.node')
  .data(treeNodes.descendants())
  .enter()
  .append('g')
  .attr('transform', d => `translate(${d.x}, ${d.y})`);
```

## Personnalisation Rapide

### Changer les Couleurs

```typescript
// Dans FamilyTreeOrganic.tsx, ligne ~245
.attr('stroke', d => {
  if (d.data.isRoot) return '#FFD700';      // Or pour racine
  if (d.data.hasAccount) return '#4CAF50';  // Vert si compte
  return d.data.sex === 'M' ? '#4A90E2' : '#E24A90';  // Bleu/Rose
})
```

### Changer l'Espacement

```typescript
// Dans FamilyTreeOrganic.tsx, ligne ~189
const treeLayout = d3.tree<TreeNode>()
  .nodeSize([200, 300])  // [horizontal, vertical]
  .separation((a, b) => {
    return a.parent === b.parent ? 1.2 : 1.5;  // Facteur d'espacement
  });
```

### Ajouter des Informations

```typescript
// Après le nom (ligne ~305)
nodes.append('text')
  .attr('y', 90)
  .attr('text-anchor', 'middle')
  .style('font-size', '10px')
  .style('fill', '#999')
  .text(d => d.data.email || '');  // Afficher l'email
```

## Debugging

### Voir les Données Transformées

```typescript
// Dans FamilyTreeOrganic.tsx, après buildFamilyTree()
console.log('🌳 Tree data:', treeData);
console.log('📊 Statistics:', getTreeStatistics(treeData));
console.log('🔢 Total nodes:', countNodes(treeData));
```

### Voir les Nœuds D3

```typescript
// Après treeLayout()
console.log('D3 nodes:', treeNodes.descendants());
console.log('D3 links:', treeNodes.links());
```

### Afficher les Coordonnées

```typescript
// Lors du rendu des nœuds
nodes.each((d, i, nodes) => {
  console.log(`Node ${d.data.name}: x=${d.x}, y=${d.y}`);
});
```

## FAQ Rapide

### ❓ Comment ajouter un bouton pour basculer entre vues ?

```typescript
// Dans Dashboard ou Header
<Button onClick={() => navigate('/family-tree-organic')}>
  🌳 Vue Organique
</Button>
```

### ❓ Comment afficher seulement 3 générations ?

```typescript
// Utiliser buildExtendedFamilyTree au lieu de buildFamilyTree
const tree = buildExtendedFamilyTree(
  persons,
  weddings,
  focusPersonId,
  3  // 3 générations d'ancêtres
);
```

### ❓ Comment exporter en SVG ?

```typescript
const svgElement = svgRef.current;
const svgData = new XMLSerializer().serializeToString(svgElement);
const blob = new Blob([svgData], { type: 'image/svg+xml' });
const url = URL.createObjectURL(blob);

// Télécharger
const link = document.createElement('a');
link.href = url;
link.download = 'family-tree.svg';
link.click();
```

### ❓ Comment changer la taille des nœuds ?

```typescript
// Ajuster les dimensions du rectangle (ligne ~240)
nodes.append('rect')
  .attr('x', -100)      // Largeur = 200px
  .attr('y', -110)      // Hauteur = 220px
  .attr('width', 200)
  .attr('height', 220);

// Et la photo (ligne ~252)
nodes.append('image')
  .attr('x', -75)
  .attr('y', -90)
  .attr('width', 150)
  .attr('height', 150);
```

## Performance Tips

### ✅ Bonnes Pratiques
- Utiliser `React.memo()` si re-renders fréquents
- Limiter le nombre de feuilles décoratives (actuellement 30)
- Désactiver animations pour grands arbres (>200 nœuds)

### ❌ À Éviter
- Ne pas redessiner tout l'arbre à chaque interaction
- Ne pas utiliser d'images lourdes (>100KB)
- Ne pas oublier de cleanup les event listeners

## Tests

### Exécuter les Tests
```bash
cd frontend
npm install --save-dev @types/jest
npm test
```

### Tester Manuellement
1. Connectez-vous avec un compte test
2. Accédez à `/family-tree-organic`
3. Vérifiez :
   - ✅ L'arbre s'affiche
   - ✅ Zoom fonctionne (molette)
   - ✅ Pan fonctionne (glisser)
   - ✅ Click → profil
   - ✅ Double-click → recentrage

## Dépannage

### "Aucune donnée d'arbre disponible"
- Vérifiez que vous êtes connecté
- Vérifiez que `focusPersonId` est valide
- Vérifiez la console pour erreurs API

### Nœuds coupés ou hors écran
- Augmentez `margin` (ligne ~113)
- Ajustez `innerWidth` et `innerHeight`

### Photos ne s'affichent pas
- Vérifiez le chemin de `photoUrl` dans la BD
- Utilisez `/default-avatar.svg` en fallback
- Vérifiez les CORS si images externes

### Animations saccadées
- Réduisez `duration` (ligne ~326, ~339)
- Désactivez transitions pour tests

## Next Steps

### Améliorer le Design
- [ ] Ajouter textures SVG pour le bois
- [ ] Créer des clip-paths vintage complexes
- [ ] Animer les feuilles (CSS keyframes)

### Améliorer les Interactions
- [ ] Tooltip détaillé au hover
- [ ] Menu contextuel (right-click)
- [ ] Recherche de personne

### Étendre les Fonctionnalités
- [ ] Afficher les conjoints côte à côte
- [ ] Filtrer par branche
- [ ] Mode plein écran

## Ressources

### Documentation
- [D3.js Official](https://d3js.org/)
- [React + D3](https://2019.wattenberger.com/blog/react-and-d3)
- [SVG Tutorial](https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial)

### Exemples
- [Observable D3 Tree](https://observablehq.com/@d3/tree)
- [D3 Graph Gallery](https://www.d3-graph-gallery.com/tree.html)

### Communauté
- [D3 Slack](https://d3js.slack.com/)
- [StackOverflow #d3.js](https://stackoverflow.com/questions/tagged/d3.js)

---

**Bon développement ! 🌳**
