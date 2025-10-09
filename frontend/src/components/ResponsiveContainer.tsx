import { Container, ContainerProps } from '@chakra-ui/react';
import { ReactNode } from 'react';

/**
 * 🎯 Composant Container Responsive
 * 
 * Un container qui s'adapte automatiquement à la taille de l'écran
 * avec des valeurs par défaut optimisées pour mobile, tablette et desktop.
 * 
 * @example
 * // Container simple
 * <ResponsiveContainer>
 *   <Content />
 * </ResponsiveContainer>
 * 
 * @example
 * // Container large
 * <ResponsiveContainer size="lg">
 *   <Content />
 * </ResponsiveContainer>
 * 
 * @example
 * // Container avec padding personnalisé
 * <ResponsiveContainer paddingType="tight">
 *   <Content />
 * </ResponsiveContainer>
 */

interface ResponsiveContainerProps extends Omit<ContainerProps, 'maxW'> {
  /** Taille du container */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Type de padding */
  paddingType?: 'tight' | 'normal' | 'loose';
  /** Enfants */
  children: ReactNode;
}

export const ResponsiveContainer = ({
  size = 'lg',
  paddingType = 'normal',
  children,
  ...props
}: ResponsiveContainerProps) => {
  const maxWidthMap = {
    sm: { base: '100%', md: 'container.sm' },
    md: { base: '100%', md: 'container.md' },
    lg: { base: '100%', md: 'container.md', lg: 'container.lg' },
    xl: { base: '100%', md: 'container.md', lg: 'container.xl' },
    full: { base: '100%' }
  };

  const paddingMap = {
    tight: { base: 3, md: 4 },
    normal: { base: 4, md: 6 },
    loose: { base: 6, md: 8 }
  };

  return (
    <Container
      maxW={maxWidthMap[size]}
      px={paddingMap[paddingType]}
      {...props}
    >
      {children}
    </Container>
  );
};

export default ResponsiveContainer;
