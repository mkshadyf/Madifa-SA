import { useState, useEffect, useMemo, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  getCaptionPreferences, 
  saveCaptionPreferences, 
  defaultCaptionPreferences,
  generateCaptionStyles,
  CaptionStylePreferences
} from '@/lib/captionSettings';

export type Track = {
  id: number;
  language: string;
  label: string;
  fileUrl: string;
  isDefault: boolean;
};

export function useCaptions(contentId: number | undefined) {
  const { toast } = useToast();
  const [captions, setCaptions] = useState<Track[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCaptions, setShowCaptions] = useState(true);
  
  // Get user preferences for captions
  const [stylePreferences, setStylePreferences] = useState<CaptionStylePreferences>(
    getCaptionPreferences()
  );
  
  // Generated CSS styles from preferences
  const captionStyles = useMemo(() => 
    generateCaptionStyles(stylePreferences), 
    [stylePreferences]
  );

  // Fetch available caption tracks for the content
  useEffect(() => {
    if (!contentId) return;
    
    const fetchCaptions = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const data = await apiRequest({
          url: `/api/captions/${contentId}`,
          method: 'GET'
        });
        
        if (Array.isArray(data) && data.length > 0) {
          setCaptions(data);
          
          // Set default track if available
          const defaultTrack = data.find(track => track.isDefault);
          setSelectedTrack(defaultTrack || null);
        } else {
          setCaptions([]);
          setSelectedTrack(null);
        }
      } catch (err) {
        console.error('Error fetching captions:', err);
        setError('Failed to load captions');
        setCaptions([]);
        
        // Don't show error toast for empty captions, as many videos may not have them
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCaptions();
  }, [contentId]);
  
  // Handle track selection
  const selectTrack = useCallback((trackId: number | null) => {
    if (trackId === null) {
      setSelectedTrack(null);
      return;
    }
    
    const track = captions.find(t => t.id === trackId);
    if (track) {
      setSelectedTrack(track);
      
      if (!showCaptions) {
        setShowCaptions(true);
      }
    }
  }, [captions, showCaptions]);
  
  // Toggle captions visibility
  const toggleCaptions = useCallback(() => {
    setShowCaptions(prev => !prev);
  }, []);
  
  // Update caption style preferences
  const updateCaptionStyle = useCallback((updates: Partial<CaptionStylePreferences>) => {
    setStylePreferences(prev => {
      const newPrefs = { ...prev, ...updates };
      saveCaptionPreferences(newPrefs);
      return newPrefs;
    });
  }, []);
  
  // Reset caption styles to default
  const resetCaptionStyles = useCallback(() => {
    setStylePreferences(defaultCaptionPreferences);
    saveCaptionPreferences(defaultCaptionPreferences);
    
    toast({
      title: "Caption styles reset",
      description: "Caption appearance has been reset to default settings."
    });
  }, [toast]);
  
  return {
    captions,
    selectedTrack,
    selectTrack,
    isLoading,
    error,
    stylePreferences,
    updateCaptionStyle,
    resetCaptionStyles,
    showCaptions,
    toggleCaptions,
    captionStyles
  };
}