import { ReactNode } from "react";
import { motion } from "framer-motion";
import { pageVariants } from "@/lib/animations";

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

/**
 * A wrapper component that adds smooth page transitions
 * Wrap your entire page content with this component for consistent page transitions
 */
export const PageTransition = ({ children, className = "" }: PageTransitionProps) => {
  return (
    <motion.div
      className={className}
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;