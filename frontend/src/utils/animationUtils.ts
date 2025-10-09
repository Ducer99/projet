/**
 * 🌊 ANIMATION UTILITIES
 * Variants Framer Motion réutilisables pour animations fluides
 */

import { Variants } from 'framer-motion';

/**
 * Fade In - Apparition en fondu
 */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: [0.16, 1, 0.3, 1] // Apple ease-out
    }
  }
};

/**
 * Slide Up - Montée avec fondu
 */
export const slideUp: Variants = {
  hidden: {
    opacity: 0,
    y: 20
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

/**
 * Slide Down - Descente avec fondu
 */
export const slideDown: Variants = {
  hidden: {
    opacity: 0,
    y: -20
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

/**
 * Scale In - Zoom avec fondu
 */
export const scaleIn: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

/**
 * Stagger Children - Animation en cascade pour les enfants
 */
export const staggerChildren: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

/**
 * Stagger Item - Élément d'une animation en cascade
 */
export const staggerItem: Variants = {
  hidden: {
    opacity: 0,
    y: 10
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

/**
 * Card Hover - Animation au survol de carte
 */
export const cardHover = {
  rest: {
    scale: 1,
    y: 0,
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.08)'
  },
  hover: {
    scale: 1.02,
    y: -4,
    boxShadow: '0 16px 32px rgba(0, 0, 0, 0.12)',
    transition: {
      duration: 0.2,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

/**
 * Button Hover - Animation au survol de bouton
 */
export const buttonHover = {
  rest: { scale: 1 },
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.2,
      ease: [0.16, 1, 0.3, 1]
    }
  },
  tap: {
    scale: 0.95
  }
};

/**
 * Modal - Animation de modal (slide from bottom)
 */
export const modal: Variants = {
  hidden: {
    opacity: 0,
    y: 100,
    scale: 0.9
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1]
    }
  },
  exit: {
    opacity: 0,
    y: 100,
    scale: 0.9,
    transition: {
      duration: 0.3,
      ease: [0.7, 0, 0.84, 0]
    }
  }
};

/**
 * Page Transition - Animation de transition de page
 */
export const pageTransition: Variants = {
  initial: {
    opacity: 0,
    x: -20
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1]
    }
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: {
      duration: 0.3,
      ease: [0.7, 0, 0.84, 0]
    }
  }
};

/**
 * Spring Animation - Animation élastique (Apple-style)
 */
export const springAnimation = {
  type: 'spring',
  stiffness: 300,
  damping: 30
};

/**
 * Smooth Transition - Transition fluide générique
 */
export const smoothTransition = {
  duration: 0.3,
  ease: [0.4, 0, 0.2, 1]
};
