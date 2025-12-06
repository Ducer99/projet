import { extendTheme } from '@chakra-ui/react';

// 🎨 Design System Unifié - Family Tree App
// Palette cohérente : Violet/Indigo + Tons Pastel
const theme = extendTheme({
  colors: {
    // Palette principale (Violet/Indigo Doux)
    primary: {
      50: '#F5F3FF',   // Lavande très clair
      100: '#EDE9FE',  // Lavande clair
      200: '#DDD6FE',  // Lavande
      300: '#C4B5FD',  // Violet pastel
      400: '#A78BFA',  // Violet clair
      500: '#8B5CF6',  // Violet principal ⭐
      600: '#7C3AED',  // Violet profond
      700: '#6D28D9',  // Violet intense
      800: '#5B21B6',  // Violet sombre
      900: '#4C1D95',  // Violet très sombre
    },
    // Palette secondaire (Indigo Doux)
    secondary: {
      50: '#EEF2FF',
      100: '#E0E7FF',
      200: '#C7D2FE',
      300: '#A5B4FC',
      400: '#818CF8',
      500: '#6366F1',  // Indigo principal
      600: '#4F46E5',
      700: '#4338CA',
      800: '#3730A3',
      900: '#312E81',
    },
    // Couleurs sémantiques adoucies
    accent: {
      success: '#86EFAC',   // Vert pastel
      warning: '#FCD34D',   // Jaune pastel
      error: '#FCA5A5',     // Rouge pastel
      info: '#93C5FD',      // Bleu pastel
      male: '#93C5FD',      // Bleu doux
      female: '#F9A8D4',    // Rose doux
    },
    // Glassmorphism
    glass: {
      white: 'rgba(255, 255, 255, 0.8)',
      purple: 'rgba(139, 92, 246, 0.1)',
      border: 'rgba(139, 92, 246, 0.2)',
    },
  },
  // 📐 Espacements standardisés
  space: {
    px: '1px',
    0: '0',
    1: '0.25rem',  // 4px
    2: '0.5rem',   // 8px
    3: '0.75rem',  // 12px
    4: '1rem',     // 16px
    5: '1.25rem',  // 20px
    6: '1.5rem',   // 24px
    8: '2rem',     // 32px
    10: '2.5rem',  // 40px
    12: '3rem',    // 48px
    16: '4rem',    // 64px
  },
  // 🔷 Border Radius Unifié
  radii: {
    none: '0',
    sm: '0.25rem',   // 4px
    base: '0.5rem',  // 8px ⭐ Standard
    md: '0.75rem',   // 12px ⭐ Cards
    lg: '1rem',      // 16px
    xl: '1.5rem',    // 24px
    '2xl': '2rem',   // 32px
    '3xl': '3rem',   // 48px
    full: '9999px',
  },
  // 🌫️ Ombres cohérentes
  shadows: {
    sm: '0 1px 2px 0 rgba(139, 92, 246, 0.05)',
    base: '0 1px 3px 0 rgba(139, 92, 246, 0.1), 0 1px 2px -1px rgba(139, 92, 246, 0.1)',
    md: '0 4px 6px -1px rgba(139, 92, 246, 0.1), 0 2px 4px -2px rgba(139, 92, 246, 0.1)',
    lg: '0 10px 15px -3px rgba(139, 92, 246, 0.1), 0 4px 6px -4px rgba(139, 92, 246, 0.1)',
    xl: '0 20px 25px -5px rgba(139, 92, 246, 0.1), 0 8px 10px -6px rgba(139, 92, 246, 0.1)',
    '2xl': '0 25px 50px -12px rgba(139, 92, 246, 0.25)',
    glass: '0 8px 32px 0 rgba(139, 92, 246, 0.15)',
  },
  fonts: {
    heading: "'Playfair Display', Georgia, serif",
    body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  fontSizes: {
    xs: '0.875rem',  // 14px
    sm: '1rem',      // 16px
    md: '1.125rem',  // 18px (base augmentée)
    lg: '1.25rem',   // 20px
    xl: '1.5rem',    // 24px
    '2xl': '1.875rem', // 30px
    '3xl': '2.25rem',  // 36px
    '4xl': '3rem',     // 48px
  },
  styles: {
    global: {
      html: {
        fontSize: '18px', // Base augmentée pour lisibilité seniors
      },
      body: {
        lineHeight: '1.6', // Meilleure lisibilité
        color: 'gray.800',
      },
    },
  },
  components: {
    // 🔘 Boutons Unifiés
    Button: {
      baseStyle: {
        fontWeight: '600',
        borderRadius: 'md', // ⭐ 12px partout
        transition: 'all 0.2s',
      },
      defaultProps: {
        colorScheme: 'primary',
      },
      variants: {
        solid: {
          bg: 'primary.500',
          color: 'white',
          _hover: {
            bg: 'primary.600',
            transform: 'translateY(-1px)',
            shadow: 'md',
          },
          _active: {
            bg: 'primary.700',
            transform: 'scale(0.98)',
          },
        },
        glass: {
          bg: 'glass.white',
          backdropFilter: 'blur(10px)',
          border: '1px solid',
          borderColor: 'glass.border',
          color: 'primary.700',
          _hover: {
            bg: 'glass.purple',
            borderColor: 'primary.300',
          },
        },
        gradient: {
          bgGradient: 'linear(to-r, primary.400, secondary.500)',
          color: 'white',
          _hover: {
            bgGradient: 'linear(to-r, primary.500, secondary.600)',
            transform: 'translateY(-2px)',
            shadow: 'lg',
          },
          _active: {
            transform: 'scale(0.98)',
          },
        },
        heritage: {
          bg: 'primary.500',
          color: 'white',
          transition: 'all 0.3s',
          _hover: {
            bg: 'primary.600',
            transform: 'translateY(-2px)',
            boxShadow: 'lg',
          },
          _active: {
            transform: 'scale(0.98)',
          },
        },
      },
    },
    // 🃏 Cards Unifiées
    Card: {
      baseStyle: {
        container: {
          borderRadius: 'md', // ⭐ 12px
          boxShadow: 'md',
          overflow: 'hidden',
          transition: 'all 0.2s',
        },
      },
      variants: {
        glass: {
          container: {
            bg: 'glass.white',
            backdropFilter: 'blur(10px)',
            border: '1px solid',
            borderColor: 'glass.border',
            boxShadow: 'glass',
          },
        },
        elevated: {
          container: {
            bg: 'white',
            boxShadow: 'lg',
            _hover: {
              boxShadow: 'xl',
              transform: 'translateY(-2px)',
            },
          },
        },
      },
    },
    // 📝 Inputs Unifiés
    Input: {
      baseStyle: {
        field: {
          borderRadius: 'md', // ⭐ 12px
        },
      },
      defaultProps: {
        focusBorderColor: 'primary.500',
      },
      variants: {
        outline: {
          field: {
            borderColor: 'gray.300',
            _hover: {
              borderColor: 'primary.300',
            },
            _focus: {
              borderColor: 'primary.500',
              boxShadow: '0 0 0 1px var(--chakra-colors-primary-500)',
            },
          },
        },
        heritage: {
          field: {
            borderWidth: '2px',
            borderColor: 'primary.200',
            _hover: {
              borderColor: 'primary.300',
            },
            _focus: {
              borderColor: 'primary.500',
              boxShadow: '0 0 0 1px var(--chakra-colors-primary-500)',
            },
          },
        },
      },
    },
    Heading: {
      baseStyle: {
        color: 'primary.900',
      },
    },
  },
});

export default theme;
