/**
 * 🎴 CARD COMPONENT
 * Carte réutilisable avec variants et animations
 * Inspiré Apple et Notion
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Box, BoxProps } from '@chakra-ui/react';

export interface CardProps extends BoxProps {
  /** Variant de la carte */
  variant?: 'default' | 'elevated' | 'outlined' | 'glass';
  /** Taille du padding */
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  /** Activer l'effet hover */
  hover?: boolean;
  /** Dégradé de fond (famille) */
  gradient?: string;
  /** Bordure colorée en haut */
  borderTopColor?: string;
  /** Animation au montage */
  animate?: boolean;
}

const Card: React.FC<CardProps> = ({
  variant = 'default',
  padding = 'md',
  hover = false,
  gradient,
  borderTopColor,
  animate = true,
  children,
  ...props
}) => {
  // Mapping padding
  const paddingMap = {
    sm: 4,
    md: 6,
    lg: 8,
    xl: 10
  };

  // Styles selon variant
  const variantStyles = {
    default: {
      bg: 'white',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.08)',
      border: 'none'
    },
    elevated: {
      bg: 'white',
      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
      border: 'none'
    },
    outlined: {
      bg: 'white',
      boxShadow: 'none',
      border: '1.5px solid',
      borderColor: 'gray.200'
    },
    glass: {
      bg: 'whiteAlpha.700',
      backdropFilter: 'blur(20px)',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.08)',
      border: '1px solid',
      borderColor: 'whiteAlpha.300'
    }
  };

  const MotionBox = motion(Box);

  return (
    <MotionBox
      initial={animate ? { opacity: 0, y: 20 } : false}
      animate={animate ? { opacity: 1, y: 0 } : false}
      whileHover={hover ? {
        y: -4,
        boxShadow: '0 16px 32px rgba(0, 0, 0, 0.12)',
        transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] }
      } : undefined}
      transition={animate ? {
        duration: 0.3,
        ease: [0.16, 1, 0.3, 1]
      } : undefined}
      borderRadius="24px"
      overflow="hidden"
      p={paddingMap[padding]}
      position="relative"
      {...variantStyles[variant]}
      {...props}
    >
      {/* Bordure colorée en haut */}
      {borderTopColor && (
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          height="4px"
          background={borderTopColor}
        />
      )}

      {/* Fond dégradé */}
      {gradient && (
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          background={gradient}
          opacity={0.1}
          zIndex={0}
        />
      )}

      {/* Contenu */}
      <Box position="relative" zIndex={1}>
        {children}
      </Box>
    </MotionBox>
  );
};

export default Card;
