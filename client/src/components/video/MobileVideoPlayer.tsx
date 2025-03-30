import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Volume2, VolumeX, Maximize, SkipBack, SkipForward, Play, Pause, Settings } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { ContentItem } from '@shared/types';
import { formatDuration, getVideoMimeType } from '@/lib/utils';
import { useCaptions, Track } from '@/hooks/useCaptions';
import AuthModal from "../auth/AuthModal";

interface MobileVideoPlayerProps {
  content: ContentItem;
  autoPlay?: boolean;
  onProgressUpdate?: (progress: number) => void;
  onVideoComplete?: () => void;
  onBack?: () => void;
}

const MobileVideoPlayer = ({
  content,
  autoPlay = false,
  onProgressUpdate,
  onVideoComplete,
  onBack
}: MobileVideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Authentication modal
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [initialView, setInitialView] = useState<"login" | "register" | "upgrade">("login");
  
  // Handle captions
  const { captions: tracks, isLoading: captionsLoading } = useCaptions(content.id);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [showCaptionMenu, setShowCaptionMenu] = useState(false);

  useEffect(() => {
    // Set default track
    if (tracks && tracks.length > 0) {
      const defaultTrack = tracks.find(track => track.isDefault) || tracks[0];
      setSelectedTrack(defaultTrack);
    }
  }, [tracks]);

  // Set up event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => {
      const current = video.currentTime;
      const videoDuration = video.duration;
      setCurrentTime(current);
      
      if (videoDuration) {
        const progressPercent = (current / videoDuration) * 100;
        setProgress(progressPercent);
        
        // Report progress to parent component
        if (onProgressUpdate) {
          onProgressUpdate(progressPercent);
        }
      }
    };

    const onLoadedMetadata = () => {
      setDuration(video.duration);
      setIsLoading(false);
    };

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };
    
    const onEnded = () => {
      setIsPlaying(false);
      if (onVideoComplete) {
        onVideoComplete();
      }
    };

    const onError = () => {
      setIsLoading(false);
      setError('Error loading video. Please try again later.');
      toast({
        title: 'Video Error',
        description: 'Could not load the video. Please try again later.',
        variant: 'destructive'
      });
    };

    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('loadedmetadata', onLoadedMetadata);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('volumechange', onVolumeChange);
    video.addEventListener('ended', onEnded);
    video.addEventListener('error', onError);

    // Auto play if specified
    if (autoPlay) {
      try {
        // Check if video element is still in the document
        if (document.body.contains(video)) {
          const playPromise = video.play();
          if (playPromise !== undefined) {
            playPromise.catch((error) => {
              // Check if error is due to media being removed
              if (error.name === 'AbortError' || error.message?.includes('removed from the document')) {
                console.log('Video was removed from the document, ignoring play error');
              } else {
                // Auto-play was prevented, show a play button
                console.log('Auto-play prevented:', error);
                setIsPlaying(false);
              }
            });
          }
        }
      } catch (error) {
        console.error("Autoplay error caught:", error);
        setIsPlaying(false);
      }
    }

    // Clean up event listeners
    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('volumechange', onVolumeChange);
      video.removeEventListener('ended', onEnded);
      video.removeEventListener('error', onError);
    };
  }, [autoPlay, onProgressUpdate, onVideoComplete, toast]);

  // Handle fullscreen toggle
  useEffect(() => {
    const exitHandler = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', exitHandler);
    return () => {
      document.removeEventListener('fullscreenchange', exitHandler);
    };
  }, []);

  // Hide controls after inactivity
  useEffect(() => {
    if (isPlaying) {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
    
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying, showControls]);

  // Play/Pause toggle
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    // If premium content and user is not logged in, show auth modal
    if (content.isPremium && !user) {
      setInitialView("login");
      setShowAuthModal(true);
      return;
    }

    // If premium content and user doesn't have premium access, show upgrade modal
    if (content.isPremium && user && !user.isPremium) {
      setInitialView("upgrade");
      setShowAuthModal(true);
      return;
    }

    if (isPlaying) {
      try {
        // Check if video element is still in the document
        if (document.body.contains(video)) {
          video.pause();
        }
      } catch (error) {
        console.error("Pause error caught:", error);
      }
    } else {
      try {
        // Check if video element is still in the document
        if (document.body.contains(video)) {
          video.play().catch(error => {
            // Check if error is due to media being removed
            if (error.name === 'AbortError' || error.message?.includes('removed from the document')) {
              console.log('Video was removed from the document, ignoring play error');
            } else {
              console.error('Error playing video:', error);
              toast({
                title: 'Playback Error',
                description: 'Could not play the video.',
                variant: 'destructive'
              });
            }
          });
        }
      } catch (error) {
        console.error("Play error caught:", error);
      }
    }
  };

  // Volume control
  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
  };

  // Seek video
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    
    const seekTime = (parseFloat(e.target.value) / 100) * duration;
    video.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  // Skip backward
  const skipBackward = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, video.currentTime - 10);
  };

  // Skip forward
  const skipForward = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.min(duration, video.currentTime + 10);
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    const container = videoContainerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(err => {
        console.error('Error attempting to enable fullscreen:', err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // Show controls on tap/move
  const showControlsTemporarily = () => {
    setShowControls(true);
    
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  // Handle track selection
  const handleTrackSelect = (trackId: number | null) => {
    if (!tracks) return;
    
    if (trackId === null) {
      setSelectedTrack(null);
      return;
    }
    
    const track = tracks.find(t => t.id === trackId);
    if (track) {
      setSelectedTrack(track);
    }
    
    setShowCaptionMenu(false);
  };

  return (
    <>
      <div 
        ref={videoContainerRef}
        className={`relative w-full rounded-lg overflow-hidden shadow-lg bg-black ${isFullscreen ? 'h-screen' : 'aspect-video'}`}
        onClick={showControlsTemporarily}
        onTouchStart={showControlsTemporarily}
        onMouseMove={showControlsTemporarily}
      >
        {/* Video Element */}
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          playsInline
          poster={content.thumbnailUrl}
        >
          {/* Use proper source element with MIME type */}
          <source src={content.videoUrl} type={getVideoMimeType(content.videoUrl)} />
          
          {/* Fallback for browsers that can handle MP4 but might have issues with other formats */}
          {!content.videoUrl.endsWith('.mp4') && <source src={content.videoUrl} type="video/mp4" />}
          
          {/* Captions */}
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

        {/* Loading Indicator */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <div className="w-16 h-16 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-white flex-col p-4">
            <span className="text-red-500 text-xl mb-2">⚠️</span>
            <p className="text-center">{error}</p>
          </div>
        )}

        {/* Video Controls */}
        {showControls && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent">
            {/* Top Controls */}
            <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
              <button 
                onClick={onBack} 
                className="rounded-full bg-black/40 p-2 text-white"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setShowCaptionMenu(!showCaptionMenu)} 
                  className="rounded-full bg-black/40 p-2 text-white"
                >
                  <Settings size={20} />
                </button>
              </div>
            </div>

            {/* Center Controls */}
            <div className="absolute inset-0 flex items-center justify-center space-x-8">
              <button 
                onClick={skipBackward} 
                className="rounded-full bg-black/40 p-3 text-white"
              >
                <SkipBack size={24} />
              </button>
              <button 
                onClick={togglePlay} 
                className="rounded-full bg-black/40 p-4 text-white"
              >
                {isPlaying ? <Pause size={32} /> : <Play size={32} />}
              </button>
              <button 
                onClick={skipForward} 
                className="rounded-full bg-black/40 p-3 text-white"
              >
                <SkipForward size={24} />
              </button>
            </div>

            {/* Bottom Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
              {/* Progress Bar */}
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={handleSeek}
                className="w-full h-1 bg-gray-600 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
              />
              
              {/* Time and Controls */}
              <div className="flex items-center justify-between text-white text-sm">
                <span>{formatDuration(currentTime)}</span>
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={toggleMute}
                    title={isMuted ? "Unmute" : "Mute"}
                    className="p-1 rounded-full hover:bg-white/20"
                  >
                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                  </button>
                  <button 
                    onClick={toggleFullscreen}
                    title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                    className="p-1 rounded-full hover:bg-white/20"
                  >
                    <Maximize size={20} />
                  </button>
                </div>
                <span>-{formatDuration(duration - currentTime)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Caption/Settings Menu */}
        {showCaptionMenu && (
          <div className="absolute right-4 top-16 bg-black/80 p-4 rounded-lg text-white min-w-[200px]">
            <h3 className="font-semibold mb-2">Captions</h3>
            <div className="space-y-2">
              <div 
                className={`cursor-pointer hover:bg-purple-800 p-2 rounded ${selectedTrack === null ? 'bg-purple-700' : ''}`}
                onClick={() => handleTrackSelect(null)}
              >
                Off
              </div>
              {tracks?.map(track => (
                <div 
                  key={track.id} 
                  className={`cursor-pointer hover:bg-purple-800 p-2 rounded ${selectedTrack?.id === track.id ? 'bg-purple-700' : ''}`}
                  onClick={() => handleTrackSelect(track.id)}
                >
                  {track.label}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Authentication Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        initialView={initialView}
      />
    </>
  );
};

export default MobileVideoPlayer;