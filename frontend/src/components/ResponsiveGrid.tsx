import { SimpleGrid, SimpleGridProps } from '@chakra-ui/react';
import { ReactNode } from 'react';

/**
 * 🎯 Composant Grid Responsive
 * 
 * Une grille qui s'adapte automatiquement au nombre de colonnes
 * selon la taille de l'écran.
 * 
 * @example
 * // Grille avec preset 1-2-3
 * <ResponsiveGrid preset="1-2-3">
 *   <Card />
 *   <Card />
 *   <Card />
 * </ResponsiveGrid>
 * 
 * @example
 * // Grille personnalisée
 * <ResponsiveGrid mobileColumns={1} tabletColumns={2} desktopColumns={4}>
 *   <Card />
 *   <Card />
 *   <Card />
 *   <Card />
 * </ResponsiveGrid>
 * 
 * @example
 * // Grille avec espacement personnalisé
 * <ResponsiveGrid preset="1-2-3" spacingType="loose">
 *   <Card />
 *   <Card />
 *   <Card />
 * </ResponsiveGrid>
 */

interface ResponsiveGridProps extends Omit<SimpleGridProps, 'columns' | 'spacing'> {
  /** Preset de colonnes */
  preset?: '1-2-3' | '1-2-4' | '1-3-4' | '2-3-4' | '2-2-3' | '1-1-2';
  /** Nombre de colonnes sur mobile (remplace preset) */
  mobileColumns?: number;
  /** Nombre de colonnes sur tablette (remplace preset) */
  tabletColumns?: number;
  /** Nombre de colonnes sur desktop (remplace preset) */
  desktopColumns?: number;
  /** Type d'espacement */
  spacingType?: 'tight' | 'normal' | 'loose';
  /** Enfants */
  children: ReactNode;
}

export const ResponsiveGrid = ({
  preset = '1-2-3',
  mobileColumns,
  tabletColumns,
  desktopColumns,
  spacingType = 'normal',
  children,
  ...props
}: ResponsiveGridProps) => {
  // Presets de colonnes
  const presetMap = {
    '1-2-3': { base: 1, md: 2, lg: 3 },
    '1-2-4': { base: 1, md: 2, lg: 4 },
    '1-3-4': { base: 1, md: 3, lg: 4 },
    '2-3-4': { base: 2, md: 3, lg: 4 },
    '2-2-3': { base: 2, md: 2, lg: 3 },
    '1-1-2': { base: 1, md: 1, lg: 2 }
  };

  // Utiliser les colonnes personnalisées ou le preset
  const columns = mobileColumns !== undefined || tabletColumns !== undefined || desktopColumns !== undefined
    ? {
        base: mobileColumns ?? 1,
        md: tabletColumns ?? 2,
        lg: desktopColumns ?? 3
      }
    : presetMap[preset];

  // Espacement
  const spacingMap = {
    tight: { base: 3, md: 4 },
    normal: { base: 4, md: 6 },
    loose: { base: 6, md: 8 }
  };

  return (
    <SimpleGrid
      columns={columns}
      spacing={spacingMap[spacingType]}
      {...props}
    >
      {children}
    </SimpleGrid>
  );
};

export default ResponsiveGrid;
