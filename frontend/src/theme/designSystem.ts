// Design System - Family Tree Application
// Inspiré par Dieter Rams, Don Norman, Apple & Notion

import { extendTheme } from '@chakra-ui/react';

const designSystem = extendTheme({
  // Typographie - Inter & Poppins
  fonts: {
    heading: `'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`,
    body: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`,
  },

  // Palette de couleurs émotionnelle et chaleureuse
  colors: {
    // Couleurs par famille (code couleur)
    family: {
      primary: '#FF6B6B',      // Rouge chaleureux
      secondary: '#4ECDC4',    // Turquoise apaisant
      tertiary: '#45B7D1',     // Bleu ciel
      quaternary: '#FFA07A',   // Orange saumon
      quinary: '#98D8C8',      // Vert menthe
    },

    // Palette principale
    brand: {
      50: '#FFF5F5',
      100: '#FFE8E8',
      200: '#FFC7C7',
      300: '#FFA6A6',
      400: '#FF8585',
      500: '#FF6B6B',   // Couleur principale
      600: '#E85555',
      700: '#D13F3F',
      800: '#BA2929',
      900: '#A31313',
    },

    // Neutres chaleureux (Apple-inspired)
    neutral: {
      50: '#FAFAFA',
      100: '#F5F5F5',
      200: '#E8E8E8',
      300: '#D4D4D4',
      400: '#A3A3A3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
    },

    // Dégradés émotionnels
    gradient: {
      warm: 'linear-gradient(135deg, #FFE8E8 0%, #FFD6D6 100%)',
      cool: 'linear-gradient(135deg, #E0F7FA 0%, #B2EBF2 100%)',
      sunset: 'linear-gradient(135deg, #FFF5E6 0%, #FFE0B2 100%)',
      nature: 'linear-gradient(135deg, #F1F8E9 0%, #DCEDC8 100%)',
      love: 'linear-gradient(135deg, #FCE4EC 0%, #F8BBD0 100%)',
    },
  },

  // Espacements harmonieux (8px grid)
  space: {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    '2xl': '3rem',    // 48px
    '3xl': '4rem',    // 64px
    '4xl': '6rem',    // 96px
  },

  // Tailles de texte
  fontSizes: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    md: '1rem',       // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem',// 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
  },

  // Bordures arrondies douces
  radii: {
    none: '0',
    sm: '0.375rem',   // 6px
    base: '0.5rem',   // 8px
    md: '0.75rem',    // 12px
    lg: '1rem',       // 16px
    xl: '1.5rem',     // 24px
    '2xl': '2rem',    // 32px
    full: '9999px',
  },

  // Ombres douces et profondes
  shadows: {
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    card: '0 2px 8px rgba(0, 0, 0, 0.08)',
    float: '0 8px 24px rgba(0, 0, 0, 0.12)',
  },

  // Styles globaux
  styles: {
    global: {
      body: {
        bg: 'neutral.50',
        color: 'neutral.900',
        lineHeight: '1.6',
        fontFeatureSettings: '"cv02", "cv03", "cv04", "cv11"', // Inter features
      },
      '*::placeholder': {
        color: 'neutral.400',
      },
      '*, *::before, &::after': {
        borderColor: 'neutral.200',
      },
    },
  },

  // Composants personnalisés
  components: {
    Button: {
      baseStyle: {
        fontWeight: '500',
        borderRadius: 'lg',
        transition: 'all 0.2s ease-in-out',
        _focus: {
          boxShadow: '0 0 0 3px rgba(255, 107, 107, 0.2)',
        },
      },
      variants: {
        primary: {
          bg: 'brand.500',
          color: 'white',
          _hover: {
            bg: 'brand.600',
            transform: 'translateY(-2px)',
            shadow: 'lg',
          },
          _active: {
            bg: 'brand.700',
            transform: 'translateY(0)',
          },
        },
        ghost: {
          _hover: {
            bg: 'neutral.100',
          },
        },
        outline: {
          borderWidth: '1.5px',
          _hover: {
            bg: 'neutral.50',
            transform: 'translateY(-1px)',
          },
        },
      },
      defaultProps: {
        variant: 'primary',
      },
    },

    Card: {
      baseStyle: {
        container: {
          bg: 'white',
          borderRadius: 'xl',
          boxShadow: 'card',
          transition: 'all 0.3s ease-in-out',
          _hover: {
            boxShadow: 'float',
            transform: 'translateY(-4px)',
          },
        },
      },
    },

    Input: {
      variants: {
        outline: {
          field: {
            borderRadius: 'lg',
            borderWidth: '1.5px',
            _focus: {
              borderColor: 'brand.500',
              boxShadow: '0 0 0 1px rgba(255, 107, 107, 0.2)',
            },
          },
        },
      },
      defaultProps: {
        variant: 'outline',
      },
    },

    Heading: {
      baseStyle: {
        fontWeight: '600',
        letterSpacing: '-0.02em',
      },
    },

    Text: {
      baseStyle: {
        letterSpacing: '-0.01em',
      },
    },
  },

  // Configuration des animations
  transition: {
    duration: {
      fast: '150ms',
      base: '200ms',
      slow: '300ms',
      slower: '500ms',
    },
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    },
  },
});

// Utilitaires pour les nœuds de l'arbre généalogique
export const treeNodeStyles = {
  base: {
    bg: 'white',
    borderRadius: 'xl',
    boxShadow: 'card',
    p: 4,
    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
    cursor: 'pointer',
    _hover: {
      transform: 'scale(1.05) translateY(-4px)',
      boxShadow: 'float',
      zIndex: 10,
    },
  },
  male: {
    borderLeft: '4px solid',
    borderColor: '#4A90E2',
  },
  female: {
    borderLeft: '4px solid',
    borderColor: '#FF6B9D',
  },
  marriage: {
    bg: 'gradient.love',
    borderColor: 'brand.300',
  },
};

// Styles pour les connexions (lignes de l'arbre)
export const connectionStyles = {
  parent: {
    stroke: '#D4D4D4',
    strokeWidth: 2,
    strokeDasharray: '0',
  },
  marriage: {
    stroke: '#FF6B9D',
    strokeWidth: 3,
    strokeDasharray: '0',
  },
  sibling: {
    stroke: '#A3A3A3',
    strokeWidth: 1.5,
    strokeDasharray: '5,5',
  },
};

// Animations CSS personnalisées
export const animations = {
  fadeIn: {
    animation: 'fadeIn 0.3s ease-in-out',
    '@keyframes fadeIn': {
      '0%': { opacity: 0, transform: 'translateY(10px)' },
      '100%': { opacity: 1, transform: 'translateY(0)' },
    },
  },
  slideIn: {
    animation: 'slideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
    '@keyframes slideIn': {
      '0%': { opacity: 0, transform: 'translateX(-20px)' },
      '100%': { opacity: 1, transform: 'translateX(0)' },
    },
  },
  pulse: {
    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    '@keyframes pulse': {
      '0%, 100%': { opacity: 1 },
      '50%': { opacity: 0.7 },
    },
  },
};

export default designSystem;
