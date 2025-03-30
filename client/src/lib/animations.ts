import { Variants } from "framer-motion";

// Animation for page transitions
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  in: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
  out: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2,
      ease: "easeIn",
    },
  },
};

// Animation for items in staggered lists
export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// Animation for individual items in lists
export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
};

// Animation for fade in elements
export const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: {
      duration: 0.4,
    }
  },
};

// Animation for sliding elements from right
export const slideFromRightVariants: Variants = {
  hidden: { opacity: 0, x: 100 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
    }
  },
};

// Animation for sliding elements from left
export const slideFromLeftVariants: Variants = {
  hidden: { opacity: 0, x: -100 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
    }
  },
};

// Animation for popping up elements
export const popUpVariants: Variants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 15,
    }
  },
};

// Animation for cards on hover
export const scaleOnHoverVariants: Variants = {
  initial: { scale: 1 },
  hover: { 
    scale: 1.03,
    transition: {
      duration: 0.2,
      ease: "easeOut",
    }
  },
  tap: { scale: 0.98 },
};

// Animation for modals and dialogs
export const modalVariants: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.9,
    y: -20,
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: {
      ease: "easeOut",
      duration: 0.25,
    }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      ease: "easeIn",
      duration: 0.2,
    }
  }
};

// Animation for loading spinners
export const spinTransition = {
  loop: Infinity,
  ease: "linear",
  duration: 1,
};

// Animation for carousel items
export const carouselItemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.8,
    transition: {
      duration: 0.2,
    }
  },
};

// Animation for content loading skeleton
export const skeletonPulse: Variants = {
  initial: { opacity: 0.6 },
  animate: {
    opacity: [0.6, 0.8, 0.6],
    transition: {
      repeat: Infinity,
      duration: 1.5,
    },
  },
};

// Animation for button press
export const buttonPressVariants: Variants = {
  initial: { scale: 1 },
  tap: { scale: 0.95 },
  hover: { scale: 1.05 },
};

// Animation for drawer sliding in from bottom
export const drawerVariants: Variants = {
  hidden: { y: "100%" },
  visible: { 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
    }
  },
  exit: { 
    y: "100%",
    transition: {
      ease: "easeIn",
      duration: 0.2,
    }
  }
};