// Animations pour micro-interactions
// Usage avec Chakra UI: 
// <Box sx={{ '@keyframes fadeInUp': fadeInUp, animation: 'fadeInUp 0.5s ease-out' }}>

export const fadeInUp = {
  from: { 
    opacity: 0, 
    transform: 'translateY(20px)' 
  },
  to: { 
    opacity: 1, 
    transform: 'translateY(0)' 
  }
};

export const fadeIn = {
  from: { 
    opacity: 0 
  },
  to: { 
    opacity: 1 
  }
};

export const slideInRight = {
  from: { 
    opacity: 0, 
    transform: 'translateX(-20px)' 
  },
  to: { 
    opacity: 1, 
    transform: 'translateX(0)' 
  }
};

export const pulse = {
  '0%, 100%': { 
    transform: 'scale(1)' 
  },
  '50%': { 
    transform: 'scale(1.05)' 
  }
};

export const heartbeat = {
  '0%, 100%': { 
    transform: 'scale(1)' 
  },
  '25%': { 
    transform: 'scale(1.1)' 
  },
  '50%': { 
    transform: 'scale(1)' 
  },
  '75%': { 
    transform: 'scale(1.05)' 
  }
};

export const float = {
  '0%, 100%': { 
    transform: 'translateY(0)' 
  },
  '50%': { 
    transform: 'translateY(-10px)' 
  }
};

export const glow = {
  '0%, 100%': { 
    boxShadow: '0 0 5px rgba(212, 165, 116, 0.5)' 
  },
  '50%': { 
    boxShadow: '0 0 20px rgba(212, 165, 116, 0.8)' 
  }
};

