import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { ContentItem } from '@shared/types';
import { WatchHistory } from '@shared/schema';
import {
  getDeviceId,
  isNewDevice,
  syncWatchHistory,
  getWatchProgress,
  updateWatchProgress,
  getContinueWatching,
  updateLastDevice
} from '@/lib/syncManager';

export function useSync() {
  const [continueWatchingContent, setContinueWatchingContent] = useState<ContentItem[]>([]);
  const [watchHistory, setWatchHistory] = useState<WatchHistory[]>([]);
  const [isOnNewDevice, setIsOnNewDevice] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Use refs to track mounted state and prevent effects from running multiple times
  const isMounted = useRef(false);
  const deviceId = getDeviceId();
  
  // Check if this is a new device - only run once when mounted and when user changes
  useEffect(() => {
    if (!user) return;
    
    // Only check for new device once
    if (!isMounted.current) {
      const newDevice = isNewDevice();
      setIsOnNewDevice(newDevice);
      
      if (newDevice) {
        toast({
          title: "New device detected",
          description: "Your watch progress will be synced across your devices.",
        });
      }
      
      isMounted.current = true;
    }
  }, [user, toast]);
  
  // Sync watch history
  const syncHistory = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsSyncing(true);
      const history = await syncWatchHistory();
      setWatchHistory(history);
      setLastSynced(new Date());
    } catch (error) {
      console.error('Failed to sync history:', error);
      toast({
        title: "Sync failed",
        description: "Failed to synchronize your watch history. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
    }
  }, [user, toast]);
  
  // Load continue watching content
  const loadContinueWatching = useCallback(async () => {
    if (!user) {
      setContinueWatchingContent([]);
      return;
    }
    
    try {
      const content = await getContinueWatching();
      setContinueWatchingContent(content);
    } catch (error) {
      console.error('Failed to load continue watching:', error);
    }
  }, [user]);
  
  // Update progress for a specific content
  const updateProgress = useCallback(async (contentId: number, progress: number) => {
    if (!user) return false;
    
    try {
      return await updateWatchProgress(contentId, progress);
    } catch (error) {
      console.error('Failed to update progress:', error);
      return false;
    }
  }, [user]);
  
  // Get progress for a specific content
  const getProgress = useCallback(async (contentId: number) => {
    if (!user) return 0;
    
    try {
      return await getWatchProgress(contentId);
    } catch (error) {
      console.error('Failed to get progress:', error);
      return 0;
    }
  }, [user]);
  
  // Create a ref outside of the effect
  const shouldSyncRef = useRef(true);
  
  // Initial sync when component mounts or user changes
  useEffect(() => {
    if (!user) return;
    
    if (shouldSyncRef.current) {
      // Only run once per user change
      syncHistory();
      loadContinueWatching();
      shouldSyncRef.current = false;
    }
    
    // When user changes, reset the flag to allow syncing again
    return () => {
      shouldSyncRef.current = true;
    };
  }, [user, syncHistory, loadContinueWatching]);
  
  // Function to update the last device used
  const updateDeviceInfo = useCallback(() => {
    if (!user) return;
    
    updateLastDevice();
    setIsOnNewDevice(false);
    
    toast({
      title: "Device synced",
      description: "Your watching progress will be synced from this device.",
    });
  }, [user, toast]);

  return {
    deviceId,
    isOnNewDevice,
    isSyncing,
    lastSynced,
    watchHistory,
    continueWatchingContent,
    syncHistory,
    updateProgress,
    getProgress,
    loadContinueWatching,
    updateLastDevice: updateDeviceInfo
  };
}