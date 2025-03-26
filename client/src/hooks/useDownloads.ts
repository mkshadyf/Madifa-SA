import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ContentItem } from '@shared/types';
import { useAuth } from '@/contexts/AuthContext';
import {
  DownloadedContent,
  getDownloadedContent,
  downloadContent,
  removeDownload,
  clearAllDownloads,
  isContentDownloaded,
  getDownloadState,
  updateDownloadProgress
} from '@/lib/downloadManager';

export function useDownloads() {
  const [downloads, setDownloads] = useState<DownloadedContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  // Load downloads
  const loadDownloads = useCallback(() => {
    try {
      const allDownloads = getDownloadedContent();
      
      // Filter expired downloads
      const currentDate = new Date().toISOString();
      const validDownloads = allDownloads.filter(download => {
        if (!download.expiryDate) return true; // Non-premium content doesn't expire
        return download.expiryDate > currentDate;
      });
      
      // Remove expired downloads
      if (validDownloads.length !== allDownloads.length) {
        // Some downloads expired, save the valid ones
        const expiredCount = allDownloads.length - validDownloads.length;
        toast({
          title: "Downloads expired",
          description: `${expiredCount} downloaded ${expiredCount === 1 ? 'item has' : 'items have'} expired.`
        });
        
        // Clear the expired downloads
        const expiredIds = allDownloads
          .filter(d => d.expiryDate && d.expiryDate <= currentDate)
          .map(d => d.id);
          
        expiredIds.forEach(id => removeDownload(id));
      }
      
      setDownloads(validDownloads);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading downloads:', error);
      toast({
        title: "Error loading downloads",
        description: "Failed to load your downloaded content.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  }, [toast]);

  // Load downloads on mount
  useEffect(() => {
    loadDownloads();
    
    // Set up a refresh interval to check for expired downloads every minute
    const intervalId = setInterval(loadDownloads, 60000);
    
    return () => clearInterval(intervalId);
  }, [loadDownloads]);

  // Start a download
  const startDownload = useCallback(async (content: ContentItem) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to download content.",
        variant: "destructive"
      });
      return false;
    }
    
    // Check if download already exists
    if (isContentDownloaded(content.id)) {
      toast({
        title: "Already downloaded",
        description: "This content is already downloaded and available offline."
      });
      return true;
    }
    
    // Check if premium content and user has premium access
    if (content.isPremium && !user.isPremium) {
      toast({
        title: "Premium content",
        description: "You need a premium subscription to download this content.",
        variant: "destructive"
      });
      return false;
    }
    
    try {
      toast({
        title: "Download started",
        description: "Your download has started. You'll be notified when it's complete."
      });
      
      const success = await downloadContent(content, user.isPremium || false);
      
      if (success) {
        loadDownloads(); // Refresh downloads
        
        // Show completion toast if download is done
        const updatedState = getDownloadState(content.id);
        if (updatedState?.downloadState === 'complete') {
          toast({
            title: "Download complete",
            description: `"${content.title}" is now available offline.`
          });
        }
        
        return true;
      } else {
        toast({
          title: "Download failed",
          description: "There was an error downloading this content. Please try again.",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error('Error starting download:', error);
      toast({
        title: "Download failed",
        description: "There was an error downloading this content. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  }, [user, toast, loadDownloads]);

  // Delete a download
  const deleteDownload = useCallback((contentId: number) => {
    try {
      const removed = removeDownload(contentId);
      
      if (removed) {
        loadDownloads(); // Refresh downloads
        toast({
          title: "Download removed",
          description: "The download has been removed."
        });
        return true;
      } else {
        toast({
          title: "Error removing download",
          description: "Failed to remove the download.",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error('Error removing download:', error);
      toast({
        title: "Error removing download",
        description: "Failed to remove the download.",
        variant: "destructive"
      });
      return false;
    }
  }, [toast, loadDownloads]);

  // Clear all downloads
  const deleteAllDownloads = useCallback(() => {
    try {
      const cleared = clearAllDownloads();
      
      if (cleared) {
        loadDownloads(); // Refresh downloads
        toast({
          title: "All downloads removed",
          description: "All downloads have been removed."
        });
        return true;
      } else {
        toast({
          title: "Error removing downloads",
          description: "Failed to remove all downloads.",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error('Error clearing downloads:', error);
      toast({
        title: "Error removing downloads",
        description: "Failed to remove all downloads.",
        variant: "destructive"
      });
      return false;
    }
  }, [toast, loadDownloads]);

  return {
    downloads,
    isLoading,
    startDownload,
    deleteDownload,
    deleteAllDownloads,
    isContentDownloaded,
    getDownloadState,
    refreshDownloads: loadDownloads
  };
}