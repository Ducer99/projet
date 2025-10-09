# 📱 Guide Responsive Design - Family Tree

## Vue d'ensemble

Ce guide explique comment maintenir une disposition cohérente sur **tous les appareils** (ordinateur, tablette, téléphone).

---

## 1. 🎯 Breakpoints Chakra UI

Chakra UI utilise des breakpoints standard :

```typescript
const breakpoints = {
  base: "0px",      // 📱 Mobile (0-479px)
  sm: "480px",      // 📱 Mobile large (480-767px)
  md: "768px",      // 📱 Tablette (768-991px)
  lg: "992px",      // 💻 Desktop small (992-1279px)
  xl: "1280px",     // 💻 Desktop (1280-1535px)
  "2xl": "1536px"   // 🖥️ Large Desktop (1536px+)
}
```

---

## 2. 🛠️ Techniques Responsive

### A. Props Responsive

```tsx
// ✅ BIEN - Différentes valeurs selon la taille d'écran
<Box 
  width={{ base: "100%", md: "50%", lg: "33%" }}
  padding={{ base: 4, md: 6, lg: 8 }}
  fontSize={{ base: "sm", md: "md", lg: "lg" }}
>
  Contenu adaptatif
</Box>
```

### B. Container avec maxW

```tsx
// ✅ BIEN - Largeur maximale adaptative
<Container 
  maxW={{ base: "100%", sm: "container.sm", md: "container.md", lg: "container.lg" }}
  px={{ base: 4, md: 6 }}
>
  Contenu centré
</Container>
```

### C. Grid Responsive

```tsx
// ✅ BIEN - Grille qui s'adapte
<Grid 
  templateColumns={{ 
    base: "1fr",           // 1 colonne sur mobile
    md: "repeat(2, 1fr)",  // 2 colonnes sur tablette
    lg: "repeat(3, 1fr)"   // 3 colonnes sur desktop
  }}
  gap={{ base: 4, md: 6 }}
>
  <GridItem>Élément 1</GridItem>
  <GridItem>Élément 2</GridItem>
  <GridItem>Élément 3</GridItem>
</Grid>
```

### D. Stack Direction

```tsx
// ✅ BIEN - Vertical sur mobile, horizontal sur desktop
<Stack 
  direction={{ base: "column", md: "row" }}
  spacing={{ base: 4, md: 6 }}
>
  <Box>Gauche/Haut</Box>
  <Box>Droite/Bas</Box>
</Stack>
```

### E. Show/Hide selon écran

```tsx
import { Show, Hide } from '@chakra-ui/react';

// Afficher seulement sur mobile
<Show below="md">
  <MobileMenu />
</Show>

// Afficher seulement sur desktop
<Show above="md">
  <DesktopMenu />
</Show>

// Cacher sur mobile
<Hide below="md">
  <SideBar />
</Hide>
```

---

## 3. 🎨 Exemples Concrets

### A. Dashboard Responsive

```tsx
// ❌ MAUVAIS - Fixe
<Grid templateColumns="repeat(4, 1fr)" gap={6}>
  <StatCard />
  <StatCard />
  <StatCard />
  <StatCard />
</Grid>

// ✅ BIEN - Responsive
<Grid 
  templateColumns={{ 
    base: "1fr",              // 1 colonne sur mobile
    sm: "repeat(2, 1fr)",     // 2 colonnes sur mobile large
    lg: "repeat(4, 1fr)"      // 4 colonnes sur desktop
  }}
  gap={{ base: 4, md: 6 }}
>
  <StatCard />
  <StatCard />
  <StatCard />
  <StatCard />
</Grid>
```

### B. Formulaire Responsive

```tsx
// ✅ BIEN
<VStack spacing={4} w="full">
  <HStack 
    width="100%" 
    spacing={4}
    flexDirection={{ base: "column", md: "row" }}
  >
    <FormControl flex="1">
      <FormLabel>Prénom</FormLabel>
      <Input />
    </FormControl>
    <FormControl flex="1">
      <FormLabel>Nom</FormLabel>
      <Input />
    </FormControl>
  </HStack>
</VStack>
```

### C. Navigation Responsive

```tsx
<Box>
  {/* Mobile Menu */}
  <Show below="md">
    <IconButton 
      icon={<HamburgerIcon />} 
      aria-label="Menu"
      onClick={onOpen}
    />
    <Drawer isOpen={isOpen} onClose={onClose}>
      <MobileNav />
    </Drawer>
  </Show>

  {/* Desktop Menu */}
  <Hide below="md">
    <HStack spacing={8}>
      <NavLink />
      <NavLink />
      <NavLink />
    </HStack>
  </Hide>
</Box>
```

### D. Card Responsive

```tsx
<Box
  bg="white"
  p={{ base: 4, md: 6, lg: 8 }}
  borderRadius={{ base: "md", md: "lg" }}
  boxShadow={{ base: "sm", md: "md", lg: "lg" }}
  width={{ base: "100%", md: "auto" }}
>
  <Heading size={{ base: "md", md: "lg" }}>
    Titre
  </Heading>
  <Text fontSize={{ base: "sm", md: "md" }}>
    Description
  </Text>
</Box>
```

---

## 4. 🖼️ Images Responsive

```tsx
// ✅ BIEN - Image qui s'adapte
<Image 
  src={photoUrl}
  alt="Photo"
  boxSize={{ base: "100px", md: "150px", lg: "200px" }}
  objectFit="cover"
  borderRadius="md"
/>

// Avatar responsive
<Avatar 
  src={photoUrl}
  size={{ base: "md", md: "lg", lg: "xl" }}
/>
```

---

## 5. 📐 Espacement Responsive

```tsx
// Padding responsive
<Box p={{ base: 2, sm: 4, md: 6, lg: 8 }}>
  Contenu
</Box>

// Margin responsive
<Box m={{ base: 2, md: 4, lg: 6 }}>
  Contenu
</Box>

// Spacing dans Stack
<VStack spacing={{ base: 4, md: 6, lg: 8 }}>
  <Item />
  <Item />
</VStack>
```

---

## 6. 🔤 Typographie Responsive

```tsx
<Heading 
  fontSize={{ base: "xl", md: "2xl", lg: "3xl", xl: "4xl" }}
  lineHeight={{ base: "shorter", md: "short" }}
>
  Titre Principal
</Heading>

<Text 
  fontSize={{ base: "sm", md: "md", lg: "lg" }}
  lineHeight={{ base: "base", md: "tall" }}
>
  Texte descriptif
</Text>
```

---

## 7. ⚡ Hook useBreakpointValue

```tsx
import { useBreakpointValue } from '@chakra-ui/react';

function MyComponent() {
  const columns = useBreakpointValue({ 
    base: 1, 
    md: 2, 
    lg: 4 
  });

  const isMobile = useBreakpointValue({ 
    base: true, 
    md: false 
  });

  return (
    <Grid templateColumns={`repeat(${columns}, 1fr)`}>
      {/* Contenu */}
    </Grid>
  );
}
```

---

## 8. 🎯 Checklist Responsive

### ✅ À faire pour chaque page

- [ ] Tester sur mobile (320px - 480px)
- [ ] Tester sur tablette (768px - 1024px)
- [ ] Tester sur desktop (1280px+)
- [ ] Utiliser des props responsive pour :
  - [ ] `width`, `maxW`, `minW`
  - [ ] `padding`, `margin`
  - [ ] `fontSize`, `lineHeight`
  - [ ] `spacing` dans Stack
  - [ ] `gap` dans Grid
  - [ ] `direction` dans Stack
  - [ ] `templateColumns` dans Grid
- [ ] Images et avatars avec tailles adaptatives
- [ ] Navigation adaptée (menu burger sur mobile)
- [ ] Formulaires empilés verticalement sur mobile
- [ ] Boutons pleine largeur sur mobile

---

## 9. 🚫 À éviter

```tsx
// ❌ MAUVAIS - Largeur fixe en pixels
<Box width="500px">Contenu</Box>

// ✅ BIEN - Largeur relative
<Box width={{ base: "100%", md: "500px" }}>Contenu</Box>

// ❌ MAUVAIS - Grid fixe
<Grid templateColumns="repeat(4, 1fr)">

// ✅ BIEN - Grid responsive
<Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }}>

// ❌ MAUVAIS - HStack qui déborde sur mobile
<HStack>
  <Button>Action 1</Button>
  <Button>Action 2</Button>
  <Button>Action 3</Button>
</HStack>

// ✅ BIEN - Stack adaptatif
<Stack direction={{ base: "column", md: "row" }} spacing={4}>
  <Button width={{ base: "full", md: "auto" }}>Action 1</Button>
  <Button width={{ base: "full", md: "auto" }}>Action 2</Button>
  <Button width={{ base: "full", md: "auto" }}>Action 3</Button>
</Stack>
```

---

## 10. 🎨 Patterns Courants

### Pattern 1: Page avec Sidebar

```tsx
<Flex direction={{ base: "column", lg: "row" }}>
  {/* Sidebar */}
  <Box 
    width={{ base: "100%", lg: "250px" }}
    mb={{ base: 4, lg: 0 }}
    mr={{ lg: 6 }}
  >
    <Sidebar />
  </Box>
  
  {/* Main Content */}
  <Box flex="1">
    <MainContent />
  </Box>
</Flex>
```

### Pattern 2: Liste avec Cards

```tsx
<SimpleGrid 
  columns={{ base: 1, sm: 2, md: 2, lg: 3, xl: 4 }}
  spacing={{ base: 4, md: 6 }}
  px={{ base: 4, md: 6 }}
>
  {items.map(item => (
    <Card key={item.id} />
  ))}
</SimpleGrid>
```

### Pattern 3: Header Responsive

```tsx
<Flex 
  as="header"
  align="center"
  justify="space-between"
  px={{ base: 4, md: 6, lg: 8 }}
  py={4}
  flexDirection={{ base: "column", md: "row" }}
  gap={{ base: 4, md: 0 }}
>
  <Logo />
  <Navigation />
  <UserMenu />
</Flex>
```

---

## 11. 🧪 Testing

### Tester dans Chrome DevTools

1. **Ouvrir DevTools**: `F12` ou `Cmd+Option+I` (Mac)
2. **Toggle Device Toolbar**: `Cmd+Shift+M` (Mac) ou `Ctrl+Shift+M` (Windows)
3. **Sélectionner un appareil**:
   - iPhone 12 Pro (390px)
   - iPad Air (820px)
   - Desktop (1920px)

### Tester les breakpoints manuellement

```tsx
// Ajouter temporairement pour debug
import { useBreakpoint } from '@chakra-ui/react';

function DebugBreakpoint() {
  const breakpoint = useBreakpoint();
  return (
    <Box position="fixed" bottom={4} right={4} bg="red.500" color="white" p={2}>
      Breakpoint: {breakpoint}
    </Box>
  );
}
```

---

## 12. 📱 Meta Viewport

Vérifier dans `index.html` :

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
```

✅ Ceci est **déjà configuré** dans votre projet.

---

## 13. 🎯 Prochaines Étapes

Pour **améliorer le responsive** de votre application :

1. **Audit des pages actuelles** avec DevTools
2. **Identifier les éléments qui débordent** sur mobile
3. **Appliquer les patterns de ce guide**
4. **Tester sur appareils réels** si possible
5. **Créer un composant ResponsiveContainer** (voir fichier séparé)

---

## 📚 Ressources

- [Chakra UI Responsive Styles](https://chakra-ui.com/docs/features/responsive-styles)
- [Chakra UI useBreakpointValue](https://chakra-ui.com/docs/hooks/use-breakpoint-value)
- [MDN Responsive Design](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design)

---

**✨ Conseil Final**: Commencez toujours par le design **mobile-first**, puis ajoutez les breakpoints pour tablette et desktop. C'est plus facile que l'inverse !
