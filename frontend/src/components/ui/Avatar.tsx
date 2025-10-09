/**
 * 👤 AVATAR COMPONENT
 * Avatar avec statut, genre et bordure personnalisable
 */

import React from 'react';
import { Avatar as ChakraAvatar, AvatarProps as ChakraAvatarProps, Box } from '@chakra-ui/react';

export interface AvatarProps extends Omit<ChakraAvatarProps, 'size'> {
  /** Taille de l'avatar */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  /** URL de l'image */
  src?: string;
  /** Nom pour fallback */
  name: string;
  /** Statut (vivant/décédé) */
  status?: 'alive' | 'deceased' | 'online' | 'offline';
  /** Genre */
  gender?: 'M' | 'F';
  /** Afficher la bordure colorée */
  showBorder?: boolean;
  /** Couleur de bordure personnalisée */
  borderColor?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  size = 'md',
  src,
  name,
  status,
  gender,
  showBorder = false,
  borderColor,
  ...props
}) => {
  // Mapping taille
  const sizeMap = {
    'xs': '2rem',
    'sm': '3rem',
    'md': '4rem',
    'lg': '5rem',
    'xl': '6rem',
    '2xl': '8rem'
  };

  // Taille du badge de statut (proportionnel)
  const badgeSizeMap = {
    'xs': '0.5rem',
    'sm': '0.75rem',
    'md': '1rem',
    'lg': '1.25rem',
    'xl': '1.5rem',
    '2xl': '2rem'
  };

  // Couleur de bordure selon genre
  const getBorderColor = (): string => {
    if (borderColor) return borderColor;
    if (!showBorder) return 'transparent';
    if (gender === 'M') return '#3B82F6'; // Bleu
    if (gender === 'F') return '#EC4899'; // Rose
    return '#9CA3AF'; // Gris par défaut
  };

  // Couleur du badge de statut
  const getStatusColor = (): string => {
    if (status === 'alive' || status === 'online') return '#10B981'; // Vert
    if (status === 'deceased' || status === 'offline') return '#9CA3AF'; // Gris
    return 'transparent';
  };

  return (
    <Box position="relative" display="inline-block">
      <ChakraAvatar
        src={src}
        name={name}
        width={sizeMap[size]}
        height={sizeMap[size]}
        border={showBorder ? '3px solid' : 'none'}
        borderColor={getBorderColor()}
        {...props}
      />

      {/* Badge de statut */}
      {status && (
        <Box
          position="absolute"
          bottom="0"
          right="0"
          width={badgeSizeMap[size]}
          height={badgeSizeMap[size]}
          borderRadius="full"
          bg={getStatusColor()}
          border="2px solid white"
        />
      )}
    </Box>
  );
};

export default Avatar;
