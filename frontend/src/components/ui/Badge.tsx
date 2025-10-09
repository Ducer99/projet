/**
 * 🏷️ BADGE COMPONENT
 * Badge/étiquette avec variants colorés
 */

import React, { ReactNode } from 'react';
import { Badge as ChakraBadge, BadgeProps as ChakraBadgeProps } from '@chakra-ui/react';

export interface BadgeProps extends ChakraBadgeProps {
  /** Variant du badge */
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info' | 'gender-male' | 'gender-female';
  /** Taille du badge */
  size?: 'sm' | 'md' | 'lg';
  /** Icône à gauche */
  icon?: ReactNode;
  /** Afficher un point coloré */
  dot?: boolean;
  children: ReactNode;
}

const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'md',
  icon,
  dot = false,
  children,
  ...props
}) => {
  // Mapping taille
  const sizeMap = {
    sm: {
      fontSize: '0.75rem',
      px: 2,
      py: 0.5,
      height: '20px'
    },
    md: {
      fontSize: '0.875rem',
      px: 3,
      py: 1,
      height: '24px'
    },
    lg: {
      fontSize: '1rem',
      px: 4,
      py: 1.5,
      height: '28px'
    }
  };

  // Styles selon variant
  const variantStyles = {
    default: {
      bg: 'gray.100',
      color: 'gray.700'
    },
    success: {
      bg: 'green.50',
      color: 'green.600'
    },
    error: {
      bg: 'red.50',
      color: 'red.600'
    },
    warning: {
      bg: 'yellow.50',
      color: 'yellow.600'
    },
    info: {
      bg: 'blue.50',
      color: 'blue.600'
    },
    'gender-male': {
      bg: 'blue.50',
      color: 'blue.700'
    },
    'gender-female': {
      bg: 'pink.50',
      color: 'pink.700'
    }
  };

  return (
    <ChakraBadge
      display="inline-flex"
      alignItems="center"
      gap={1}
      borderRadius="full"
      fontWeight="medium"
      {...sizeMap[size]}
      {...variantStyles[variant]}
      {...props}
    >
      {/* Point coloré */}
      {dot && (
        <svg width="6" height="6" viewBox="0 0 6 6" fill="currentColor">
          <circle cx="3" cy="3" r="3" />
        </svg>
      )}

      {/* Icône */}
      {icon && <span>{icon}</span>}

      {/* Texte */}
      {children}
    </ChakraBadge>
  );
};

export default Badge;
