import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ContentItem } from "@shared/types";
import { useAuth } from "@/contexts/AuthContext";
import { useDataSource } from "@/contexts/DataSourceContext";
import { useToast } from "@/hooks/use-toast";
import { useCaptions } from "@/hooks/useCaptions";
import { useSync } from "@/hooks/useSync";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePerformanceContext } from "@/contexts/PerformanceContext";
import { formatDuration, parseVideoUrl } from "@/lib/utils";
import { isAppInstalled } from "@/lib/serviceWorkerRegistration";
import { 
  Play, Pause, Volume2, VolumeX, Maximize, Minimize, 
  SkipForward, SkipBack, Settings, Loader, Subtitles 
} from "lucide-react";
import AuthModal from "../auth/AuthModal";
import CaptionTrackSelector from "./CaptionTrackSelector";
import MobileVideoPlayer from "./MobileVideoPlayer";
import OptimizedVideoPlayer from "./OptimizedVideoPlayer";
import { insertAdsByGoogle } from "@/lib/helpers";

interface VideoPlayerProps {
  content: ContentItem;
  autoPlay?: boolean;
  onProgressUpdate?: (progress: number) => void;
  onVideoComplete?: () => void;
}

const VideoPlayer = ({ content, autoPlay = false, onProgressUpdate, onVideoComplete }: VideoPlayerProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { dataSource } = useDataSource();
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsTimerRef = useRef<NodeJS.Timeout>();
  const syncTimerRef = useRef<NodeJS.Timeout>();
  const lastProgressUpdateRef = useRef<number>(0);
  
  // Sync functionality
  const { getProgress, updateProgress, deviceId, isOnNewDevice } = useSync();
  
  // Caption handling
  const { captions, selectedTrack, selectTrack, isLoading: captionsLoading } = useCaptions(content?.id);
  
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isLoading, setIsLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [adShowing, setAdShowing] = useState(false);
  
  // Load saved watch progress when component mounts
  useEffect(() => {
    if (!content || !content.id || !user) return;
    
    const loadSavedProgress = async () => {
      try {
        const savedProgress = await getProgress(content.id);
        
        if (savedProgress > 0) {
          // If watched more than 95%, start from beginning
          if (savedProgress >= 95) return;
          
          // If on a new device, ask if user wants to continue
          if (isOnNewDevice) {
            const shouldContinue = window.confirm(
              `You've watched ${savedProgress}% of this video on another device. Would you like to continue from where you left off?`
            );
            
            if (shouldContinue && videoRef.current) {
              // Calculate time position from percentage if duration is available
              if (duration) {
                videoRef.current.currentTime = (savedProgress / 100) * duration;
              }
            }
          } else if (videoRef.current) {
            // On same device, just continue
            if (duration) {
              videoRef.current.currentTime = (savedProgress / 100) * duration;
            }
          }
        }
      } catch (error) {
        console.error("Failed to load watch progress:", error);
      }
    };
    
    loadSavedProgress();
  }, [content, user, duration, isOnNewDevice]);

  // Set up progress sync
  useEffect(() => {
    if (!content || !content.id || !user) return;
    
    // Clear any existing sync interval
    if (syncTimerRef.current) {
      clearInterval(syncTimerRef.current);
    }
    
    // Set up interval to sync progress periodically
    syncTimerRef.current = setInterval(() => {
      const video = videoRef.current;
      if (!video || adShowing) return;
      
      // Only update if there's significant progress change (>5 seconds)
      const currentProgress = Math.floor(video.currentTime);
      if (Math.abs(currentProgress - lastProgressUpdateRef.current) > 5) {
        // Calculate percentage through the video
        const progressPercent = Math.floor((video.currentTime / video.duration) * 100);
        updateProgress(content.id, progressPercent);
        lastProgressUpdateRef.current = currentProgress;
      }
    }, 10000); // Sync every 10 seconds
    
    return () => {
      if (syncTimerRef.current) {
        clearInterval(syncTimerRef.current);
      }
    };
  }, [content, user, adShowing]);

  useEffect(() => {
    if (!content) return;
    
    // If user is not premium and content is premium, show trailer only
    if (content.isPremium && (!user || !user.isPremium)) {
      setVideoUrl(content.trailerUrl || '');
      
      toast({
        title: "Premium Content",
        description: "You're watching the trailer. Subscribe to watch the full content.",
        duration: 5000,
      });
      
      // Add a slight delay before showing the subscription modal
      const timer = setTimeout(() => {
        setShowAuthModal(true);
      }, 8000);
      
      return () => clearTimeout(timer);
    } else {
      setVideoUrl(content.videoUrl || '');
      
      // Show ads for free content if user is not premium
      if (!content.isPremium && (!user || !user.isPremium)) {
        // Check if we're in a mobile app context with potentially stricter ad policies
        const isInMobileApp = isAppInstalled();
        if (!isInMobileApp) {
          // Only show ads in browser context, not when installed as PWA
          showPrerollAd();
        }
      }
    }
  }, [content, user, toast]);
  
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (onProgressUpdate && !adShowing) {
        onProgressUpdate(Math.floor(video.currentTime));
      }
    };
    
    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setIsLoading(false);
      if (autoPlay) {
        video.play().catch(error => {
          console.error("Autoplay failed:", error);
          setIsPlaying(false);
        });
      }
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
      if (onVideoComplete) {
        onVideoComplete();
      }
      
      // If not premium content or user is premium, we're done
      if (!content.isPremium || (user && user.isPremium)) return;
      
      // For free users viewing free content, show post-roll ad
      if (!adShowing && !content.isPremium) {
        showPostrollAd();
      }
    };
    
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);
    
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
    };
  }, [content, videoRef.current, adShowing]);
  
  // Hide controls after inactivity
  useEffect(() => {
    if (!showControls) return;
    
    controlsTimerRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
    
    return () => {
      if (controlsTimerRef.current) {
        clearTimeout(controlsTimerRef.current);
      }
    };
  }, [showControls, isPlaying]);
  
  const showPrerollAd = () => {
    setAdShowing(true);
    insertAdsByGoogle();
    
    // Simulate ad duration
    setTimeout(() => {
      setAdShowing(false);
    }, 5000);
  };
  
  const showPostrollAd = () => {
    setAdShowing(true);
    insertAdsByGoogle();
    
    // Simulate ad duration
    setTimeout(() => {
      setAdShowing(false);
    }, 5000);
  };
  
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (content.isPremium && (!user || !user.isPremium)) {
      // If trying to watch premium content as a free user
      setShowAuthModal(true);
      return;
    }
    
    if (isPlaying) {
      video.pause();
    } else {
      video.play().catch(error => {
        console.error("Play failed:", error);
      });
    }
    
    setIsPlaying(!isPlaying);
  };
  
  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    
    setIsMuted(!isMuted);
    video.muted = !isMuted;
  };
  
  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;
    
    const newVolume = value[0];
    setVolume(newVolume);
    video.volume = newVolume;
    
    if (newVolume === 0) {
      setIsMuted(true);
      video.muted = true;
    } else if (isMuted) {
      setIsMuted(false);
      video.muted = false;
    }
  };
  
  const handleSeek = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;
    
    const seekTime = (value[0] / 100) * duration;
    video.currentTime = seekTime;
    setCurrentTime(seekTime);
  };
  
  const toggleFullScreen = () => {
    if (!playerContainerRef.current) return;
    
    if (!isFullScreen) {
      if (playerContainerRef.current.requestFullscreen) {
        playerContainerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };
  
  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
    };
  }, []);
  
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!videoRef.current) return;
      
      // Only handle keyboard events when the video player is in focus
      if (!playerContainerRef.current?.contains(document.activeElement)) return;
      
      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'f':
          e.preventDefault();
          toggleFullScreen();
          break;
        case 'arrowright':
          e.preventDefault();
          videoRef.current.currentTime += 10;
          break;
        case 'arrowleft':
          e.preventDefault();
          videoRef.current.currentTime -= 10;
          break;
        case 'arrowup':
          e.preventDefault();
          handleVolumeChange([Math.min(volume + 0.1, 1)]);
          break;
        case 'arrowdown':
          e.preventDefault();
          handleVolumeChange([Math.max(volume - 0.1, 0)]);
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPlaying, isMuted, volume]);
  
  // Parse video URL to determine how to embed
  const embedVideo = () => {
    if (!videoUrl) return null;
    
    const parsedVideo = parseVideoUrl(videoUrl);
    
    if (!parsedVideo) {
      // Direct video file
      return (
        <video
          ref={videoRef}
          className="w-full h-full"
          preload="metadata"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          crossOrigin="anonymous" // Required for external caption files
        >
          <source src={videoUrl} type="video/mp4" />
          
          {/* Add captions/subtitles when available */}
          {selectedTrack && (
            <track 
              kind="subtitles" 
              src={selectedTrack.fileUrl} 
              srcLang={selectedTrack.language} 
              label={selectedTrack.label}
              default={selectedTrack.isDefault}
            />
          )}
          
          Your browser does not support the video tag.
        </video>
      );
    }
    
    // For embedded videos (YouTube, Vimeo, Dailymotion)
    // Note: Captions for embedded videos are managed by their respective platforms
    switch (parsedVideo.provider) {
      case 'youtube':
        return (
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${parsedVideo.id}?autoplay=${autoPlay ? 1 : 0}&modestbranding=1&rel=0&cc_load_policy=${selectedTrack ? 1 : 0}`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        );
      case 'vimeo':
        return (
          <iframe
            className="w-full h-full"
            src={`https://player.vimeo.com/video/${parsedVideo.id}?autoplay=${autoPlay ? 1 : 0}&controls=0&transparent=1&background=1&title=0&byline=0&portrait=0`}
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          ></iframe>
        );
      case 'dailymotion':
        return (
          <iframe
            className="w-full h-full"
            src={`https://www.dailymotion.com/embed/video/${parsedVideo.id}?autoplay=${autoPlay ? 1 : 0}`}
            frameBorder="0"
            allow="autoplay; fullscreen"
            allowFullScreen
          ></iframe>
        );
      default:
        return (
          <video
            ref={videoRef}
            className="w-full h-full"
            preload="metadata"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            crossOrigin="anonymous"
          >
            <source src={videoUrl} type="video/mp4" />
            
            {/* Add captions/subtitles when available */}
            {selectedTrack && (
              <track 
                kind="subtitles" 
                src={selectedTrack.fileUrl} 
                srcLang={selectedTrack.language} 
                label={selectedTrack.label}
                default={selectedTrack.isDefault}
              />
            )}
            
            Your browser does not support the video tag.
          </video>
        );
    }
  };
  
  // Use mobile-friendly player on small screens
  const isMobile = useIsMobile();
  const { lightweight } = usePerformanceContext();
  
  if (!content) return null;
  
  // Use optimized video player for mobile with lightweight mode enabled
  if (isMobile && lightweight) {
    return (
      <OptimizedVideoPlayer
        content={content}
        autoPlay={autoPlay}
        onProgressUpdate={onProgressUpdate}
        onVideoComplete={onVideoComplete}
      />
    );
  }
  
  // Use regular mobile player for non-lightweight mode on mobile
  if (isMobile) {
    return (
      <MobileVideoPlayer
        content={content}
        autoPlay={autoPlay}
        onProgressUpdate={onProgressUpdate}
        onVideoComplete={onVideoComplete}
      />
    );
  }
  
  return (
    <>
      <div 
        ref={playerContainerRef}
        className="relative w-full aspect-video bg-black"
        onMouseMove={() => {
          setShowControls(true);
          if (controlsTimerRef.current) {
            clearTimeout(controlsTimerRef.current);
          }
        }}
        onMouseLeave={() => {
          if (isPlaying) {
            setShowControls(false);
          }
        }}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <Loader className="h-12 w-12 text-primary animate-spin" />
          </div>
        )}
        
        {adShowing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/90 z-20">
            <p className="text-lg font-medium mb-2">Advertisement</p>
            <div className="w-full max-w-md h-60 bg-muted flex items-center justify-center">
              <div className="adsbygoogle" style={{ display: 'block', width: '100%', height: '100%' }}></div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">Your video will resume shortly...</p>
          </div>
        )}
        
        {embedVideo()}
        
        {/* Video Controls */}
        {showControls && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 z-10">
            <div className="absolute top-4 left-4">
              <h2 className="text-white text-lg font-bold">{content.title}</h2>
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col space-y-2">
              {/* Progress bar */}
              <div className="flex items-center space-x-2">
                <span className="text-white text-sm">{formatDuration(currentTime)}</span>
                <Slider
                  value={[isNaN(duration) || duration === 0 ? 0 : (currentTime / duration) * 100]}
                  onValueChange={handleSeek}
                  className="flex-1"
                />
                <span className="text-white text-sm">{formatDuration(duration)}</span>
              </div>
              
              {/* Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="icon" onClick={togglePlay} className="text-white hover:bg-white/20">
                    {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                  </Button>
                  
                  <Button variant="ghost" size="icon" onClick={() => {
                    if (videoRef.current) videoRef.current.currentTime -= 10;
                  }} className="text-white hover:bg-white/20">
                    <SkipBack className="h-5 w-5" />
                  </Button>
                  
                  <Button variant="ghost" size="icon" onClick={() => {
                    if (videoRef.current) videoRef.current.currentTime += 10;
                  }} className="text-white hover:bg-white/20">
                    <SkipForward className="h-5 w-5" />
                  </Button>
                  
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon" onClick={toggleMute} className="text-white hover:bg-white/20">
                      {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                    </Button>
                    <div className="w-20 hidden sm:block">
                      <Slider
                        value={[isMuted ? 0 : volume]}
                        min={0}
                        max={1}
                        step={0.01}
                        onValueChange={handleVolumeChange}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {/* Caption selector */}
                  {captions.length > 0 && (
                    <CaptionTrackSelector
                      tracks={captions}
                      selectedTrack={selectedTrack}
                      onSelectTrack={selectTrack}
                    />
                  )}
                  
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                    <Settings className="h-5 w-5" />
                  </Button>
                  
                  <Button variant="ghost" size="icon" onClick={toggleFullScreen} className="text-white hover:bg-white/20">
                    {isFullScreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        initialView={user ? "login" : "register"}
      />
    </>
  );
};

export default VideoPlayer;
