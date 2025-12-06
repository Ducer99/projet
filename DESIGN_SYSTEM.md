# 🎨 FAMILY TREE - DESIGN SYSTEM COMPLET

**Inspiré par**: Apple, Notion, Dieter Rams, Don Norman, Mike Bostock  
**Philosophie**: "Less but better" - Minimalisme émotionnel et chaleureux  
**Date**: 9 octobre 2025

---

## 🌈 PALETTE DE COULEURS

### Couleurs Primaires (Famille)

```css
/* Famille Principale - Dégradé chaud et accueillant */
--family-primary: linear-gradient(135deg, #F6D365 0%, #FDA085 100%);
--family-primary-solid: #F6D365;
--family-primary-dark: #E8B84D;

/* Familles Secondaires - Code couleur automatique */
--family-blue: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
--family-green: linear-gradient(135deg, #56ab2f 0%, #a8e063 100%);
--family-purple: linear-gradient(135deg, #c94b4b 0%, #4b134f 100%);
--family-teal: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
```

### Couleurs Secondaires (UI)

```css
/* Fond et surfaces */
--bg-primary: #FAFAFA;
--bg-secondary: #FFFFFF;
--bg-tertiary: #F5F5F5;

/* Texte */
--text-primary: #1A1A1A;
--text-secondary: #6B6B6B;
--text-tertiary: #9B9B9B;
--text-inverse: #FFFFFF;

/* Bordures */
--border-light: #E8E8E8;
--border-medium: #D1D1D1;
--border-dark: #A0A0A0;

/* Ombres - Inspiré Apple */
--shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.04);
--shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.06);
--shadow-md: 0 4px 8px rgba(0, 0, 0, 0.08);
--shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 16px 32px rgba(0, 0, 0, 0.12);
--shadow-2xl: 0 24px 48px rgba(0, 0, 0, 0.15);
```

### Couleurs Sémantiques

```css
/* Succès */
--success-50: #ECFDF5;
--success-500: #10B981;
--success-600: #059669;

/* Erreur */
--error-50: #FEF2F2;
--error-500: #EF4444;
--error-600: #DC2626;

/* Warning */
--warning-50: #FFFBEB;
--warning-500: #F59E0B;
--warning-600: #D97706;

/* Info */
--info-50: #EFF6FF;
--info-500: #3B82F6;
--info-600: #2563EB;
```

### Couleurs Spécifiques Généalogie

```css
/* Homme */
--gender-male-bg: #EFF6FF;
--gender-male-border: #3B82F6;
--gender-male-text: #1E40AF;

/* Femme */
--gender-female-bg: #FCE7F3;
--gender-female-border: #EC4899;
--gender-female-text: #BE185D;

/* Décédé */
--deceased-bg: #F3F4F6;
--deceased-border: #9CA3AF;
--deceased-text: #6B7280;

/* Vivant */
--alive-bg: #ECFDF5;
--alive-border: #10B981;
--alive-text: #059669;
```

---

## 📐 TYPOGRAPHIE

### Fontes

```css
/* Famille principale - Inter (clean, moderne, lisible) */
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Famille secondaire - Poppins (titres, headings) */
--font-secondary: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif;

/* Monospace - Pour codes et données techniques */
--font-mono: 'SF Mono', 'Monaco', 'Menlo', monospace;
```

### Échelle Typographique (Scale modulaire 1.25)

```css
/* Display - Titres très larges */
--text-display-2xl: 4.5rem;    /* 72px */
--text-display-xl: 3.75rem;    /* 60px */
--text-display-lg: 3rem;       /* 48px */

/* Headings */
--text-h1: 2.5rem;             /* 40px */
--text-h2: 2rem;               /* 32px */
--text-h3: 1.5rem;             /* 24px */
--text-h4: 1.25rem;            /* 20px */
--text-h5: 1.125rem;           /* 18px */
--text-h6: 1rem;               /* 16px */

/* Body */
--text-lg: 1.125rem;           /* 18px */
--text-base: 1rem;             /* 16px */
--text-sm: 0.875rem;           /* 14px */
--text-xs: 0.75rem;            /* 12px */
--text-2xs: 0.625rem;          /* 10px */
```

### Poids de Police

```css
--font-thin: 100;
--font-extralight: 200;
--font-light: 300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
--font-extrabold: 800;
--font-black: 900;
```

### Hauteur de Ligne

```css
--leading-none: 1;
--leading-tight: 1.25;
--leading-snug: 1.375;
--leading-normal: 1.5;
--leading-relaxed: 1.625;
--leading-loose: 2;
```

---

## 📏 ESPACEMENTS (Système 8px)

```css
/* Échelle d'espacement basée sur 8px */
--space-0: 0;
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
--space-24: 6rem;     /* 96px */
--space-32: 8rem;     /* 128px */
```

---

## 🔲 BORDER RADIUS (Coins arrondis)

```css
/* Inspiré Apple - Coins très arrondis */
--radius-none: 0;
--radius-sm: 0.375rem;    /* 6px */
--radius-md: 0.5rem;      /* 8px */
--radius-lg: 0.75rem;     /* 12px */
--radius-xl: 1rem;        /* 16px */
--radius-2xl: 1.5rem;     /* 24px */
--radius-3xl: 2rem;       /* 32px */
--radius-full: 9999px;    /* Complètement arrondi */
```

---

## 🎭 COMPOSANTS RÉUTILISABLES

### 1. Card (Carte de base)

```tsx
interface CardProps {
  variant?: 'default' | 'elevated' | 'outlined' | 'glass';
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  hover?: boolean;
  gradient?: 'family-primary' | 'blue' | 'green' | 'purple' | 'teal';
}

// Styles
.card {
  background: var(--bg-secondary);
  border-radius: var(--radius-2xl);
  padding: var(--space-6);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-elevated {
  box-shadow: var(--shadow-lg);
}

.card-hover:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-xl);
}

.card-glass {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}
```

### 2. Button (Bouton)

```tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  icon?: ReactNode;
  gradient?: string;
}

// Styles
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  font-family: var(--font-primary);
  font-weight: var(--font-medium);
  border-radius: var(--radius-xl);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.btn-primary {
  background: var(--family-primary);
  color: white;
  border: none;
}

.btn-primary:hover {
  transform: scale(1.02);
  box-shadow: var(--shadow-lg);
}

.btn-gradient {
  background: linear-gradient(135deg, #F6D365 0%, #FDA085 100%);
  color: white;
  border: none;
}
```

### 3. Avatar (Photo de profil)

```tsx
interface AvatarProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  src?: string;
  name: string;
  status?: 'online' | 'offline' | 'alive' | 'deceased';
  gender?: 'M' | 'F';
  showBorder?: boolean;
}

// Styles
.avatar {
  border-radius: var(--radius-full);
  overflow: hidden;
  position: relative;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.avatar-male {
  border: 3px solid var(--gender-male-border);
}

.avatar-female {
  border: 3px solid var(--gender-female-border);
}

.avatar-status {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 25%;
  height: 25%;
  border-radius: var(--radius-full);
  border: 2px solid white;
}

.avatar-alive { background: var(--success-500); }
.avatar-deceased { background: var(--deceased-border); }
```

### 4. Badge (Étiquette)

```tsx
interface BadgeProps {
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  dot?: boolean;
}

// Styles
.badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
}

.badge-success {
  background: var(--success-50);
  color: var(--success-600);
}

.badge-error {
  background: var(--error-50);
  color: var(--error-600);
}
```

### 5. Input (Champ de formulaire)

```tsx
interface InputProps {
  variant?: 'default' | 'filled' | 'flushed';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  error?: boolean;
  helperText?: string;
}

// Styles
.input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-lg);
  border: 1.5px solid var(--border-light);
  font-family: var(--font-primary);
  font-size: var(--text-base);
  transition: all 0.2s ease;
}

.input:focus {
  outline: none;
  border-color: var(--family-primary-solid);
  box-shadow: 0 0 0 3px rgba(246, 211, 101, 0.1);
}

.input-error {
  border-color: var(--error-500);
}
```

---

## 🌊 ANIMATIONS ET TRANSITIONS

### Courbes de Bézier (Apple-style)

```css
/* Ease Out - Pour les entrées */
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);

/* Ease In - Pour les sorties */
--ease-in: cubic-bezier(0.7, 0, 0.84, 0);

/* Ease In Out - Pour les transitions */
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);

/* Spring - Pour les effets élastiques */
--ease-spring: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

### Durées d'Animation

```css
--duration-fastest: 100ms;
--duration-fast: 150ms;
--duration-normal: 200ms;
--duration-slow: 300ms;
--duration-slower: 500ms;
--duration-slowest: 700ms;
```

### Animations Prédéfinies

```css
/* Fade In */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide Up */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Scale In */
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Pulse (pour attirer l'attention) */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

---

## 📱 RESPONSIVE DESIGN

### Breakpoints

```css
/* Mobile First Approach */
--breakpoint-xs: 0px;      /* Petits mobiles */
--breakpoint-sm: 640px;    /* Mobiles */
--breakpoint-md: 768px;    /* Tablettes */
--breakpoint-lg: 1024px;   /* Ordinateurs portables */
--breakpoint-xl: 1280px;   /* Grands écrans */
--breakpoint-2xl: 1536px;  /* Écrans très larges */
```

### Grid Layout Adaptatif

```css
/* Grille responsive automatique */
.grid-auto {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-6);
}

/* Grille 12 colonnes (comme Bootstrap/Tailwind) */
.grid-12 {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--space-6);
}
```

---

## 🎨 CODE COULEUR PAR FAMILLE

### Algorithme d'Attribution Automatique

```typescript
// Palette de 12 dégradés distincts pour familles
const familyGradients = [
  'linear-gradient(135deg, #F6D365 0%, #FDA085 100%)', // Orange chaud
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Violet
  'linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)', // Vert
  'linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)', // Rouge-Orange
  'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', // Teal
  'linear-gradient(135deg, #fc4a1a 0%, #f7b733 100%)', // Feu
  'linear-gradient(135deg, #4776e6 0%, #8e54e9 100%)', // Bleu-Violet
  'linear-gradient(135deg, #f857a6 0%, #ff5858 100%)', // Rose
  'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', // Pastel
  'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', // Pêche
  'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)', // Lilas
  'linear-gradient(135deg, #96deda 0%, #50c9c3 100%)'  // Cyan
];

// Fonction d'attribution de couleur par FamilyID
const getFamilyGradient = (familyID: number): string => {
  return familyGradients[familyID % familyGradients.length];
};

// Fonction pour extraire la couleur solide d'un dégradé
const getGradientSolidColor = (gradient: string): string => {
  const match = gradient.match(/#([0-9A-Fa-f]{6})/);
  return match ? match[0] : '#F6D365';
};
```

---

## 🖼️ ICONOGRAPHIE

### Pack d'Icônes Recommandés

```tsx
// React Icons - Déjà installé
import {
  FaHome,           // Accueil
  FaUsers,          // Membres
  FaHeart,          // Mariage
  FaCalendar,       // Événements
  FaSitemap,        // Arbre
  FaUserCircle,     // Profil
  FaCamera,         // Photos
  FaBook,           // Histoires
  FaMale,           // Homme
  FaFemale,         // Femme
  FaBirthdayCake,   // Anniversaire
  FaSkullCrossbones // Décédé
} from 'react-icons/fa';

// Style d'icône
.icon {
  color: var(--text-secondary);
  transition: color var(--duration-fast) var(--ease-out);
}

.icon:hover {
  color: var(--text-primary);
}
```

---

## 🎯 PRINCIPES UX (Don Norman)

### 1. Visibilité (Visibility)
- Toutes les actions importantes sont visibles
- Pas de menus cachés pour les fonctions critiques
- Hiérarchie visuelle claire (taille, couleur, position)

### 2. Feedback (Retour)
- Chaque action déclenche un retour visuel immédiat
- Animations fluides pour guider l'utilisateur
- Toasts pour les confirmations/erreurs

### 3. Contraintes (Constraints)
- Formulaires avec validation en temps réel
- Champs obligatoires clairement indiqués
- Actions destructrices avec confirmation

### 4. Mapping (Correspondance)
- Icônes intuitives (mariage → 💍, naissance → 🎂)
- Organisation spatiale logique
- Code couleur cohérent

### 5. Consistance (Consistency)
- Même style de bouton partout
- Même espacement entre sections
- Même comportement d'interaction

### 6. Affordance (Suggestion d'usage)
- Boutons qui ressemblent à des boutons
- Liens soulignés ou en couleur
- Zones cliquables avec hover states

---

## 📐 RÈGLES DE CONCEPTION (Dieter Rams)

### Les 10 Principes du Bon Design

1. **Innovant** - Utilise les dernières techno web (Framer Motion, React 18)
2. **Utile** - Chaque élément a une raison d'être
3. **Esthétique** - Minimalisme élégant, pas de superflu
4. **Compréhensible** - Interface intuitive, apprentissage rapide
5. **Discret** - Le design ne distrait pas du contenu
6. **Honnête** - Pas de dark patterns, interface transparente
7. **Durable** - Design intemporel, pas de tendances éphémères
8. **Minutieux** - Attention aux détails (espacements, alignements)
9. **Écologique** - Performance optimisée, chargement rapide
10. **Minimal** - "Less but better"

---

## 🎨 EXEMPLE D'APPLICATION - CARD MEMBRE

```tsx
import { motion } from 'framer-motion';

interface FamilyMemberCardProps {
  person: Person;
  familyGradient: string;
}

const FamilyMemberCard: React.FC<FamilyMemberCardProps> = ({ person, familyGradient }) => {
  return (
    <motion.div
      className="family-member-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, boxShadow: 'var(--shadow-xl)' }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Barre de couleur famille en haut */}
      <div 
        className="family-color-bar"
        style={{ background: familyGradient }}
      />
      
      {/* Avatar avec statut */}
      <div className="avatar-container">
        <Avatar
          src={person.photoUrl}
          name={`${person.firstName} ${person.lastName}`}
          size="lg"
          status={person.alive ? 'alive' : 'deceased'}
          gender={person.sex}
        />
      </div>
      
      {/* Informations */}
      <div className="card-content">
        <h3 className="person-name">
          {person.firstName} {person.lastName}
        </h3>
        
        <div className="person-meta">
          <Badge icon={<FaBirthdayCake />} size="sm">
            {calculateAge(person.birthday)} ans
          </Badge>
          
          {!person.alive && (
            <Badge variant="error" icon={<FaSkullCrossbones />}>
              Décédé(e)
            </Badge>
          )}
        </div>
      </div>
      
      {/* Actions au hover */}
      <div className="card-actions">
        <Button variant="ghost" size="sm" icon={<FaEye />}>
          Voir profil
        </Button>
      </div>
    </motion.div>
  );
};

// Styles
.family-member-card {
  background: var(--bg-secondary);
  border-radius: var(--radius-2xl);
  overflow: hidden;
  box-shadow: var(--shadow-md);
  transition: all 0.3s var(--ease-out);
}

.family-color-bar {
  height: 4px;
  width: 100%;
}

.avatar-container {
  padding: var(--space-6) var(--space-6) var(--space-4);
  display: flex;
  justify-content: center;
}

.card-content {
  padding: 0 var(--space-6) var(--space-6);
  text-align: center;
}

.person-name {
  font-family: var(--font-secondary);
  font-size: var(--text-h4);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin-bottom: var(--space-2);
}

.person-meta {
  display: flex;
  gap: var(--space-2);
  justify-content: center;
}

.card-actions {
  padding: var(--space-4) var(--space-6);
  border-top: 1px solid var(--border-light);
  opacity: 0;
  transition: opacity 0.2s var(--ease-out);
}

.family-member-card:hover .card-actions {
  opacity: 1;
}
```

---

## 📦 FICHIERS À CRÉER

### 1. Design Tokens (CSS Variables)

**Fichier**: `/frontend/src/styles/tokens.css`

### 2. Composants Réutilisables

**Fichiers**:
- `/frontend/src/components/ui/Card.tsx`
- `/frontend/src/components/ui/Button.tsx`
- `/frontend/src/components/ui/Avatar.tsx`
- `/frontend/src/components/ui/Badge.tsx`
- `/frontend/src/components/ui/Input.tsx`

### 3. Utilitaires

**Fichiers**:
- `/frontend/src/utils/colorUtils.ts` (getFamilyGradient)
- `/frontend/src/utils/animationUtils.ts` (variants Framer Motion)

---

## 🚀 PROCHAINES ÉTAPES

1. ✅ Créer le fichier `tokens.css` avec toutes les variables
2. ✅ Créer les composants UI de base
3. ✅ Appliquer le redesign page par page
4. ✅ Installer Framer Motion pour les animations
5. ✅ Tester la responsivité sur mobile/tablette/desktop

---

**Créé par**: GitHub Copilot  
**Date**: 9 octobre 2025  
**Version**: 1.0  
**Status**: 📋 **DESIGN SYSTEM PRÊT**
