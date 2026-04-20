// Design System – Family Tree Application
// Palette "Héritage" : Violet profond + Ivoire chaud

import { extendTheme } from '@chakra-ui/react';

const designSystem = extendTheme({
  fonts: {
    heading: `'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`,
    body: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`,
  },

  colors: {
    // Override Chakra purple → Tailwind Violet (plus chaud, plus beau)
    purple: {
      50:  '#F5F3FF',
      100: '#EDE9FE',
      200: '#DDD6FE',
      300: '#C4B5FD',
      400: '#A78BFA',
      500: '#8B5CF6',
      600: '#7C3AED',
      700: '#6D28D9',
      800: '#5B21B6',
      900: '#4C1D95',
    },
    // Brand = même palette (utilisée pour colorScheme="brand")
    brand: {
      50:  '#F5F3FF',
      100: '#EDE9FE',
      200: '#DDD6FE',
      300: '#C4B5FD',
      400: '#A78BFA',
      500: '#8B5CF6',
      600: '#7C3AED',
      700: '#6D28D9',
      800: '#5B21B6',
      900: '#4C1D95',
    },
    // Neutres chauds (légèrement violacés)
    neutral: {
      50:  '#FAFAF9',
      100: '#F5F4F8',
      200: '#E8E6F0',
      300: '#D4D0E4',
      400: '#A09BB8',
      500: '#6E6890',
      600: '#504B6E',
      700: '#3D3856',
      800: '#2A2540',
      900: '#1A162E',
    },
  },

  radii: {
    none: '0',
    sm:   '0.375rem',   // 6px
    base: '0.5rem',     // 8px
    md:   '0.75rem',    // 12px
    lg:   '1rem',       // 16px
    xl:   '1.25rem',    // 20px
    '2xl':'1.75rem',    // 28px
    '3xl':'2.5rem',     // 40px
    full: '9999px',
  },

  shadows: {
    xs:     '0 1px 2px 0 rgba(76, 29, 149, 0.04)',
    sm:     '0 1px 4px 0 rgba(76, 29, 149, 0.06)',
    md:     '0 4px 14px -1px rgba(76, 29, 149, 0.08)',
    lg:     '0 10px 28px -3px rgba(76, 29, 149, 0.1)',
    xl:     '0 20px 44px -5px rgba(76, 29, 149, 0.12)',
    '2xl':  '0 25px 64px -12px rgba(76, 29, 149, 0.22)',
    card:   '0 2px 16px rgba(76, 29, 149, 0.07)',
    float:  '0 8px 32px rgba(76, 29, 149, 0.14)',
    header: '0 4px 24px rgba(76, 29, 149, 0.3)',
    glow:   '0 0 20px rgba(139, 92, 246, 0.4)',
  },

  fontSizes: {
    xs:   '0.75rem',
    sm:   '0.875rem',
    md:   '1rem',
    lg:   '1.125rem',
    xl:   '1.25rem',
    '2xl':'1.5rem',
    '3xl':'1.875rem',
    '4xl':'2.25rem',
    '5xl':'3rem',
  },

  styles: {
    global: {
      body: {
        bg: '#F7F5FF',
        color: '#1A162E',
        lineHeight: '1.6',
        fontFeatureSettings: '"cv02", "cv03", "cv04", "cv11"',
      },
      '*::placeholder': {
        color: '#A09BB8',
      },
      'h1, h2, h3, h4, h5, h6': {
        letterSpacing: '-0.02em',
      },
    },
  },

  components: {
    Button: {
      baseStyle: {
        fontWeight: '600',
        borderRadius: 'lg',
        transition: 'all 0.2s ease',
        letterSpacing: '-0.01em',
        _focus: {
          boxShadow: '0 0 0 3px rgba(139, 92, 246, 0.25)',
          outline: 'none',
        },
      },
      variants: {
        solid: {
          _hover: {
            transform: 'translateY(-1px)',
            boxShadow: 'lg',
          },
          _active: {
            transform: 'translateY(0)',
          },
        },
        ghost: {
          _hover: {
            bg: 'purple.50',
          },
        },
        outline: {
          borderWidth: '1.5px',
          _hover: {
            transform: 'translateY(-1px)',
            bg: 'purple.50',
          },
        },
        gradient: {
          bgGradient: 'linear(to-r, purple.600, purple.500)',
          color: 'white',
          _hover: {
            bgGradient: 'linear(to-r, purple.700, purple.600)',
            transform: 'translateY(-2px)',
            boxShadow: 'lg',
          },
          _active: {
            transform: 'translateY(0)',
          },
        },
      },
      defaultProps: {
        colorScheme: 'purple',
      },
    },

    Card: {
      baseStyle: {
        container: {
          bg: 'white',
          borderRadius: '2xl',
          boxShadow: 'card',
          overflow: 'hidden',
          transition: 'all 0.25s ease',
        },
      },
    },

    Input: {
      variants: {
        outline: {
          field: {
            borderRadius: 'lg',
            borderWidth: '1.5px',
            borderColor: '#E8E6F0',
            bg: 'white',
            _hover: { borderColor: 'purple.300' },
            _focus: {
              borderColor: 'purple.500',
              boxShadow: '0 0 0 2px rgba(139, 92, 246, 0.2)',
            },
          },
        },
      },
      defaultProps: {
        variant: 'outline',
        focusBorderColor: 'purple.500',
      },
    },

    Textarea: {
      variants: {
        outline: {
          borderRadius: 'lg',
          borderWidth: '1.5px',
          borderColor: '#E8E6F0',
          bg: 'white',
          _hover: { borderColor: 'purple.300' },
          _focus: {
            borderColor: 'purple.500',
            boxShadow: '0 0 0 2px rgba(139, 92, 246, 0.2)',
          },
        },
      },
      defaultProps: {
        variant: 'outline',
        focusBorderColor: 'purple.500',
      },
    },

    Select: {
      variants: {
        outline: {
          field: {
            borderRadius: 'lg',
            borderWidth: '1.5px',
            borderColor: '#E8E6F0',
            bg: 'white',
            _hover: { borderColor: 'purple.300' },
            _focus: {
              borderColor: 'purple.500',
              boxShadow: '0 0 0 2px rgba(139, 92, 246, 0.2)',
            },
          },
        },
      },
      defaultProps: {
        variant: 'outline',
        focusBorderColor: 'purple.500',
      },
    },

    Heading: {
      baseStyle: {
        fontWeight: '700',
        letterSpacing: '-0.02em',
        color: '#1A162E',
      },
    },

    Text: {
      baseStyle: {
        letterSpacing: '-0.01em',
      },
    },

    Badge: {
      baseStyle: {
        borderRadius: 'full',
        fontWeight: '600',
        letterSpacing: '0',
      },
    },

    Tabs: {
      variants: {
        line: {
          tab: {
            fontWeight: '500',
            _selected: {
              color: 'purple.600',
              borderColor: 'purple.500',
              fontWeight: '600',
            },
            _hover: {
              color: 'purple.500',
            },
          },
        },
        enclosed: {
          tab: {
            borderRadius: 'lg',
            fontWeight: '500',
            _selected: {
              bg: 'white',
              color: 'purple.700',
              fontWeight: '600',
              boxShadow: 'card',
            },
          },
        },
      },
    },

    FormLabel: {
      baseStyle: {
        fontWeight: '600',
        fontSize: 'sm',
        color: '#3D3856',
        letterSpacing: '-0.01em',
        mb: 1.5,
      },
    },

    Divider: {
      baseStyle: {
        borderColor: '#E8E6F0',
      },
    },

    Alert: {
      variants: {
        subtle: {
          container: {
            borderRadius: 'xl',
          },
        },
      },
    },
  },

  transition: {
    duration: {
      fast:   '150ms',
      base:   '200ms',
      slow:   '300ms',
      slower: '500ms',
    },
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut:   'cubic-bezier(0.0, 0, 0.2, 1)',
      easeIn:    'cubic-bezier(0.4, 0, 1, 1)',
      spring:    'cubic-bezier(0.34, 1.56, 0.64, 1)',
    },
  },
});

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
  male:    { borderLeft: '4px solid', borderColor: '#60A5FA' },
  female:  { borderLeft: '4px solid', borderColor: '#F472B6' },
  marriage:{ bg: '#FDF2F8', borderColor: '#C4B5FD' },
};

export const connectionStyles = {
  parent:   { stroke: '#C4B5FD', strokeWidth: 2, strokeDasharray: '0' },
  marriage: { stroke: '#F472B6', strokeWidth: 3, strokeDasharray: '0' },
  sibling:  { stroke: '#DDD6FE', strokeWidth: 1.5, strokeDasharray: '5,5' },
};

export const animations = {
  fadeIn: {
    animation: 'fadeIn 0.3s ease-in-out',
    '@keyframes fadeIn': {
      '0%':   { opacity: 0, transform: 'translateY(10px)' },
      '100%': { opacity: 1, transform: 'translateY(0)' },
    },
  },
  slideIn: {
    animation: 'slideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
    '@keyframes slideIn': {
      '0%':   { opacity: 0, transform: 'translateX(-20px)' },
      '100%': { opacity: 1, transform: 'translateX(0)' },
    },
  },
};

export default designSystem;
