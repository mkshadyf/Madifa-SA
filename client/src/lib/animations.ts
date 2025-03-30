import { Variants } from 'framer-motion';

// Staggered fade-in animation for lists
export const staggeredFadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.04
    }
  }
};

// Staggered item animation for lists
export const staggeredItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 15,
      stiffness: 150
    }
  }
};

// Page transition animation
export const pageTransition: Variants = {
  initial: {
    opacity: 0,
    y: 10
  },
  enter: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.33, 1, 0.68, 1]
    }
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.2,
      ease: [0.33, 1, 0.68, 1]
    }
  }
};

// Card hover animation
export const cardHover: Variants = {
  initial: {
    scale: 1,
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
  },
  hover: {
    scale: 1.03,
    boxShadow: '0 10px 15px rgba(0, 0, 0, 0.2)',
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 17
    }
  },
  tap: {
    scale: 0.97,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 10
    }
  }
};

// Simple fade animation for modals and dialogs
export const simpleFade: Variants = {
  hidden: {
    opacity: 0
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.2,
      ease: 'easeOut'
    }
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.15,
      ease: 'easeIn'
    }
  }
};

// Modal animation with scale
export const modalAnimation: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.96,
    y: -10
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 350,
      damping: 25
    }
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 10,
    transition: {
      duration: 0.15,
      ease: 'easeIn'
    }
  }
};

// Slide in from left
export const slideInLeft: Variants = {
  hidden: {
    x: -50,
    opacity: 0
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24
    }
  },
  exit: {
    x: -50,
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: 'easeIn'
    }
  }
};

// Slide in from right
export const slideInRight: Variants = {
  hidden: {
    x: 50,
    opacity: 0
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24
    }
  },
  exit: {
    x: 50,
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: 'easeIn'
    }
  }
};

// Slide in from bottom
export const slideInBottom: Variants = {
  hidden: {
    y: 50,
    opacity: 0
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24
    }
  },
  exit: {
    y: 50,
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: 'easeIn'
    }
  }
};

// Loading spinner animation
export const spinnerAnimation: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      ease: 'linear',
      repeat: Infinity
    }
  }
};

// Bounce animation
export const bounce: Variants = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 0.5,
      ease: 'easeInOut',
      times: [0, 0.5, 1]
    }
  }
};

// Pulse animation
export const pulse: Variants = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: 2,
      ease: 'easeInOut',
      times: [0, 0.5, 1],
      repeat: Infinity,
      repeatType: 'reverse'
    }
  }
};

// Image reveal animation
export const imageReveal: Variants = {
  hidden: {
    opacity: 0,
    scale: 1.1
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.33, 1, 0.68, 1]
    }
  }
};

// Button hover animation
export const buttonHover: Variants = {
  initial: {
    scale: 1
  },
  hover: {
    scale: 1.03,
    transition: {
      duration: 0.2,
      ease: 'easeInOut'
    }
  },
  tap: {
    scale: 0.97,
    transition: {
      duration: 0.1,
      ease: 'easeOut'
    }
  }
};

// Carousel slide animation
export const carouselSlide: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: {
      x: { type: 'spring', stiffness: 300, damping: 30 },
      opacity: { duration: 0.3 }
    }
  },
  exit: (direction: number) => ({
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
    transition: {
      x: { type: 'spring', stiffness: 300, damping: 30 },
      opacity: { duration: 0.3 }
    }
  })
};

// Video card animation
export const videoCardAnimation: Variants = {
  initial: {
    scale: 1,
    y: 0,
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    transition: { duration: 0.2 }
  },
  hover: {
    scale: 1.03,
    y: -5,
    boxShadow: '0 12px 20px rgba(0, 0, 0, 0.15)',
    transition: {
      type: 'spring',
      stiffness: 350,
      damping: 25
    }
  },
  tap: {
    scale: 0.98,
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 17
    }
  }
};

// Loading skeleton animation
export const skeletonLoading: Variants = {
  initial: {
    backgroundPosition: '0% 0%'
  },
  animate: {
    backgroundPosition: ['0% 0%', '100% 0%', '100% 0%'],
    transition: {
      repeat: Infinity,
      repeatType: 'loop',
      duration: 1.5,
      ease: 'linear'
    }
  }
};