# 📱 Guide d'Utilisation - ResponsiveTreeWrapper

## 🎯 Objectif

Le composant `ResponsiveTreeWrapper` permet de rendre n'importe quel arbre généalogique **100% tactile et responsive**, avec support natif pour:

- 👆 **Pan** (déplacement avec 1 doigt ou souris)
- 🤏 **Pinch-to-zoom** (zoom avec 2 doigts sur mobile)
- 🖱️ **Molette souris** (zoom sur desktop)
- 🔘 **Contrôles visuels** (+/- et reset)
- 📱 **Aide contextuelle** (uniquement sur mobile)

---

## 🚀 Utilisation Basique

### 1. Import du Composant

```tsx
import ResponsiveTreeWrapper from '../components/ResponsiveTreeWrapper';
```

### 2. Wrapper l'Arbre Existant

```tsx
<ResponsiveTreeWrapper
  initialScale={1}
  minScale={0.3}
  maxScale={3}
  height="80vh"
>
  {/* Votre arbre généalogique existant */}
  <Box>
    {renderParents()}
    {renderFocusPerson()}
    {renderChildren()}
  </Box>
</ResponsiveTreeWrapper>
```

---

## ⚙️ Props Disponibles

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `children` | `ReactNode` | **Requis** | Le contenu de l'arbre à rendre interactif |
| `initialScale` | `number` | `1` | Échelle de zoom initiale (1 = 100%) |
| `minScale` | `number` | `0.3` | Zoom minimum (0.3 = 30%) |
| `maxScale` | `number` | `3` | Zoom maximum (3 = 300%) |
| `height` | `string` | `"80vh"` | Hauteur du conteneur (supporte vh, px, %, etc.) |
| `enablePan` | `boolean` | `true` | Activer/désactiver le déplacement |
| `enableZoom` | `boolean` | `true` | Activer/désactiver le zoom |

---

## 📋 Exemple Complet - FamilyTreeEnhanced.tsx

### Avant (Sans Support Tactile)

```tsx
return (
  <Container maxW="8xl" py={6}>
    <VStack spacing={6}>
      {/* Header */}
      <HStack>...</HStack>
      
      {/* Arbre */}
      <Box w="full">
        {renderParents()}
        {renderFocusPerson()}
        {renderChildren()}
      </Box>
    </VStack>
  </Container>
);
```

### Après (Avec Support Tactile)

```tsx
import ResponsiveTreeWrapper from '../components/ResponsiveTreeWrapper';

return (
  <Container maxW="8xl" py={6}>
    <VStack spacing={6}>
      {/* Header - RESTE EN DEHORS du wrapper */}
      <HStack>
        <Button>Rechercher</Button>
        <Button>Statistiques</Button>
      </HStack>
      
      {/* Arbre - WRAPPÉ pour le tactile */}
      <ResponsiveTreeWrapper
        initialScale={1}
        minScale={0.5}
        maxScale={2.5}
        height="75vh"
      >
        <Box w="full">
          {renderParents()}
          {renderFocusPerson()}
          {renderChildren()}
        </Box>
      </ResponsiveTreeWrapper>
    </VStack>
  </Container>
);
```

---

## 🎨 Fonctionnalités Automatiques

### 1. Contrôles de Zoom (Haut-Droite)

Le wrapper affiche automatiquement 3 boutons:
- ➕ **Zoom avant** (`zoomIn()`)
- ➖ **Zoom arrière** (`zoomOut()`)
- 🔄 **Recentrer** (`resetTransform()`)

Ces contrôles sont **toujours visibles** et permettent une navigation sans gestes.

### 2. Aide Tactile (Bas-Centre, Mobile uniquement)

Sur les appareils tactiles (détectés via `isTouchDevice()`), une bannière d'aide s'affiche en bas:

```
👆 1 doigt = déplacer | 🤏 2 doigts = zoomer | 👆👆 double-tap = recentrer
```

Cette aide est **semi-transparente** et disparaît après quelques secondes (optionnel).

### 3. Curseur Adaptatif

- **Desktop**: `cursor: grab` (main ouverte)
- **Pendant le drag**: `cursor: grabbing` (main fermée)
- **Si pan désactivé**: `cursor: default`

---

## 🧪 Tests à Effectuer

### Sur Desktop (Chrome DevTools)
1. Ouvrir l'inspecteur (F12)
2. Activer le mode responsive (Cmd+Shift+M / Ctrl+Shift+M)
3. Tester plusieurs tailles d'écran

### Sur Mobile Réel
1. iPhone: Safari
2. Android: Chrome
3. Tester les gestes:
   - ✅ Pan (1 doigt)
   - ✅ Pinch-to-zoom (2 doigts)
   - ✅ Double-tap (recentrer)

---

## ⚠️ Points d'Attention

### 1. Ne PAS Wrapper les Contrôles

```tsx
// ❌ MAUVAIS - Les boutons seront difficiles à cliquer
<ResponsiveTreeWrapper>
  <Button>Rechercher</Button>
  {renderTree()}
</ResponsiveTreeWrapper>

// ✅ BON - Les contrôles restent fixes
<VStack>
  <Button>Rechercher</Button>
  <ResponsiveTreeWrapper>
    {renderTree()}
  </ResponsiveTreeWrapper>
</VStack>
```

### 2. Performance sur Gros Arbres

Pour les arbres avec **+ de 100 personnes**, considérer:
- Lazy loading des branches
- Virtualisation (afficher uniquement la vue visible)
- Réduire `maxScale` à 2 au lieu de 3

### 3. Conflits avec d'Autres Bibliothèques

Si vous utilisez déjà une bibliothèque de graphe (D3, vis.js, etc.):
- Désactiver **leur zoom/pan natif**
- Utiliser uniquement le wrapper pour éviter les conflits

---

## 🔧 Personnalisation Avancée

### Changer la Position des Contrôles

Modifier `ResponsiveTreeWrapper.tsx` ligne 105:

```tsx
<Box
  position="absolute"
  top={4}    // 👈 Position verticale
  right={4}  // 👈 Position horizontale
  zIndex={10}
>
```

### Désactiver l'Aide Mobile

Commenter les lignes 145-170 dans `ResponsiveTreeWrapper.tsx`.

### Changer les Couleurs des Contrôles

Modifier les hooks de couleur lignes 38-40:

```tsx
const controlsBg = useColorModeValue('purple.500', 'purple.800');
const controlsBorder = useColorModeValue('purple.300', 'purple.600');
```

---

## 📚 Documentation Technique

### Bibliothèque Utilisée
- **react-zoom-pan-pinch** v3.7.0
- [Documentation officielle](https://github.com/prc5/react-zoom-pan-pinch)

### Compatibilité Navigateurs
- ✅ Chrome 90+
- ✅ Safari 14+
- ✅ Firefox 88+
- ✅ Edge 90+
- ✅ iOS Safari 14+
- ✅ Chrome Android 90+

---

## 🚀 Prochaines Améliorations

1. **Mode Plein Écran** (fullscreen API)
2. **Export PNG/PDF** avec capture de tout l'arbre
3. **Mini-map** (aperçu de l'arbre en bas à droite)
4. **Zoom intelligent** sur une personne spécifique
5. **Historique de navigation** (undo/redo)

---

## 📝 Changelog

### v1.0.0 (3 décembre 2025)
- ✅ Support tactile complet (pan, pinch-to-zoom)
- ✅ Contrôles visuels (+/-, reset)
- ✅ Aide contextuelle mobile
- ✅ Traductions FR/EN
- ✅ Mode sombre supporté

---

**Auteur:** Équipe Family Tree  
**Date:** 3 décembre 2025  
**Statut:** ✅ Production Ready
