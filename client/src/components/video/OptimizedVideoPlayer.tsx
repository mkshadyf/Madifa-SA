import React, { useState, useEffect, useRef } from 'react';
import { usePerformanceContext } from '@/contexts/PerformanceContext';
import { ContentItem } from '@shared/types';
import { Play, Pause, Volume2, VolumeX, Maximize, SkipForward, RotateCcw } from 'lucide-react';
import { useCaptions, Track } from '@/hooks/useCaptions';
import { Slider } from '@/components/ui/slider';
import { useIsMobile } from '@/hooks/use-mobile';
import { throttle } from '@/lib/performanceOptimizer';
import { parseVideoUrl, getVideoMimeType } from '@/lib/utils';

interface OptimizedVideoPlayerProps {
  content: ContentItem;
  autoPlay?: boolean;
  onProgressUpdate?: (progress: number) => void;
  onVideoComplete?: () => void;
}

const OptimizedVideoPlayer: React.FC<OptimizedVideoPlayerProps> = ({
  content,
  autoPlay = false,
  onProgressUpdate,
  onVideoComplete
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [buffering, setBuffering] = useState(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const isMobile = useIsMobile();
  const { captions: tracks } = useCaptions(content.id);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  
  const { 
    lightweight,
    videoQuality,
    optimizeImageUrl
  } = usePerformanceContext();
  
  // Choose the video source based on quality settings and parse video type
  const getOptimizedVideoSource = () => {
    // Check if we have a Vimeo ID directly available
    if (content.vimeoId) {
      return content.videoUrl;
    }
    
    // Parse video URL to check for provider
    const parsedVideo = parseVideoUrl(content.videoUrl);
    
    if (parsedVideo?.provider === 'vimeo') {
      // Use vimeo ID if available from URL
      return content.videoUrl;
    }
    
    // For direct video URLs, quality settings could be applied (e.g., lower resolution for lightweight mode)
    // This is a placeholder for quality selection logic
    // In a real app, you would have different quality versions of each video
    return content.videoUrl;
  };
  
  // Handle playback
  const togglePlay = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
  };
  
  // Handle mute toggle
  const toggleMute = () => {
    if (!videoRef.current) return;
    
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };
  
  // Handle seeking
  const handleSeek = (value: number[]) => {
    if (!videoRef.current) return;
    
    const seekTime = (value[0] / 100) * duration;
    videoRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
    
    // Reset control timeout
    showControlsTemporarily();
  };
  
  // Show controls temporarily
  const showControlsTemporarily = () => {
    setShowControls(true);
    
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    
    // Hide controls after 3 seconds of inactivity
    if (!isMobile) {
      controlsTimeoutRef.current = setTimeout(() => {
        if (isPlaying) {
          setShowControls(false);
        }
      }, 3000);
    }
  };
  
  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current.requestFullscreen();
    }
  };
  
  // Skip forward 10 seconds
  const skipForward = () => {
    if (!videoRef.current) return;
    
    videoRef.current.currentTime += 10;
    showControlsTemporarily();
  };
  
  // Rewind 10 seconds
  const rewind = () => {
    if (!videoRef.current) return;
    
    videoRef.current.currentTime -= 10;
    showControlsTemporarily();
  };
  
  // Format time display (seconds to mm:ss)
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };
  
  // Handle video time updates
  const handleTimeUpdate = throttle(() => {
    if (!videoRef.current) return;
    
    const current = videoRef.current.currentTime;
    setCurrentTime(current);
    
    // Update progress for parent component if callback provided
    if (onProgressUpdate) {
      onProgressUpdate(current);
    }
  }, 1000); // Only update UI every second to reduce overhead
  
  // Setup event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    // Setup video event listeners
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onDurationChange = () => setDuration(video.duration);
    const onEnded = () => {
      setIsPlaying(false);
      setShowControls(true);
      if (onVideoComplete) onVideoComplete();
    };
    const onWaiting = () => setBuffering(true);
    const onCanPlay = () => setBuffering(false);
    
    // Throttled handlers for mobile to improve performance
    const onTouchMoveThrottled = throttle(() => {
      showControlsTemporarily();
    }, 100);
    
    // Add event listeners
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('durationchange', onDurationChange);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', onEnded);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('canplay', onCanPlay);
    
    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', showControlsTemporarily);
      container.addEventListener('touchmove', onTouchMoveThrottled);
    }
    
    // Clean up
    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('durationchange', onDurationChange);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', onEnded);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('canplay', onCanPlay);
      
      if (container) {
        container.removeEventListener('mousemove', showControlsTemporarily);
        container.removeEventListener('touchmove', onTouchMoveThrottled);
      }
      
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [
    handleTimeUpdate,
    onProgressUpdate,
    onVideoComplete,
    isMobile,
    lightweight
  ]);
  
  // Handle autoplay
  useEffect(() => {
    if (autoPlay && videoRef.current) {
      // On mobile, browsers typically require user interaction before autoplay
      // On desktop, we can try to autoplay but it's better to mute first
      videoRef.current.muted = true;
      setIsMuted(true);
      
      const playPromise = videoRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // Autoplay started
            setIsPlaying(true);
          })
          .catch(() => {
            // Autoplay prevented
            setIsPlaying(false);
          });
      }
    }
  }, [autoPlay]);
  
  // Handle caption track selection
  useEffect(() => {
    if (!tracks || tracks.length === 0) return;
    
    // Set default track if available
    const defaultTrack = tracks.find((track: Track) => track.isDefault);
    if (defaultTrack && !selectedTrack) {
      setSelectedTrack(defaultTrack);
    }
  }, [tracks, selectedTrack]);
  
  // Handle track change
  const handleTrackChange = (trackId: number | null) => {
    if (!trackId) {
      setSelectedTrack(null);
      return;
    }
    
    const track = tracks.find((t: Track) => t.id === trackId);
    if (track) {
      setSelectedTrack(track);
    }
  };
  
  return (
    <div 
      ref={containerRef}
      className={`relative w-full ${isMobile ? "h-[300px]" : "h-[600px]"} bg-black overflow-hidden`}
      onClick={togglePlay}
    >
      {/* Video element */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain mx-auto"
        poster={optimizeImageUrl(content.thumbnailUrl)}
        playsInline
        preload={lightweight ? "none" : "auto"}
      >
        {/* Source element with proper MIME type */}
        <source src={getOptimizedVideoSource()} type={getVideoMimeType(content.videoUrl)} />
        
        {/* Fallback for browsers that might have issues with the MIME type */}
        {!content.videoUrl.endsWith('.mp4') && <source src={content.videoUrl} type="video/mp4" />}
        
        {/* Captions */}
        {selectedTrack && (
          <track 
            kind="subtitles" 
            src={selectedTrack.fileUrl} 
            srcLang={selectedTrack.language} 
            label={selectedTrack.label} 
            default 
          />
        )}
        Your browser does not support the video tag.
      </video>
      
      {/* Loading overlay */}
      {buffering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="w-12 h-12 rounded-full border-4 border-t-transparent border-primary animate-spin"></div>
        </div>
      )}
      
      {/* Controls overlay */}
      <div 
        className={`absolute inset-0 bg-gradient-to-t from-black/80 to-transparent 
          ${showControls ? 'opacity-100' : 'opacity-0'} 
          transition-opacity duration-300 flex flex-col justify-end`}
        onClick={e => e.stopPropagation()}
      >
        {/* Title */}
        {showControls && (
          <div className="absolute top-0 left-0 w-full p-4 bg-gradient-to-b from-black/80 to-transparent">
            <h2 className="text-white font-medium text-lg truncate">{content.title}</h2>
          </div>
        )}
        
        {/* Main playback controls */}
        <div className="flex flex-col p-4 space-y-2">
          {/* Progress bar */}
          <div className="flex items-center space-x-2">
            <span className="text-white text-xs">{formatTime(currentTime)}</span>
            <Slider
              value={[duration ? (currentTime / duration) * 100 : 0]}
              onValueChange={handleSeek}
              max={100}
              step={0.1}
              className={`flex-1 ${lightweight ? 'h-1' : 'h-2'}`}
            />
            <span className="text-white text-xs">{formatTime(duration)}</span>
          </div>
          
          {/* Control buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {/* Play/pause button */}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlay();
                }}
                className="text-white p-2 rounded-full hover:bg-white/10"
              >
                {isPlaying ? (
                  <Pause className={isMobile ? "w-5 h-5" : "w-6 h-6"} />
                ) : (
                  <Play className={isMobile ? "w-5 h-5" : "w-6 h-6"} />
                )}
              </button>
              
              {/* Rewind button */}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  rewind();
                }}
                className="text-white p-2 rounded-full hover:bg-white/10"
              >
                <RotateCcw className={isMobile ? "w-4 h-4" : "w-5 h-5"} />
              </button>
              
              {/* Skip forward button */}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  skipForward();
                }}
                className="text-white p-2 rounded-full hover:bg-white/10"
              >
                <SkipForward className={isMobile ? "w-4 h-4" : "w-5 h-5"} />
              </button>
              
              {/* Mute button */}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMute();
                }}
                className="text-white p-2 rounded-full hover:bg-white/10"
              >
                {isMuted ? (
                  <VolumeX className={isMobile ? "w-4 h-4" : "w-5 h-5"} />
                ) : (
                  <Volume2 className={isMobile ? "w-4 h-4" : "w-5 h-5"} />
                )}
              </button>
            </div>
            
            {/* Right side controls */}
            <div className="flex items-center space-x-2">
              {/* Fullscreen button */}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFullscreen();
                }}
                className="text-white p-2 rounded-full hover:bg-white/10"
              >
                <Maximize className={isMobile ? "w-4 h-4" : "w-5 h-5"} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OptimizedVideoPlayer;