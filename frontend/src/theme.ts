import { extendTheme } from '@chakra-ui/react';

// Design System "Kinship Haven" - Palette Héritage Familial
const theme = extendTheme({
  colors: {
    primary: {
      50: '#FFF5E6',   // Beige très clair
      100: '#FFE4B8',  // Beige clair
      200: '#FFDAA0',  // Beige moyen
      300: '#E8C48A',  // Sable
      400: '#D8B27A',  // Or clair
      500: '#D4A574',  // Or ancien (principal)
      600: '#C99865',  // Or profond
      700: '#C48B5C',  // Cuivre
      800: '#A67650',  // Bronze
      900: '#8B6341',  // Bronze foncé
    },
    accent: {
      warm: '#F6D365',     // Or chaud
      sunset: '#FDA085',   // Coucher de soleil
      heart: '#E57373',    // Rouge familial
      forest: '#81C784',   // Vert nature
    },
    semantic: {
      male: '#4A90E2',     // Bleu homme
      female: '#EC6B9E',   // Rose femme
      deceased: '#95A5A6', // Gris décédé
      active: '#81C784',   // Vert actif
    },
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
    Button: {
      baseStyle: {
        fontWeight: 'semibold',
        borderRadius: 'lg',
      },
      defaultProps: {
        colorScheme: 'primary',
      },
      variants: {
        family: {
          bg: 'linear-gradient(135deg, #F6D365 0%, #FDA085 100%)',
          color: 'white',
          transition: 'all 0.3s',
          _hover: {
            transform: 'translateY(-2px)',
            boxShadow: 'xl',
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
    Card: {
      baseStyle: {
        container: {
          borderRadius: 'xl',
          boxShadow: 'md',
        },
      },
    },
    Input: {
      defaultProps: {
        focusBorderColor: 'primary.500',
      },
      variants: {
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
