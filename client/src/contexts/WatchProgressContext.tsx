import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiRequest } from "@/lib/queryClient";

// Types for watch progress
export interface WatchProgress {
  contentId: string;
  position: number; // Time in seconds
  duration: number; // Total duration in seconds
  lastWatched: Date;
}

interface SavedPosition {
  contentId: string | number;
  position: number;
  url: string;
}

interface WatchProgressContextType {
  // Get watch progress for a specific content
  getProgress: (contentId: string) => Promise<WatchProgress | null>;
  // Save watch progress
  saveProgress: (contentId: string, position: number, duration: number) => Promise<void>;
  // Get content that was watched but not completed (for continue watching)
  getContinueWatching: () => Promise<WatchProgress[]>;
  // Track auth redirection state
  pendingPosition: SavedPosition | null;
  setPendingPosition: (position: SavedPosition | null) => void;
  clearPendingPosition: () => void;
}

const WatchProgressContext = createContext<WatchProgressContextType | undefined>(undefined);

export const useWatchProgress = () => {
  const context = useContext(WatchProgressContext);
  if (context === undefined) {
    throw new Error("useWatchProgress must be used within a WatchProgressProvider");
  }
  return context;
};

export const WatchProgressProvider = ({ children }: { children: ReactNode }) => {
  // We can't use useAuth here now since AuthProvider is a child of WatchProgressProvider
  const [user, setUser] = useState<any>(null);
  const [pendingPosition, setPendingPosition] = useState<SavedPosition | null>(null);
  
  // In-memory cache for local state between login transitions
  const [progressCache, setProgressCache] = useState<Record<string, WatchProgress>>({});
  
  // Instead of using useAuth, we'll check for auth token or session in local storage
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check for auth token
        const token = localStorage.getItem("auth_token");
        if (token) {
          // We have a token, so the user is logged in
          // We don't need the actual user data for the watch progress context to work
          setUser({ id: "authenticated-user" });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error checking auth state in WatchProgressProvider:", error);
        setUser(null);
      }
    };
    
    checkAuth();
    
    // Listen for storage events (auth token changes)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "auth_token") {
        checkAuth();
      }
    };
    
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);
  
  // Clear the cache when user changes (logs in/out)
  useEffect(() => {
    setProgressCache({});
  }, [user?.id]);
  
  // Get watch progress for content
  const getProgress = async (contentId: string): Promise<WatchProgress | null> => {
    // Check cache first
    if (progressCache[contentId]) {
      return progressCache[contentId];
    }
    
    // If not logged in, check localStorage
    if (!user) {
      try {
        const localProgress = localStorage.getItem(`watch_progress_${contentId}`);
        if (localProgress) {
          const parsed = JSON.parse(localProgress);
          return {
            ...parsed,
            lastWatched: new Date(parsed.lastWatched)
          };
        }
      } catch (error) {
        console.error("Error retrieving local watch progress:", error);
      }
      return null;
    }
    
    // If logged in, fetch from API
    try {
      const progress = await apiRequest(`/api/watch-progress/${contentId}`, "GET");
      if (progress) {
        // Cache the result
        setProgressCache(prev => ({
          ...prev,
          [contentId]: {
            ...progress,
            lastWatched: new Date(progress.lastWatched)
          }
        }));
        return {
          ...progress,
          lastWatched: new Date(progress.lastWatched)
        };
      }
      return null;
    } catch (error) {
      console.error("Error fetching watch progress:", error);
      return null;
    }
  };
  
  // Save watch progress
  const saveProgress = async (contentId: string, position: number, duration: number): Promise<void> => {
    const now = new Date();
    const progress = {
      contentId,
      position,
      duration,
      lastWatched: now
    };
    
    // Update the cache
    setProgressCache(prev => ({
      ...prev,
      [contentId]: progress
    }));
    
    // Always save to localStorage for guests and as backup
    try {
      localStorage.setItem(`watch_progress_${contentId}`, JSON.stringify(progress));
    } catch (error) {
      console.error("Error saving local watch progress:", error);
    }
    
    // If logged in, save to API
    if (user) {
      try {
        await apiRequest("/api/watch-progress", "POST", {
          contentId,
          position,
          duration
        });
      } catch (error) {
        console.error("Error saving watch progress to API:", error);
      }
    }
  };
  
  // Get content that was watched but not completed (for continue watching)
  const getContinueWatching = async (): Promise<WatchProgress[]> => {
    // If not logged in, get from localStorage
    if (!user) {
      try {
        const continueWatching: WatchProgress[] = [];
        // Check all localStorage keys
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith("watch_progress_")) {
            try {
              const contentId = key.replace("watch_progress_", "");
              const progressData = localStorage.getItem(key);
              
              if (progressData) {
                const progress = JSON.parse(progressData);
                // Only include if not completed (less than 90% watched)
                if (progress.position < progress.duration * 0.9) {
                  continueWatching.push({
                    ...progress,
                    lastWatched: new Date(progress.lastWatched)
                  });
                }
              }
            } catch (e) {
              console.error("Error parsing local progress data:", e);
            }
          }
        }
        
        // Sort by lastWatched (most recent first)
        return continueWatching.sort((a, b) => 
          b.lastWatched.getTime() - a.lastWatched.getTime()
        );
      } catch (error) {
        console.error("Error retrieving local continue watching:", error);
        return [];
      }
    }
    
    // If logged in, fetch from API
    try {
      const continueWatching = await apiRequest("/api/watch-progress/continue", "GET");
      if (Array.isArray(continueWatching)) {
        // Convert lastWatched strings to Date objects
        return continueWatching.map(item => ({
          ...item,
          lastWatched: new Date(item.lastWatched)
        }));
      }
      return [];
    } catch (error) {
      console.error("Error fetching continue watching:", error);
      return [];
    }
  };
  
  const clearPendingPosition = () => {
    setPendingPosition(null);
  };
  
  return (
    <WatchProgressContext.Provider
      value={{
        getProgress,
        saveProgress,
        getContinueWatching,
        pendingPosition,
        setPendingPosition,
        clearPendingPosition
      }}
    >
      {children}
    </WatchProgressContext.Provider>
  );
};