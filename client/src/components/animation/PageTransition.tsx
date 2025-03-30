import React, { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import { pageTransition } from '@/lib/animations';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
  mode?: 'sync' | 'wait';
  direction?: 'forward' | 'backward';
}

const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  className = '',
  mode = 'wait',
  direction = 'forward'
}) => {
  const [location] = useLocation();

  return (
    <AnimatePresence
      mode={mode}
      initial={false}
      custom={direction === 'forward' ? 1 : -1}
    >
      <motion.div
        key={location}
        initial="initial"
        animate="enter"
        exit="exit"
        variants={pageTransition}
        className={className}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default PageTransition;