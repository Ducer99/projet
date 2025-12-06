/**
 * 📱 Constantes Responsive - Breakpoints Standards
 * 
 * Définit les breakpoints utilisés dans toute l'application
 * Compatible avec Chakra UI
 */

export const BREAKPOINTS = {
  mobile: '0px',      // 0 - 767px
  tablet: '768px',    // 768 - 1023px
  desktop: '1024px',  // 1024px et plus
  wide: '1440px'      // Écrans larges
} as const;

/**
 * Helper pour les media queries
 */
export const mediaQueries = {
  mobile: `@media (max-width: 767px)`,
  tablet: `@media (min-width: 768px) and (max-width: 1023px)`,
  desktop: `@media (min-width: 1024px)`,
  wide: `@media (min-width: 1440px)`
} as const;

/**
 * Chakra UI responsive values helpers
 * Usage: { base: mobile, md: tablet, lg: desktop }
 */
export const responsiveValues = {
  // Padding/Margin
  spacing: {
    container: { base: 4, md: 6, lg: 8 },
    section: { base: 6, md: 8, lg: 12 },
    card: { base: 3, md: 4, lg: 5 }
  },
  
  // Font sizes
  fontSize: {
    heading: { base: 'lg', md: 'xl', lg: '2xl' },
    subheading: { base: 'md', md: 'lg', lg: 'xl' },
    body: { base: 'sm', md: 'md', lg: 'md' },
    caption: { base: 'xs', md: 'sm', lg: 'sm' }
  },
  
  // Button sizes
  buttonSize: {
    small: { base: 'xs', md: 'sm' },
    medium: { base: 'sm', md: 'md' },
    large: { base: 'md', md: 'lg' }
  },
  
  // Grid columns
  gridColumns: {
    twoCol: { base: '1fr', md: 'repeat(2, 1fr)' },
    threeCol: { base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
    fourCol: { base: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }
  }
} as const;

/**
 * Hook pour détecter le type d'appareil
 */
export const isTouchDevice = () => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

/**
 * Hook pour obtenir la taille d'écran actuelle
 */
export const getScreenSize = (): 'mobile' | 'tablet' | 'desktop' | 'wide' => {
  if (typeof window === 'undefined') return 'desktop';
  
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  if (width < 1440) return 'desktop';
  return 'wide';
};
