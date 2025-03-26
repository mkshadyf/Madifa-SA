import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/queryClient";
import { ContentItem } from "@shared/types";
import { useToast } from "./use-toast";

export const useWatchlist = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [watchlist, setWatchlist] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Fetch watchlist
  const fetchWatchlist = async () => {
    if (!user) {
      setWatchlist([]);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch from API
      const token = localStorage.getItem("auth_token");
      if (!token) throw new Error("No authentication token found");
      
      const res = await fetch("/api/watchlist", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!res.ok) throw new Error("Failed to fetch watchlist");
      
      const data = await res.json();
      
      // Transform API response to ContentItem[]
      // The API returns {id, userId, contentId, addedAt, content}
      const transformedWatchlist = data.map((item: any) => item.content);
      
      setWatchlist(transformedWatchlist);
    } catch (err) {
      console.error("Error fetching watchlist:", err);
      setError(err instanceof Error ? err : new Error("Failed to fetch watchlist"));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Add to watchlist
  const addToWatchlist = async (contentId: number) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to add content to your watchlist",
        variant: "destructive",
      });
      return false;
    }
    
    try {
      // Add to API
      await apiRequest("POST", "/api/watchlist", { contentId });
      
      // Refresh watchlist data
      await fetchWatchlist();
      
      toast({
        title: "Added to watchlist",
        description: "Content has been added to your watchlist",
      });
      
      return true;
    } catch (err) {
      console.error("Error adding to watchlist:", err);
      toast({
        title: "Error",
        description: "Failed to add content to watchlist",
        variant: "destructive",
      });
      return false;
    }
  };
  
  // Remove from watchlist
  const removeFromWatchlist = async (contentId: number) => {
    if (!user) return false;
    
    try {
      // Remove from API
      await apiRequest("DELETE", `/api/watchlist/${contentId}`, undefined);
      
      // Update local state
      setWatchlist(prev => prev.filter(item => item.id !== contentId));
      
      toast({
        title: "Removed from watchlist",
        description: "Content has been removed from your watchlist",
      });
      
      return true;
    } catch (err) {
      console.error("Error removing from watchlist:", err);
      toast({
        title: "Error",
        description: "Failed to remove content from watchlist",
        variant: "destructive",
      });
      return false;
    }
  };
  
  // Check if content is in watchlist
  const isInWatchlist = (contentId: number) => {
    return watchlist.some(item => item.id === contentId);
  };
  
  // Load watchlist on mount and when user changes
  useEffect(() => {
    fetchWatchlist();
  }, [user]);
  
  return {
    watchlist,
    isLoading,
    error,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    refetch: fetchWatchlist,
  };
};
