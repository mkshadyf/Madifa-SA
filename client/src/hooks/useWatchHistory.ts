import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/queryClient";
import { ContentItem } from "@shared/types";
import { useToast } from "./use-toast";

export const useWatchHistory = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [watchHistory, setWatchHistory] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Fetch watch history
  const fetchWatchHistory = async () => {
    if (!user) {
      setWatchHistory([]);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch from API
      const token = localStorage.getItem("auth_token");
      if (!token) throw new Error("No authentication token found");
      
      const res = await fetch("/api/history", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!res.ok) throw new Error("Failed to fetch watch history");
      
      const data = await res.json();
      
      // Transform API response to ContentItem[]
      // The API returns {id, userId, contentId, progress, lastWatched, content}
      const transformedHistory = data.map((item: any) => ({
        ...item.content,
        progress: item.progress
      }));
      
      setWatchHistory(transformedHistory);
    } catch (err) {
      console.error("Error fetching watch history:", err);
      setError(err instanceof Error ? err : new Error("Failed to fetch watch history"));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Update watch progress
  const updateWatchProgress = async (contentId: number, progress: number) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to save your watch progress",
        variant: "destructive",
      });
      return false;
    }
    
    try {
      // Update on API
      await apiRequest("POST", "/api/history", { 
        contentId, 
        progress 
      });
      
      // Update local state
      setWatchHistory(prev => {
        const existingIndex = prev.findIndex(item => item.id === contentId);
        
        if (existingIndex >= 0) {
          // Update existing item
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            progress
          };
          return updated;
        } else {
          // No need to add new item here as we don't have the full content data
          // We'll refetch to get the updated list
          fetchWatchHistory();
          return prev;
        }
      });
      
      // Only show toast for significant progress updates (e.g., 25%, 50%, 75%, 100%)
      if (progress === 100) {
        toast({
          title: "Watch completed",
          description: "Your progress has been saved",
        });
      } else if (progress % 25 === 0) {
        toast({
          title: "Progress saved",
          description: `You're ${progress}% through this content`,
        });
      }
      
      return true;
    } catch (err) {
      console.error("Error updating watch progress:", err);
      toast({
        title: "Error",
        description: "Failed to update watch progress",
        variant: "destructive",
      });
      return false;
    }
  };
  
  // Get progress for a specific content
  const getWatchProgress = (contentId: number) => {
    const item = watchHistory.find(item => item.id === contentId);
    return item?.progress || 0;
  };
  
  // Load watch history on mount and when user changes
  useEffect(() => {
    fetchWatchHistory();
  }, [user]);
  
  return {
    watchHistory,
    isLoading,
    error,
    updateWatchProgress,
    getWatchProgress,
    refetch: fetchWatchHistory,
  };
};
