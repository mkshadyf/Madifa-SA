import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ContentItem } from "@shared/types";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { Play, Plus, Info, ChevronDown } from "lucide-react";
import AuthModal from "../auth/AuthModal";

interface HeroSectionProps {
  content: ContentItem;
  onAddToWatchlist?: (contentId: number) => void;
}

const HeroSection = ({ content, onAddToWatchlist }: HeroSectionProps) => {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [truncateDescription, setTruncateDescription] = useState(true);
  const [showFullDescription, setShowFullDescription] = useState(false);
  
  // Determine if we should truncate the description based on screen size
  useEffect(() => {
    const handleResize = () => {
      setTruncateDescription(window.innerWidth < 768);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  if (!content) return null;
  
  const handleWatchNow = () => {
    if (content.isPremium && (!user || !user.isPremium)) {
      setShowAuthModal(true);
      return;
    }
    navigate(`/movie/${content.id}`);
  };
  
  const handleAddToList = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    if (onAddToWatchlist) {
      onAddToWatchlist(content.id);
    }
  };

  return (
    <>
      <div className="relative">
        <div className="w-full h-[70vh] relative overflow-hidden">
          <img 
            src={content.thumbnailUrl}
            alt={content.title} 
            className="w-full h-full object-cover"
          />
          {/* Reduce opacity of gradient overlays to make the image more visible */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent/10"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/30 to-transparent/10"></div>
          
          <div className="absolute bottom-0 left-0 p-6 md:p-16 w-full md:w-1/2">
            <div className="flex items-center space-x-2 mb-4">
              {/* Content type badge */}
              <Badge className="bg-gray-800 text-white text-xs md:text-sm">
                {content.contentType === 'music_video' ? 'MUSIC VIDEO' : 
                 content.contentType === 'series' ? 'SERIES' : 
                 content.contentType === 'trailer' ? 'TRAILER' : 'MOVIE'}
              </Badge>
              
              {/* Premium badge */}
              {content.isPremium && (
                <Badge className="bg-primary text-white text-xs md:text-sm">PREMIUM</Badge>
              )}
              
              {/* Year */}
              <span className="text-foreground text-xs md:text-sm">{content.releaseYear}</span>
              
              {/* Rating */}
              {content.rating && (
                <span className="text-foreground border border-muted-foreground px-1 py-0.5 rounded text-xs">
                  {content.rating}
                </span>
              )}
            </div>
            
            <h1 className="text-3xl md:text-5xl font-bold mb-2 text-foreground">{content.title}</h1>
            
            {/* Mobile-friendly description with toggle */}
            {isMobile ? (
              <div className="relative mb-4">
                <p className={`text-foreground text-sm mb-1 ${!showFullDescription ? 'line-clamp-2' : ''}`}>
                  {content.description}
                </p>
                <button 
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="text-primary text-xs flex items-center"
                >
                  {showFullDescription ? 'Show Less' : 'Show More'}
                  <ChevronDown className={`h-3 w-3 ml-1 transition-transform ${showFullDescription ? 'rotate-180' : ''}`} />
                </button>
              </div>
            ) : (
              <p className="text-foreground text-base mb-4">{content.description}</p>
            )}
            
            {/* Mobile-optimized button layout */}
            <div className={`flex ${isMobile ? 'justify-between w-full' : 'flex-wrap gap-3'}`}>
              <Button 
                className={`bg-orange-600 hover:bg-orange-700 text-white ${isMobile ? 'flex-1 mr-2' : ''}`} 
                size={isMobile ? "sm" : "default"}
                onClick={handleWatchNow}
              >
                <Play className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} mr-1`} />
                Watch
              </Button>
              
              <Button 
                variant="secondary"
                size={isMobile ? "sm" : "default"}
                className={isMobile ? 'flex-1 mr-2' : ''}
                onClick={handleAddToList}
              >
                <Plus className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} mr-1`} />
                My List
              </Button>
              
              <Button 
                variant="secondary" 
                size="icon"
                className={isMobile ? 'h-9 w-9' : ''}
                onClick={() => navigate(`/movie/${content.id}`)}
              >
                <Info className={isMobile ? 'h-4 w-4' : 'h-5 w-5'} />
              </Button>
            </div>
          </div>
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

export default HeroSection;
