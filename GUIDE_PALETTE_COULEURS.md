# 🎨 GUIDE RAPIDE - Palette de Couleurs "Family Tree"

**Version** : 1.0  
**Date** : 22 novembre 2025  
**Usage** : Développement Frontend / Design System

---

## 🎯 PALETTE PRINCIPALE (Copy-Paste Ready)

### 🟣 Violet (Action/Focus) - Couleur Primaire

```css
/* Boutons, Onglets actifs, Bordures focus */
--primary-default: #6366F1;  /* Violet Indigo */
--primary-hover: #4F46E5;    /* Violet foncé */
--primary-active: #4338CA;   /* Violet très foncé */
```

### ⚪ Gris (Backgrounds & Borders)

```css
/* Fonds */
--bg-page: #F3F4F6;          /* Gris très clair (page) */
--bg-card: #FFFFFF;          /* Blanc pur (cartes) */
--bg-footer: #F9FAFB;        /* Blanc cassé (footer) */

/* Bordures */
--border-default: #E5E7EB;   /* Gris très clair */
--border-hover: #D1D5DB;     /* Gris moyen */
--border-strong: #9CA3AF;    /* Gris foncé */

/* Texte */
--text-heading: #1F2937;     /* Gris foncé (titres) */
--text-label: #4B5563;       /* Gris moyen (labels) */
--text-secondary: #6B7280;   /* Gris clair (aide) */
```

### 🟢 Status Colors

```css
/* Badges */
--status-alive: #10B981;     /* Vert émeraude (Vivant) */
--status-deceased: #EF4444;  /* Rouge doux (Décédé) */
--status-confirmed: #6366F1; /* Violet (Confirmé) */
--status-pending: #F59E0B;   /* Jaune (En attente) */
```

### 🌈 Dégradé (Banner Header)

```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
```

---

## 📐 COMPOSANTS STANDARDS

### Input Standard (48px)

```tsx
<Input
  h="48px"
  borderRadius="8px"
  borderColor="#E5E7EB"
  _hover={{ borderColor: '#D1D5DB' }}
  _focus={{ 
    borderColor: '#6366F1',
    boxShadow: '0 0 0 1px #6366F1'
  }}
  fontSize="md"
  fontWeight="500"
  color="#1F2937"
  transition="all 0.2s"
/>
```

### Button Primary (Violet)

```tsx
<Button
  bg="#6366F1"
  color="white"
  h="48px"
  px={8}
  borderRadius="8px"
  fontWeight="600"
  _hover={{ 
    bg: '#4F46E5',
    transform: 'translateY(-2px)',
    boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.4)'
  }}
  _active={{ 
    bg: '#4338CA',
    transform: 'translateY(0)'
  }}
  transition="all 0.2s"
>
  Sauvegarder
</Button>
```

### Button Outline (Annuler)

```tsx
<Button
  variant="outline"
  h="48px"
  px={6}
  borderRadius="8px"
  borderColor="#D1D5DB"
  color="#4B5563"
  fontWeight="600"
  _hover={{ 
    bg: '#F3F4F6',
    borderColor: '#9CA3AF'
  }}
  transition="all 0.2s"
>
  Annuler
</Button>
```

### Label Standard

```tsx
<FormLabel 
  fontWeight="600" 
  color="#4B5563"
  fontSize="sm"
  mb={3}
>
  Prénom
</FormLabel>
```

### Card Standard

```tsx
<Card 
  shadow="0 4px 6px -1px rgba(0, 0, 0, 0.1)" 
  borderRadius="16px"
  overflow="hidden"
  bg="white"
>
  <CardBody>
    {/* Contenu */}
  </CardBody>
</Card>
```

---

## 🚫 À NE JAMAIS FAIRE

### ❌ Couleurs Interdites
```css
/* JAMAIS utiliser */
color: black;                    ❌ Trop dur
color: #000000;                  ❌ Trop dur
border: 1px solid black;         ❌ Trop agressif
background: #fff;                ❌ Utiliser #FFFFFF
background: white;               ❌ Utiliser #FFFFFF (pour consistency)
```

### ❌ Dimensions Incorrectes
```tsx
<Input size="md" />              ❌ Utiliser h="48px"
<Button size="sm" />             ❌ Utiliser h="48px" (standard)
<Input borderRadius="4px" />     ❌ Utiliser borderRadius="8px"
```

### ❌ Sans Transitions
```tsx
<Button bg="#6366F1" />          ❌ Manque transition="all 0.2s"
<Input />                        ❌ Manque _hover et _focus
```

---

## ✅ CHECKLIST RAPIDE

Avant de commit :

- [ ] Tous les inputs ont `h="48px"` et `borderRadius="8px"`
- [ ] Tous les focus ont `borderColor="#6366F1"` et boxShadow
- [ ] Labels en `#4B5563` (jamais noir pur)
- [ ] Tous les éléments interactifs ont `transition="all 0.2s"`
- [ ] Boutons primaires utilisent `bg="#6366F1"`
- [ ] Fond de page en `bg="#F3F4F6"`
- [ ] Cartes en `bg="white"` avec shadow
- [ ] Border radius cohérent (8px inputs, 16px cards)

---

## 📱 RESPONSIVE

### Grid 2 Colonnes → 1 Colonne Mobile

```tsx
<Grid 
  templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} 
  gap={4}
>
  <GridItem>
    <Input /> {/* Pleine largeur mobile */}
  </GridItem>
  <GridItem>
    <Input /> {/* Pleine largeur mobile */}
  </GridItem>
</Grid>
```

---

## 🎨 EXEMPLES VISUELS

### Input States

```
┌─────────────────────────────────┐
│ Prénom                          │  ← Label #4B5563
│ ┌─────────────────────────────┐ │
│ │ Jean                        │ │  ← Default #E5E7EB
│ └─────────────────────────────┘ │
└─────────────────────────────────┘

      ↓ Hover

┌─────────────────────────────────┐
│ Prénom                          │
│ ┌─────────────────────────────┐ │
│ │ Jean                        │ │  ← Hover #D1D5DB
│ └─────────────────────────────┘ │
└─────────────────────────────────┘

      ↓ Focus/Clic

┌─────────────────────────────────┐
│ Prénom                          │
│ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │
│ ┃ Jean|                       ┃ │  ← Focus #6366F1 + glow
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │
└─────────────────────────────────┘
```

### Button States

```
┌──────────────────────────┐
│  💾 Sauvegarder          │  ← Default #6366F1
└──────────────────────────┘

      ↓ Hover

┌──────────────────────────┐
│  💾 Sauvegarder    ↑2px  │  ← Hover #4F46E5 + lift
└──────────────────────────┘
   Ombre violette ▼

      ↓ Clic

┌──────────────────────────┐
│  💾 Sauvegarder          │  ← Active #4338CA
└──────────────────────────┘
```

---

## 🔗 LIENS UTILES

- **Documentation complète** : `REFONTE_DESIGN_EDIT_MEMBER.md`
- **Palette Tailwind** : https://tailwindcss.com/docs/customizing-colors
- **Chakra UI Colors** : https://chakra-ui.com/docs/theming/theme#colors

---

*Guide Rapide créé le 22 novembre 2025*  
*Toujours prioriser la cohérence visuelle* 🎨
