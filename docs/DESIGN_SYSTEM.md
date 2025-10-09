# 🎨 Design System - Application Généalogie Familiale

## Vue d'ensemble

Design system inspiré par les principes de **Dieter Rams** (Less but better), **Don Norman** (Design Émotionnel) et l'esthétique d'**Apple** et **Notion**.

---

## 🎯 Principes de Design

### 1. **Less is More** (Dieter Rams)
- Interface épurée et minimaliste
- Chaque élément a une fonction claire
- Pas de décoration superflue

### 2. **Design Émotionnel** (Don Norman)
- Couleurs chaleureuses et accueillantes
- Animations fluides et naturelles
- Feedback immédiat sur chaque action

### 3. **Affordance & Clarté**
- Les boutons ressemblent à des boutons
- Les cartes invitent au clic
- Les hiérarchies visuelles sont évidentes

### 4. **Accessibilité First**
- Contraste suffisant (WCAG AA)
- Support clavier complet
- Reduced motion pour sensibilités

---

## 🎨 Palette de Couleurs

### Couleurs Principales

```typescript
brand: {
  500: '#FF6B6B',  // Rouge chaleureux principal
  600: '#E85555',  // Hover states
  700: '#D13F3F',  // Active states
}
```

### Couleurs par Famille

```typescript
family: {
  primary: '#FF6B6B',      // Rouge chaleureux
  secondary: '#4ECDC4',    // Turquoise apaisant
  tertiary: '#45B7D1',     // Bleu ciel
  quaternary: '#FFA07A',   // Orange saumon
  quinary: '#98D8C8',      // Vert menthe
}
```

### Neutres (Apple-inspired)

```typescript
neutral: {
  50: '#FAFAFA',   // Fond principal
  100: '#F5F5F5',  // Fond secondaire
  200: '#E8E8E8',  // Bordures
  900: '#171717',  // Texte principal
}
```

### Dégradés Émotionnels

```typescript
gradient: {
  warm: 'linear-gradient(135deg, #FFE8E8 0%, #FFD6D6 100%)',
  cool: 'linear-gradient(135deg, #E0F7FA 0%, #B2EBF2 100%)',
  sunset: 'linear-gradient(135deg, #FFF5E6 0%, #FFE0B2 100%)',
  nature: 'linear-gradient(135deg, #F1F8E9 0%, #DCEDC8 100%)',
  love: 'linear-gradient(135deg, #FCE4EC 0%, #F8BBD0 100%)',
}
```

---

## 📝 Typographie

### Fonts

- **Headings**: Poppins (600-700)
- **Body**: Inter (400-500)

```css
/* Features OpenType d'Inter */
font-feature-settings: 'cv02', 'cv03', 'cv04', 'cv11';
```

### Échelle

```typescript
fontSizes: {
  xs: '0.75rem',    // 12px
  sm: '0.875rem',   // 14px
  md: '1rem',       // 16px (base)
  lg: '1.125rem',   // 18px
  xl: '1.25rem',    // 20px
  2xl: '1.5rem',    // 24px
  3xl: '1.875rem',  // 30px
  4xl: '2.25rem',   // 36px
  5xl: '3rem',      // 48px
}
```

### Letter-spacing

- Headings: `-0.02em` (plus serré)
- Body: `-0.01em` (légèrement serré)

---

## 📐 Espacements

Grid de **8px** (système Apple)

```typescript
space: {
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '1rem',       // 16px
  lg: '1.5rem',     // 24px
  xl: '2rem',       // 32px
  2xl: '3rem',      // 48px
  3xl: '4rem',      // 64px
  4xl: '6rem',      // 96px
}
```

---

## 🔲 Bordures

Bordures douces et arrondies (style Apple)

```typescript
radii: {
  sm: '0.375rem',   // 6px
  base: '0.5rem',   // 8px
  md: '0.75rem',    // 12px
  lg: '1rem',       // 16px
  xl: '1.5rem',     // 24px
  2xl: '2rem',      // 32px
  full: '9999px',   // Cercle parfait
}
```

---

## 🌑 Ombres

Ombres douces et subtiles

```typescript
shadows: {
  card: '0 2px 8px rgba(0, 0, 0, 0.08)',       // Cartes au repos
  float: '0 8px 24px rgba(0, 0, 0, 0.12)',     // Cartes au hover
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',   // Modals
  2xl: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', // Overlays
}
```

---

## ✨ Animations

### Durées

```typescript
transition: {
  fast: '150ms',
  base: '200ms',
  slow: '300ms',
  slower: '500ms',
}
```

### Easing (Courbes de Bézier)

```typescript
easing: {
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)', // Effet rebond
}
```

### Animations Keyframes

**fadeIn**
```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
```

**slideIn**
```css
@keyframes slideIn {
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
}
```

**pulse**
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
```

---

## 🎴 Composants

### Boutons

```tsx
<Button variant="primary">
  Action Principale
</Button>
```

**Variants**:
- `primary`: Fond coloré (brand.500)
- `ghost`: Transparent avec hover
- `outline`: Bordure avec fond transparent

**États**:
- Hover: `translateY(-2px)` + shadow
- Active: `translateY(0)`
- Focus: Ring coloré (accessibilité)

### Cartes

```tsx
<Card>
  <CardBody>Contenu</CardBody>
</Card>
```

**Comportement**:
- Hover: `translateY(-4px)` + shadow升级
- Transition: `0.3s ease-in-out`
- Border-radius: `xl` (16px)

### Cartes Membre (FamilyMemberCard)

```tsx
<FamilyMemberCard
  person={person}
  familyColor="#FF6B6B"
  variant="tree" // 'tree' | 'list' | 'compact'
  onClick={handleClick}
/>
```

**Caractéristiques**:
- Barre colorée top (famille)
- Bordure latérale (sexe: bleu M / rose F)
- Avatar avec badge statut
- Hover: scale(1.05) + translateY(-4px)
- Effet brillance au survol

---

## 🌳 Arbre Généalogique

### Nœuds

```typescript
treeNodeStyles: {
  base: {
    bg: 'white',
    borderRadius: 'xl',
    boxShadow: 'card',
    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
    _hover: {
      transform: 'scale(1.05) translateY(-4px)',
      boxShadow: 'float',
    },
  },
  male: { borderLeft: '4px solid #4A90E2' },
  female: { borderLeft: '4px solid #FF6B9D' },
}
```

### Connexions SVG

```typescript
connectionStyles: {
  parent: {
    stroke: '#D4D4D4',
    strokeWidth: 2,
  },
  marriage: {
    stroke: '#FF6B9D',
    strokeWidth: 3,
  },
  sibling: {
    stroke: '#A3A3A3',
    strokeWidth: 1.5,
    strokeDasharray: '5,5',
  },
}
```

---

## 📱 Responsive Design

### Breakpoints (Chakra UI)

```typescript
breakpoints: {
  base: '0px',     // Mobile
  sm: '480px',     // Petit mobile
  md: '768px',     // Tablette
  lg: '992px',     // Desktop
  xl: '1280px',    // Large desktop
  2xl: '1536px',   // Extra large
}
```

### Grid System

```tsx
<Grid
  templateColumns={{
    base: '1fr',              // 1 colonne mobile
    md: 'repeat(2, 1fr)',     // 2 colonnes tablette
    lg: 'repeat(3, 1fr)',     // 3 colonnes desktop
  }}
  gap={6}
>
```

---

## ♿ Accessibilité

### Focus Visible

```css
*:focus-visible {
  outline: 2px solid #FF6B6B;
  outline-offset: 2px;
  border-radius: 8px;
}
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Couleurs Selection

```css
::selection {
  background-color: #FFE8E8;
  color: #171717;
}
```

---

## 🎭 Effets Spéciaux

### Glass Morphism

```css
.glass {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.1);
}
```

### Gradient Text

```css
.gradient-text {
  background: linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

### Skeleton Loading

```css
.skeleton {
  background: linear-gradient(
    90deg,
    #F5F5F5 0%,
    #E8E8E8 50%,
    #F5F5F5 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
```

---

## 📚 Utilisation

### Import du Design System

```tsx
import designSystem from './theme/designSystem';
import './styles/global.css';

<ChakraProvider theme={designSystem}>
  <App />
</ChakraProvider>
```

### Utiliser les couleurs

```tsx
<Box bg="brand.500">Principal</Box>
<Box bg="family.secondary">Famille</Box>
<Box bgGradient="gradient.warm">Dégradé</Box>
```

### Utiliser les animations

```tsx
// Avec Framer Motion
<MotionBox
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4 }}
>

// Avec classes CSS
<div className="animate-fade-in">
```

---

## 🎯 Best Practices

### 1. Consistance
✅ Toujours utiliser le design system
❌ Éviter les valeurs en dur (`#FF0000`, `10px`)

### 2. Espacement
✅ Utiliser la grid de 8px
✅ `spacing={4}` au lieu de `gap="16px"`

### 3. Animations
✅ Transition fluide (200-300ms)
✅ Easing naturel (`spring`, `easeOut`)
❌ Éviter les animations trop longues (>500ms)

### 4. Accessibilité
✅ Focus visible sur tous les éléments cliquables
✅ Contraste minimum WCAG AA
✅ Support clavier complet

### 5. Performance
✅ Lazy load des images
✅ Animations GPU (`transform`, `opacity`)
❌ Éviter d'animer `width`, `height`, `top`, `left`

---

## 📦 Composants Disponibles

- ✅ `FamilyMemberCard` - Carte membre avec variantes
- ✅ `FamilyTreeVisualization` - Arbre interactif avec zoom
- ✅ `Timeline` - Frise chronologique
- ✅ `Stories` - Histoires familiales
- ⏳ `PhotoAlbum` - Albums photos (à venir)
- ⏳ `EventCalendar` - Calendrier événements (à venir)

---

## 🎨 Exemples Visuels

### Code Couleur par Famille

Chaque branche familiale a sa couleur pour faciliter la lecture de l'arbre:

- 🔴 Famille 1: Rouge chaleureux (`#FF6B6B`)
- 🔵 Famille 2: Turquoise (`#4ECDC4`)
- 🟡 Famille 3: Bleu ciel (`#45B7D1`)
- 🟠 Famille 4: Orange saumon (`#FFA07A`)
- 🟢 Famille 5: Vert menthe (`#98D8C8`)

### Indicateurs Visuels

- 💙 Bordure bleue: Homme
- 💗 Bordure rose: Femme
- 💍 Ligne rose épaisse: Mariage
- 👨‍👩‍👧 Ligne grise: Filiation parent-enfant
- 🕊️ Icône cœur gris: Décédé

---

## 🚀 Prochaines Étapes

1. **Framer Motion** - Installer pour animations avancées
2. **React Query** - Cache et optimisation API
3. **React Virtuoso** - Liste virtualisée (performance)
4. **D3.js** - Visualisations avancées arbre
5. **React Spring** - Animations physiques naturelles

---

## 📞 Support

Pour toute question sur le design system:
- Consulter ce guide
- Voir exemples dans `/components`
- Tester dans Storybook (à venir)

**Version**: 1.0.0  
**Dernière mise à jour**: Octobre 2025
