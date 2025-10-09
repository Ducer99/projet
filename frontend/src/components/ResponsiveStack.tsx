import { Stack, StackProps } from '@chakra-ui/react';
import { ReactNode } from 'react';

/**
 * 🎯 Composant Stack Responsive
 * 
 * Un Stack qui change de direction automatiquement selon la taille de l'écran.
 * Par défaut: vertical sur mobile, horizontal sur desktop.
 * 
 * @example
 * // Stack vertical sur mobile, horizontal sur desktop
 * <ResponsiveStack>
 *   <Button>Action 1</Button>
 *   <Button>Action 2</Button>
 * </ResponsiveStack>
 * 
 * @example
 * // Stack horizontal sur mobile, vertical sur desktop
 * <ResponsiveStack behavior="horizontal-vertical">
 *   <Box>Élément 1</Box>
 *   <Box>Élément 2</Box>
 * </ResponsiveStack>
 * 
 * @example
 * // Stack avec espacement personnalisé
 * <ResponsiveStack spacingType="loose">
 *   <Card />
 *   <Card />
 * </ResponsiveStack>
 */

interface ResponsiveStackProps extends Omit<StackProps, 'direction' | 'spacing'> {
  /** Comportement de direction */
  behavior?: 'vertical-horizontal' | 'horizontal-vertical' | 'always-vertical' | 'always-horizontal';
  /** Type d'espacement */
  spacingType?: 'tight' | 'normal' | 'loose';
  /** Breakpoint de changement de direction (par défaut: 'md') */
  breakAt?: 'sm' | 'md' | 'lg';
  /** Enfants */
  children: ReactNode;
}

export const ResponsiveStack = ({
  behavior = 'vertical-horizontal',
  spacingType = 'normal',
  breakAt = 'md',
  children,
  ...props
}: ResponsiveStackProps) => {
  // Direction selon le comportement
  const directionMap = {
    'vertical-horizontal': { base: 'column', [breakAt]: 'row' },
    'horizontal-vertical': { base: 'row', [breakAt]: 'column' },
    'always-vertical': 'column',
    'always-horizontal': 'row'
  };

  // Espacement
  const spacingMap = {
    tight: { base: 2, md: 3 },
    normal: { base: 4, md: 6 },
    loose: { base: 6, md: 8 }
  };

  return (
    <Stack
      direction={directionMap[behavior] as any}
      spacing={spacingMap[spacingType]}
      {...props}
    >
      {children}
    </Stack>
  );
};

export default ResponsiveStack;
