import { useState } from "react";
import { useLocation } from "wouter";
import { ContentItem } from "@shared/types";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { Play } from "lucide-react";
import AuthModal from "../auth/AuthModal";
import { calculateProgress } from "@/lib/utils";
import { getImageUrl } from "@/lib/supabase";

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
      <div 
        className={`movie-card flex-shrink-0 ${
          isMobile 
            ? aspect === "video" ? "w-44" : "w-40" 
            : aspect === "video" ? "w-64" : "w-60"
        } relative group cursor-pointer`}
        onClick={handleCardClick}
      >
        <div className={`relative overflow-hidden rounded-lg ${
          aspect === "video" ? "aspect-video" : "aspect-[2/3]"
        } bg-muted shadow-lg`}>
          <img 
            src={getImageUrl(content.thumbnailUrl) || '/images/madifa_logo.jpg'} 
            alt={content.title} 
            className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = '/images/madifa_logo.jpg';
            }}
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
            <Badge className={`bg-gray-800/80 text-white ${isMobile ? "text-[10px] px-1 py-0.5" : "text-xs px-1.5 py-0.5"} rounded`}>
              {content.contentType === 'music_video' ? 'MUSIC' : 
               content.contentType === 'series' ? 'SERIES' : 
               content.contentType === 'trailer' ? 'TRAILER' : 'MOVIE'}
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
          
          <div className={`absolute bottom-0 left-0 right-0 ${isMobile ? "p-2" : "p-4"} bg-gradient-to-t from-black/80 to-transparent`}>
            <div className="flex justify-between items-end">
              <div className={isMobile ? "max-w-[70%]" : ""}>
                <h3 className={`text-white font-medium ${isMobile ? "text-xs line-clamp-1" : "text-sm"}`}>
                  {content.title}
                </h3>
              </div>
              <div 
                className={`bg-primary/90 rounded-full ${isMobile ? "p-1" : "p-1.5"} cursor-pointer hover:bg-primary transition`}
                onClick={handlePlayClick}
                data-click-handled="true"
              >
                <Play className={isMobile ? "h-4 w-4 text-white" : "h-6 w-6 text-white"} />
              </div>
            </div>
            
            {showProgress && progress > 0 && (
              <div className="w-full bg-gray-600 h-1 mt-1 rounded-full overflow-hidden">
                <div 
                  className="bg-primary h-full rounded-full" 
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            )}
          </div>
          
          {aspect === "poster" && !isMobile && (
            <div className="card-overlay opacity-0 absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent transition duration-300 flex flex-col justify-end p-4 group-hover:opacity-100">
              <h3 className="text-white font-medium">{content.title}</h3>
              <p className="text-muted-foreground text-sm">
                {content.releaseYear} • {content.category} • {content.duration ? Math.floor(content.duration / 60) : '?'}m
              </p>
              <div className="flex space-x-2 mt-2">
                <button 
                  className="bg-white text-background rounded-full p-2 hover:bg-primary hover:text-white transition"
                  onClick={handlePlayClick}
                  data-click-handled="true"
                >
                  <Play className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        initialView={user ? "login" : "register"}
      />
    </>
  );
};

export default VideoCard;
