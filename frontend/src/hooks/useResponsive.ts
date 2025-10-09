import { useBreakpointValue, useBreakpoint } from '@chakra-ui/react';

/**
 * 🎯 Hook personnalisé pour obtenir le type d'appareil actuel
 * 
 * @returns 'mobile' | 'tablet' | 'desktop'
 * 
 * @example
 * const device = useDevice();
 * if (device === 'mobile') {
 *   // Logique spécifique mobile
 * }
 */
export const useDevice = () => {
  return useBreakpointValue(
    { 
      base: 'mobile', 
      md: 'tablet', 
      lg: 'desktop' 
    },
    { ssr: false }
  ) as 'mobile' | 'tablet' | 'desktop';
};

/**
 * 🎯 Hook pour vérifier si on est sur mobile
 * 
 * @returns boolean
 * 
 * @example
 * const isMobile = useIsMobile();
 * return isMobile ? <MobileView /> : <DesktopView />;
 */
export const useIsMobile = (): boolean => {
  return useBreakpointValue(
    { base: true, md: false },
    { ssr: false }
  ) ?? false;
};

/**
 * 🎯 Hook pour vérifier si on est sur tablette
 * 
 * @returns boolean
 */
export const useIsTablet = (): boolean => {
  return useBreakpointValue(
    { base: false, md: true, lg: false },
    { ssr: false }
  ) ?? false;
};

/**
 * 🎯 Hook pour vérifier si on est sur desktop
 * 
 * @returns boolean
 */
export const useIsDesktop = (): boolean => {
  return useBreakpointValue(
    { base: false, lg: true },
    { ssr: false }
  ) ?? false;
};

/**
 * 🎯 Hook pour obtenir le breakpoint actuel
 * 
 * @returns 'base' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
 * 
 * @example
 * const bp = useCurrentBreakpoint();
 * console.log('Breakpoint actuel:', bp);
 */
export const useCurrentBreakpoint = () => {
  return useBreakpoint({ ssr: false });
};

/**
 * 🎯 Hook pour obtenir le nombre de colonnes selon l'appareil
 * 
 * @param mobileColumns - Nombre de colonnes sur mobile (défaut: 1)
 * @param tabletColumns - Nombre de colonnes sur tablette (défaut: 2)
 * @param desktopColumns - Nombre de colonnes sur desktop (défaut: 3)
 * @returns number
 * 
 * @example
 * const columns = useResponsiveColumns(1, 2, 4);
 * return <Grid templateColumns={`repeat(${columns}, 1fr)`}>...</Grid>;
 */
export const useResponsiveColumns = (
  mobileColumns = 1,
  tabletColumns = 2,
  desktopColumns = 3
): number => {
  return useBreakpointValue(
    {
      base: mobileColumns,
      md: tabletColumns,
      lg: desktopColumns
    },
    { ssr: false }
  ) ?? mobileColumns;
};

/**
 * 🎯 Hook pour obtenir l'espacement responsive
 * 
 * @param type - Type d'espacement: 'tight' | 'normal' | 'loose'
 * @returns Valeur d'espacement Chakra UI
 * 
 * @example
 * const spacing = useResponsiveSpacing('normal');
 * return <VStack spacing={spacing}>...</VStack>;
 */
export const useResponsiveSpacing = (type: 'tight' | 'normal' | 'loose' = 'normal') => {
  const spacingMap = {
    tight: { base: 2, md: 3, lg: 4 },
    normal: { base: 4, md: 6, lg: 8 },
    loose: { base: 6, md: 8, lg: 10 }
  };

  return useBreakpointValue(spacingMap[type], { ssr: false }) ?? spacingMap[type].base;
};

/**
 * 🎯 Hook pour obtenir le padding responsive
 * 
 * @param type - Type de padding: 'tight' | 'normal' | 'loose'
 * @returns Valeur de padding Chakra UI
 * 
 * @example
 * const padding = useResponsivePadding('normal');
 * return <Box p={padding}>...</Box>;
 */
export const useResponsivePadding = (type: 'tight' | 'normal' | 'loose' = 'normal') => {
  const paddingMap = {
    tight: { base: 3, md: 4, lg: 5 },
    normal: { base: 4, md: 6, lg: 8 },
    loose: { base: 6, md: 8, lg: 12 }
  };

  return useBreakpointValue(paddingMap[type], { ssr: false }) ?? paddingMap[type].base;
};

/**
 * 🎯 Hook pour obtenir la taille de police responsive
 * 
 * @param size - Taille: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
 * @returns Valeur de fontSize Chakra UI
 * 
 * @example
 * const fontSize = useResponsiveFontSize('md');
 * return <Text fontSize={fontSize}>...</Text>;
 */
export const useResponsiveFontSize = (size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md') => {
  const fontSizeMap = {
    xs: { base: 'xs', md: 'sm' },
    sm: { base: 'sm', md: 'md' },
    md: { base: 'md', md: 'lg' },
    lg: { base: 'lg', md: 'xl' },
    xl: { base: 'xl', md: '2xl' }
  };

  return useBreakpointValue(fontSizeMap[size], { ssr: false }) ?? fontSizeMap[size].base;
};

/**
 * 🎯 Hook pour obtenir la largeur maximale du container
 * 
 * @param size - Taille: 'sm' | 'md' | 'lg' | 'xl' | 'full'
 * @returns Valeur de maxW Chakra UI
 * 
 * @example
 * const maxW = useResponsiveContainerWidth('lg');
 * return <Container maxW={maxW}>...</Container>;
 */
export const useResponsiveContainerWidth = (size: 'sm' | 'md' | 'lg' | 'xl' | 'full' = 'lg') => {
  const widthMap = {
    sm: { base: '100%', md: 'container.sm' },
    md: { base: '100%', md: 'container.md' },
    lg: { base: '100%', md: 'container.md', lg: 'container.lg' },
    xl: { base: '100%', md: 'container.md', lg: 'container.xl' },
    full: { base: '100%' }
  };

  return useBreakpointValue(widthMap[size], { ssr: false }) ?? widthMap[size].base;
};

/**
 * 🎯 Constantes pour les props responsive courantes
 */
export const RESPONSIVE_PROPS = {
  // Grid colonnes
  GRID_COLUMNS_1_2_3: { base: 1, md: 2, lg: 3 },
  GRID_COLUMNS_1_2_4: { base: 1, md: 2, lg: 4 },
  GRID_COLUMNS_1_3_4: { base: 1, md: 3, lg: 4 },
  GRID_COLUMNS_2_3_4: { base: 2, md: 3, lg: 4 },
  
  // Spacing
  SPACING_TIGHT: { base: 2, md: 3, lg: 4 },
  SPACING_NORMAL: { base: 4, md: 6, lg: 8 },
  SPACING_LOOSE: { base: 6, md: 8, lg: 10 },
  
  // Padding
  PADDING_SMALL: { base: 3, md: 4, lg: 5 },
  PADDING_MEDIUM: { base: 4, md: 6, lg: 8 },
  PADDING_LARGE: { base: 6, md: 8, lg: 12 },
  
  // Font Size
  FONT_SIZE_SMALL: { base: 'sm', md: 'md' },
  FONT_SIZE_MEDIUM: { base: 'md', md: 'lg' },
  FONT_SIZE_LARGE: { base: 'lg', md: 'xl' },
  
  // Direction
  DIRECTION_VERTICAL_HORIZONTAL: { base: 'column', md: 'row' },
  DIRECTION_HORIZONTAL_VERTICAL: { base: 'row', md: 'column' },
  
  // Width
  WIDTH_FULL_AUTO: { base: '100%', md: 'auto' },
  WIDTH_FULL_HALF: { base: '100%', md: '50%' },
  
  // Container
  CONTAINER_SMALL: { base: '100%', md: 'container.sm' },
  CONTAINER_MEDIUM: { base: '100%', md: 'container.md' },
  CONTAINER_LARGE: { base: '100%', md: 'container.md', lg: 'container.lg' },
  
  // Avatar Size
  AVATAR_SIZE: { base: 'md', md: 'lg', lg: 'xl' },
  
  // Icon Size
  ICON_SIZE: { base: 4, md: 5, lg: 6 },
  
  // Border Radius
  BORDER_RADIUS: { base: 'md', md: 'lg' },
  
  // Box Shadow
  BOX_SHADOW: { base: 'sm', md: 'md', lg: 'lg' }
} as const;

/**
 * 🎯 Utilitaire pour créer des props responsive personnalisées
 * 
 * @param mobile - Valeur pour mobile
 * @param tablet - Valeur pour tablette
 * @param desktop - Valeur pour desktop
 * @returns Props responsive Chakra UI
 * 
 * @example
 * const fontSize = createResponsiveProp('sm', 'md', 'lg');
 * return <Text fontSize={fontSize}>...</Text>;
 */
export const createResponsiveProp = <T,>(
  mobile: T,
  tablet?: T,
  desktop?: T
) => ({
  base: mobile,
  ...(tablet && { md: tablet }),
  ...(desktop && { lg: desktop })
});
