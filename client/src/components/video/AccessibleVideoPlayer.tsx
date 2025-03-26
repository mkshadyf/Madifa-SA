import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ContentItem } from "@shared/types";
import { useAuth } from "@/contexts/AuthContext";
import { useDataSource } from "@/contexts/DataSourceContext";
import { useToast } from "@/hooks/use-toast";
import { useCaptions } from "@/hooks/useCaptions";
import { useSync } from "@/hooks/useSync";
import { usePerformanceContext } from "@/contexts/PerformanceContext";
import { formatDuration } from "@/lib/utils";
import { 
  Play, Pause, Volume2, VolumeX, Maximize, Minimize, 
  SkipForward, SkipBack, Subtitles, Settings, Loader
} from "lucide-react";
import AuthModal from "../auth/AuthModal";
import CaptionTrackSelector from "./CaptionTrackSelector";

// Keyboard shortcuts mapping
const KEYBOARD_SHORTCUTS = {
  PLAY_PAUSE: [' ', 'k'],
  MUTE: ['m'],
  FULLSCREEN: ['f'],
  FORWARD: ['ArrowRight', 'l'],
  BACKWARD: ['ArrowLeft', 'j'],
  VOLUME_UP: ['ArrowUp'],
  VOLUME_DOWN: ['ArrowDown'],
  CAPTIONS: ['c'],
};

interface AccessibleVideoPlayerProps {
  content: ContentItem;
  autoPlay?: boolean;
  onProgressUpdate?: (progress: number) => void;
  onVideoComplete?: () => void;
}

const AccessibleVideoPlayer: React.FC<AccessibleVideoPlayerProps> = ({ 
  content, 
  autoPlay = false, 
  onProgressUpdate, 
  onVideoComplete 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { dataSource } = useDataSource();
  const { lightweight, videoQuality, optimizeImageUrl } = usePerformanceContext();
  
  // Refs
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const captionsContainerRef = useRef<HTMLDivElement>(null);
  const controlsTimerRef = useRef<NodeJS.Timeout>();
  const syncTimerRef = useRef<NodeJS.Timeout>();
  const lastProgressUpdateRef = useRef<number>(0);
  
  // Caption handling with advanced features
  const { 
    captions, 
    selectedTrack, 
    selectTrack, 
    isLoading: captionsLoading,
    stylePreferences,
    updateCaptionStyle,
    resetCaptionStyles,
    showCaptions,
    toggleCaptions,
    captionStyles
  } = useCaptions(content?.id);
  
  // Sync functionality
  const { getProgress, updateProgress, deviceId, isOnNewDevice } = useSync();
  
  // Player state
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isLoading, setIsLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(1); // Store previous volume for unmute
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  
  // Load saved watch progress when component mounts
  useEffect(() => {
    if (!content || !content.id || !user) return;
    
    const loadSavedProgress = async () => {
      try {
        const progress = await getProgress(content.id);
        if (videoRef.current && progress > 0) {
          const targetTime = (progress / 100) * (videoRef.current.duration || 0);
          
          // Only seek if the saved progress is more than 0 and less than 98%
          if (targetTime > 0 && progress < 98) {
            videoRef.current.currentTime = targetTime;
            setCurrentTime(targetTime);
            
            // Show a toast if resuming from another device
            if (isOnNewDevice) {
              toast({
                title: "Resuming playback",
                description: `Continuing from ${formatDuration(targetTime)} (synced from another device)`
              });
            }
          }
        }
      } catch (error) {
        console.error("Error loading saved progress:", error);
      }
    };
    
    loadSavedProgress();
  }, [content, user, getProgress, isOnNewDevice, toast]);
  
  // Set video URL and reset player when content changes
  useEffect(() => {
    if (!content) return;
    
    // Use trailUrl for free content or videoUrl for premium content if user has premium access
    const url = (!content.isPremium || (user && user.isPremium)) 
      ? content.videoUrl 
      : content.trailerUrl;
    
    setVideoUrl(url);
    setCurrentTime(0);
    setIsLoading(true);
    
    // Reset player state
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      if (autoPlay) {
        videoRef.current.play().catch(() => {
          // Autoplay was prevented
          setIsPlaying(false);
        });
      }
    }
  }, [content, user, autoPlay]);
  
  // Handle auto-hide controls
  useEffect(() => {
    if (isPlaying && showControls) {
      controlsTimerRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
    
    return () => {
      if (controlsTimerRef.current) {
        clearTimeout(controlsTimerRef.current);
      }
    };
  }, [isPlaying, showControls]);
  
  // Set up periodic progress sync
  useEffect(() => {
    if (!content?.id || !user) return;
    
    // Update progress every 5 seconds while playing
    if (isPlaying && currentTime > 0 && duration > 0) {
      syncTimerRef.current = setInterval(() => {
        const progressPercent = Math.floor((currentTime / duration) * 100);
        
        // Only update if the progress changed by at least 1%
        if (Math.abs(progressPercent - lastProgressUpdateRef.current) >= 1) {
          updateProgress(content.id, progressPercent);
          
          if (onProgressUpdate) {
            onProgressUpdate(progressPercent);
          }
          
          lastProgressUpdateRef.current = progressPercent;
        }
      }, 5000);
    }
    
    return () => {
      if (syncTimerRef.current) {
        clearInterval(syncTimerRef.current);
      }
    };
  }, [isPlaying, currentTime, duration, content, user, updateProgress, onProgressUpdate]);
  
  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullScreen(Boolean(document.fullscreenElement));
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);
  
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle keyboard shortcuts if an input is focused
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      
      // Play/Pause
      if (KEYBOARD_SHORTCUTS.PLAY_PAUSE.includes(e.key)) {
        e.preventDefault();
        togglePlayPause();
      }
      
      // Mute/Unmute
      if (KEYBOARD_SHORTCUTS.MUTE.includes(e.key)) {
        e.preventDefault();
        toggleMute();
      }
      
      // Fullscreen
      if (KEYBOARD_SHORTCUTS.FULLSCREEN.includes(e.key)) {
        e.preventDefault();
        toggleFullScreen();
      }
      
      // Forward 10s
      if (KEYBOARD_SHORTCUTS.FORWARD.includes(e.key)) {
        e.preventDefault();
        seekForward();
      }
      
      // Backward 10s
      if (KEYBOARD_SHORTCUTS.BACKWARD.includes(e.key)) {
        e.preventDefault();
        seekBackward();
      }
      
      // Volume Up
      if (KEYBOARD_SHORTCUTS.VOLUME_UP.includes(e.key)) {
        e.preventDefault();
        setVolume(prev => Math.min(prev + 0.1, 1));
        if (videoRef.current) {
          videoRef.current.volume = Math.min(videoRef.current.volume + 0.1, 1);
        }
      }
      
      // Volume Down
      if (KEYBOARD_SHORTCUTS.VOLUME_DOWN.includes(e.key)) {
        e.preventDefault();
        setVolume(prev => Math.max(prev - 0.1, 0));
        if (videoRef.current) {
          videoRef.current.volume = Math.max(videoRef.current.volume - 0.1, 0);
        }
      }
      
      // Toggle captions
      if (KEYBOARD_SHORTCUTS.CAPTIONS.includes(e.key)) {
        e.preventDefault();
        toggleCaptions();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [toggleCaptions]);
  
  // Toggle play/pause
  const togglePlayPause = useCallback(() => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      // Check if premium content is being played by non-premium user
      if (content.isPremium && (!user || !user.isPremium)) {
        setShowAuthModal(true);
        return;
      }
      
      videoRef.current.play().catch(err => {
        console.error("Error playing video:", err);
        toast({
          title: "Playback Error",
          description: "There was an error playing this video. Please try again.",
          variant: "destructive"
        });
      });
    }
    
    setIsPlaying(!isPlaying);
    setShowControls(true);
  }, [isPlaying, content, user, toast]);
  
  // Toggle mute
  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    
    if (isMuted) {
      videoRef.current.volume = prevVolume;
      setVolume(prevVolume);
    } else {
      setPrevVolume(volume);
      videoRef.current.volume = 0;
      setVolume(0);
    }
    
    setIsMuted(!isMuted);
    setShowControls(true);
  }, [isMuted, volume, prevVolume]);
  
  // Handle volume change
  const handleVolumeChange = useCallback((values: number[]) => {
    if (!videoRef.current) return;
    
    const newVolume = values[0];
    videoRef.current.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    
    if (newVolume > 0) {
      setPrevVolume(newVolume);
    }
    
    setShowControls(true);
  }, []);
  
  // Handle seek
  const handleSeek = useCallback((values: number[]) => {
    if (!videoRef.current || !duration) return;
    
    const newTime = values[0];
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    setShowControls(true);
  }, [duration]);
  
  // Seek forward 10s
  const seekForward = useCallback(() => {
    if (!videoRef.current) return;
    
    const newTime = Math.min(videoRef.current.currentTime + 10, duration);
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    setShowControls(true);
  }, [duration]);
  
  // Seek backward 10s
  const seekBackward = useCallback(() => {
    if (!videoRef.current) return;
    
    const newTime = Math.max(videoRef.current.currentTime - 10, 0);
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    setShowControls(true);
  }, []);
  
  // Toggle fullscreen
  const toggleFullScreen = useCallback(() => {
    if (!playerContainerRef.current) return;
    
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen:`, err);
      });
    } else {
      document.exitFullscreen();
    }
    
    setShowControls(true);
  }, []);
  
  // Handle time update
  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current) return;
    
    setCurrentTime(videoRef.current.currentTime);
    
    // Update captions positioning
    if (captionsContainerRef.current && selectedTrack) {
      // Additional caption positioning logic can be added here if needed
    }
  }, [selectedTrack]);
  
  // Handle video ended
  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    setShowControls(true);
    
    // Mark as complete if played > 90%
    if (Math.floor((currentTime / duration) * 100) > 90) {
      if (onVideoComplete) {
        onVideoComplete();
      }
      
      // Update progress to 100%
      if (content?.id && user) {
        updateProgress(content.id, 100);
      }
    }
  }, [currentTime, duration, onVideoComplete, content, user, updateProgress]);
  
  // Handle speed change
  const handleSpeedChange = useCallback((speed: number) => {
    if (!videoRef.current) return;
    
    videoRef.current.playbackRate = speed;
    setPlaybackRate(speed);
    setShowSettingsMenu(false);
  }, []);
  
  // Render caption text
  const renderCaptions = () => {
    if (!showCaptions || !selectedTrack) return null;
    
    return (
      <div 
        ref={captionsContainerRef}
        className="absolute left-0 right-0 z-10 flex justify-center pointer-events-none"
        style={{
          [stylePreferences.position]: `${stylePreferences.verticalOffset}%`,
          bottom: stylePreferences.position === 'bottom' ? `${stylePreferences.verticalOffset}%` : 'auto',
          top: stylePreferences.position === 'top' ? `${stylePreferences.verticalOffset}%` : 'auto',
        }}
      >
        {/* Captions will be injected here by the video's textTrack */}
        <div 
          id="caption-text" 
          className="px-4 py-2 text-center"
          style={captionStyles}
        ></div>
      </div>
    );
  };
  
  return (
    <>
      <div 
        ref={playerContainerRef}
        className="relative overflow-hidden bg-black w-full aspect-video rounded-md"
        onMouseMove={() => setShowControls(true)}
        onMouseLeave={() => isPlaying && setShowControls(false)}
      >
        {/* Video Element */}
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-contain"
          playsInline
          onClick={togglePlayPause}
          onLoadedMetadata={() => {
            if (videoRef.current) {
              setDuration(videoRef.current.duration);
              setIsLoading(false);
            }
          }}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onWaiting={() => setBuffering(true)}
          onPlaying={() => setBuffering(false)}
          onVolumeChange={() => {
            if (videoRef.current) {
              setVolume(videoRef.current.volume);
              setIsMuted(videoRef.current.muted);
            }
          }}
          crossOrigin="anonymous"
        >
          {/* Add caption tracks */}
          {captions.map(track => (
            <track 
              key={track.id}
              kind="subtitles"
              src={track.fileUrl}
              srcLang={track.language}
              label={track.label}
              default={selectedTrack?.id === track.id}
            />
          ))}
        </video>
        
        {/* Captions Container */}
        {renderCaptions()}
        
        {/* Loading Indicator */}
        {(isLoading || buffering) && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Loader className="w-12 h-12 text-primary animate-spin" />
          </div>
        )}
        
        {/* Video Controls */}
        <div 
          className={`absolute inset-0 transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent 50%, transparent)' }}
        >
          {/* Center Play/Pause Button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={togglePlayPause}
              className="w-16 h-16 rounded-full bg-black/50 text-white hover:bg-black/70"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="h-8 w-8" />
              ) : (
                <Play className="h-8 w-8" />
              )}
            </Button>
          </div>
          
          {/* Controls Bar */}
          <div className="absolute bottom-0 left-0 right-0 p-2 flex flex-col space-y-1">
            {/* Progress Bar */}
            <div className="px-3 py-0">
              <Slider
                value={[currentTime]}
                min={0}
                max={duration || 100}
                step={0.1}
                onValueChange={handleSeek}
                aria-label="Video progress"
                className="cursor-pointer"
              />
            </div>
            
            {/* Control Buttons */}
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={togglePlayPause} 
                  className="text-white hover:bg-white/20"
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Play className="h-5 w-5" />
                  )}
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={seekBackward} 
                  className="text-white hover:bg-white/20"
                  aria-label="Rewind 10 seconds"
                >
                  <SkipBack className="h-5 w-5" />
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={seekForward} 
                  className="text-white hover:bg-white/20"
                  aria-label="Forward 10 seconds"
                >
                  <SkipForward className="h-5 w-5" />
                </Button>
                
                <div className="flex items-center space-x-2 group relative">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={toggleMute} 
                    className="text-white hover:bg-white/20"
                    aria-label={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="h-5 w-5" />
                    ) : (
                      <Volume2 className="h-5 w-5" />
                    )}
                  </Button>
                  
                  <div className="hidden group-hover:block w-24">
                    <Slider
                      value={[isMuted ? 0 : volume]}
                      min={0}
                      max={1}
                      step={0.01}
                      onValueChange={handleVolumeChange}
                      aria-label="Volume"
                    />
                  </div>
                </div>
                
                <div className="text-white text-sm ml-2">
                  {formatDuration(currentTime)} / {formatDuration(duration)}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {/* Caption selector */}
                {captions.length > 0 && (
                  <CaptionTrackSelector
                    tracks={captions}
                    selectedTrack={selectedTrack}
                    onSelectTrack={selectTrack}
                    showCaptions={showCaptions}
                    toggleCaptions={toggleCaptions}
                    stylePreferences={stylePreferences}
                    updateCaptionStyle={updateCaptionStyle}
                    resetCaptionStyles={resetCaptionStyles}
                  />
                )}
                
                {/* Settings button */}
                <div className="relative">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setShowSettingsMenu(!showSettingsMenu)} 
                    className="text-white hover:bg-white/20"
                    aria-label="Settings"
                  >
                    <Settings className="h-5 w-5" />
                  </Button>
                  
                  {showSettingsMenu && (
                    <div className="absolute bottom-full right-0 mb-2 w-48 rounded-md bg-background shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                      <div className="py-1">
                        <div className="px-4 py-2 text-sm font-semibold text-foreground border-b">
                          Playback Speed
                        </div>
                        {[0.5, 0.75, 1, 1.25, 1.5, 2].map(speed => (
                          <button
                            key={speed}
                            className={`px-4 py-2 text-sm text-left w-full flex justify-between items-center ${
                              playbackRate === speed ? 'text-primary' : 'text-foreground'
                            } hover:bg-muted`}
                            onClick={() => handleSpeedChange(speed)}
                            aria-label={`Set playback speed to ${speed}x`}
                          >
                            {speed}x
                            {playbackRate === speed && <CheckIcon className="h-4 w-4" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={toggleFullScreen} 
                  className="text-white hover:bg-white/20"
                  aria-label={isFullScreen ? "Exit full screen" : "Enter full screen"}
                >
                  {isFullScreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Accessibility info (for screen readers) */}
        <div className="sr-only">
          <p>
            Video: {content.title}. {content.description}
          </p>
          <p>
            Duration: {formatDuration(duration)}. Current time: {formatDuration(currentTime)}.
          </p>
          <p>
            Keyboard shortcuts: Space or K to play/pause, M to mute, F for fullscreen, 
            Left arrow or J to rewind 10 seconds, Right arrow or L to forward 10 seconds,
            Up arrow to increase volume, Down arrow to decrease volume, C to toggle captions.
          </p>
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

// Small check icon component
const CheckIcon = ({ className = "" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

export default AccessibleVideoPlayer;