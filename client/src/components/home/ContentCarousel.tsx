import { useRef } from "react";
import { Link } from "wouter";
import { ContentItem } from "@shared/types";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import VideoCard from "../video/VideoCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { staggeredFadeIn, simpleFade, staggeredItem } from "@/lib/animations";

interface ContentCarouselProps {
  title: string;
  viewAllLink?: string;
  items: ContentItem[];
  onAddToWatchlist?: (contentId: number) => void;
  aspect?: "video" | "poster";
  showProgress?: boolean;
}

const ContentCarousel = ({ 
  title, 
  viewAllLink, 
  items,
  onAddToWatchlist,
  aspect = "video",
  showProgress = false
}: ContentCarouselProps) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  
  const scroll = (direction: "left" | "right") => {
    if (!carouselRef.current) return;
    
    const { current } = carouselRef;
    // Adjust scroll amount for mobile (smaller screens)
    const scrollAmount = direction === "left" 
      ? -current.offsetWidth * (isMobile ? 0.9 : 0.75) 
      : current.offsetWidth * (isMobile ? 0.9 : 0.75);
    
    current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };
  
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <motion.div 
      className="mb-6 md:mb-8"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={simpleFade}
    >
      <motion.div 
        className="flex items-center justify-between mb-3 md:mb-4 px-4 md:px-0"
        variants={simpleFade}
      >
        <h2 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-foreground`}>{title}</h2>
        {viewAllLink && (
          <motion.div 
            className="text-primary text-xs md:text-sm font-medium hover:underline cursor-pointer" 
            onClick={() => window.location.href = viewAllLink}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            View All
          </motion.div>
        )}
      </motion.div>
      
      <div className="relative group">
        <motion.div 
          ref={carouselRef}
          className={`flex ${isMobile ? 'gap-3 pl-4' : 'gap-4'} overflow-x-auto pb-4 scrollbar-hide scroll-smooth`}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          variants={staggeredFadeIn}
          initial="hidden"
          animate="visible"
        >
          {items.map((item) => (
            <motion.div
              key={item.id}
              variants={staggeredItem}
              initial="hidden"
              animate="visible"
              layout
            >
              <VideoCard 
                content={item} 
                aspect={aspect}
                showProgress={showProgress && item.progress !== undefined}
                progress={item.progress}
                onAddToWatchlist={onAddToWatchlist}
              />
            </motion.div>
          ))}
        </motion.div>
        
        {/* Only show navigation buttons on desktop or if explicitly on tablet+ */}
        {!isMobile && items.length > 3 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-background/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => scroll("left")}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-background/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => scroll("right")}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </>
        )}
        
        {/* Mobile navigation indicators - show small dots at bottom */}
        {isMobile && items.length > 3 && (
          <div className="flex justify-center mt-2 space-x-1">
            <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
            {[...Array(Math.min(4, Math.ceil(items.length / 2) - 1))].map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-gray-500"></div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ContentCarousel;