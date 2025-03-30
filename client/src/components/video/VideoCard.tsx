import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { ContentItem } from "@shared/types";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { Play } from "lucide-react";
import AuthModal from "../auth/AuthModal";
import { calculateProgress } from "@/lib/utils";
import { getImageUrl } from "@/lib/supabase";
import { ContentTypeIcon, getContentTypeLabel } from "../icons/ContentTypeIcons";
import { motion } from "framer-motion";
import { scaleOnHoverVariants } from "@/lib/animations";

interface VideoCardProps {
  content: ContentItem;
  aspect?: "video" | "poster";
  showProgress?: boolean;
  progress?: number;
  showRanking?: boolean;
  ranking?: number;
  onAddToWatchlist?: (contentId: number) => void;
}

const VideoCard = ({ 
  content, 
  aspect = "video", 
  showProgress = false,
  progress = 0,
  showRanking = false,
  ranking,
  onAddToWatchlist 
}: VideoCardProps) => {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  if (!content) return null;
  
  const handleCardClick = (e: React.MouseEvent) => {
    // Make sure we're not clicking on a child element that has its own click handler
    if ((e.target as HTMLElement).closest('[data-click-handled]')) {
      return;
    }
    navigate(`/movie/${content.id}`);
  };
  
  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (content.isPremium && (!user || !user.isPremium)) {
      setShowAuthModal(true);
      return;
    }
    
    navigate(`/movie/${content.id}?autoplay=true`);
  };
  
  const progressPercentage = calculateProgress(progress, content.duration || 100);
  
  return (
    <>
      <motion.div 
        className={`movie-card flex-shrink-0 ${
          isMobile 
            ? aspect === "video" ? "w-44" : "w-40" 
            : aspect === "video" ? "w-64" : "w-60"
        } relative cursor-pointer`}
        onClick={handleCardClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        variants={scaleOnHoverVariants}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
      >
        <motion.div 
          className={`relative overflow-hidden rounded-lg ${
            aspect === "video" ? "aspect-video" : "aspect-[2/3]"
          } bg-muted shadow-lg`}
          layoutId={`card-container-${content.id}`}
        >
          <motion.img 
            src={getImageUrl(content.thumbnailUrl) || '/images/madifa_logo.jpg'} 
            alt={content.title} 
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = '/images/madifa_logo.jpg';
            }}
            animate={{ scale: isHovered ? 1.05 : 1 }}
            transition={{ duration: 0.3 }}
          />
          
          {showRanking && (
            <div className={`absolute top-2 left-2 flex items-center justify-center bg-black/60 rounded-full ${
              isMobile ? "w-6 h-6 text-xs" : "w-8 h-8 text-sm"
            } font-bold text-white`}>
              {ranking}
            </div>
          )}
          
          {/* Show content type badge in top-left */}
          <div className="absolute top-2 left-2">
            <Badge className={`bg-gray-800/80 text-white ${isMobile ? "text-[10px] px-1 py-0.5" : "text-xs px-1.5 py-0.5"} rounded flex items-center gap-1`}>
              <ContentTypeIcon 
                type={(content.contentType || "movie") as any} 
                size={isMobile ? 10 : 14} 
                className="text-white" 
              />
              {getContentTypeLabel(content.contentType || "movie")}
            </Badge>
          </div>

          {/* Premium badge in top-right */}
          {content.isPremium && (
            <div className="absolute top-2 right-2">
              <Badge className={`bg-primary text-white ${isMobile ? "text-[10px] px-1 py-0.5" : "text-xs px-1.5 py-0.5"} rounded`}>
                PREMIUM
              </Badge>
            </div>
          )}
          
          {/* Free badge with ads indicator */}
          {!content.isPremium && (
            <div className="absolute top-2 right-2 flex space-x-1">
              {!isMobile && (
                <Badge className="bg-muted-foreground text-white text-xs px-1.5 py-0.5 rounded">FREE</Badge>
              )}
              <Badge className={`bg-red-500 text-white ${isMobile ? "text-[10px] px-1 py-0.5" : "text-xs px-1.5 py-0.5"} rounded`}>
                ADS
              </Badge>
            </div>
          )}
          
          <motion.div 
            className={`absolute bottom-0 left-0 right-0 ${isMobile ? "p-2" : "p-4"} bg-gradient-to-t from-black/80 to-transparent`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.2 }}
          >
            <div className="flex justify-between items-end">
              <div className={isMobile ? "max-w-[70%]" : ""}>
                <h3 className={`text-white font-medium ${isMobile ? "text-xs line-clamp-1" : "text-sm"}`}>
                  {content.title}
                </h3>
              </div>
              <motion.div 
                className={`bg-primary/90 rounded-full ${isMobile ? "p-1" : "p-1.5"} cursor-pointer hover:bg-primary`}
                onClick={handlePlayClick}
                data-click-handled="true"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Play className={isMobile ? "h-4 w-4 text-white" : "h-6 w-6 text-white"} />
              </motion.div>
            </div>
            
            {showProgress && progress > 0 && (
              <motion.div 
                className="w-full bg-gray-600 h-1 mt-1 rounded-full overflow-hidden"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <motion.div 
                  className="bg-primary h-full rounded-full" 
                  style={{ width: `${progressPercentage}%` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                />
              </motion.div>
            )}
          </motion.div>
          
          {aspect === "poster" && !isMobile && (
            <motion.div 
              className="card-overlay absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col justify-end p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <motion.h3 
                className="text-white font-medium"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: isHovered ? 0 : 10, opacity: isHovered ? 1 : 0 }}
                transition={{ duration: 0.2 }}
              >
                {content.title}
              </motion.h3>
              <motion.div 
                className="flex items-center gap-2 mt-1"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: isHovered ? 0 : 10, opacity: isHovered ? 1 : 0 }}
                transition={{ duration: 0.2, delay: 0.05 }}
              >
                <ContentTypeIcon 
                  type={(content.contentType || "movie") as any} 
                  size={14}
                  className="text-white opacity-80" 
                />
                <p className="text-muted-foreground text-sm">
                  {content.releaseYear} • {content.category} • {content.duration ? Math.floor(content.duration / 60) : '?'}m
                </p>
              </motion.div>
              <motion.div 
                className="flex space-x-2 mt-2"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: isHovered ? 0 : 10, opacity: isHovered ? 1 : 0 }}
                transition={{ duration: 0.2, delay: 0.1 }}
              >
                <motion.button 
                  className="bg-white text-background rounded-full p-2 hover:bg-primary hover:text-white"
                  onClick={handlePlayClick}
                  data-click-handled="true"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Play className="h-5 w-5" />
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
      
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        initialView={user ? "login" : "register"}
      />
    </>
  );
};

export default VideoCard;