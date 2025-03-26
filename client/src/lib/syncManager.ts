import { ContentItem } from '@shared/types';
import { apiRequest } from './queryClient';
import { WatchHistory } from '@shared/schema';

// Interface for sync data
interface SyncData {
  lastDevice: string;
  lastUpdated: string;
  deviceId: string;
}

// Local storage keys
const DEVICE_ID_KEY = 'madifa_device_id';
const SYNC_DATA_KEY = 'madifa_sync_data';

/**
 * Generate a unique device ID if one doesn't exist
 */
export function getDeviceId(): string {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  
  if (!deviceId) {
    // Generate a unique device ID
    deviceId = `device_${Math.random().toString(36).substring(2, 15)}_${Date.now().toString(36)}`;
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  
  return deviceId;
}

/**
 * Get sync data from localStorage
 */
export function getSyncData(): SyncData | null {
  try {
    const syncDataStr = localStorage.getItem(SYNC_DATA_KEY);
    if (!syncDataStr) return null;
    
    return JSON.parse(syncDataStr) as SyncData;
  } catch (error) {
    console.error('Failed to get sync data:', error);
    return null;
  }
}

/**
 * Save sync data to localStorage
 */
export function saveSyncData(data: SyncData): void {
  try {
    localStorage.setItem(SYNC_DATA_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save sync data:', error);
  }
}

/**
 * Update the last device and timestamp
 */
export function updateLastDevice(): void {
  const deviceId = getDeviceId();
  const syncData: SyncData = {
    lastDevice: deviceId,
    lastUpdated: new Date().toISOString(),
    deviceId
  };
  
  saveSyncData(syncData);
}

/**
 * Check if this is a new device compared to the last one used
 */
export function isNewDevice(): boolean {
  const deviceId = getDeviceId();
  const syncData = getSyncData();
  
  if (!syncData) return false;
  return syncData.lastDevice !== deviceId;
}

/**
 * Sync watch history with server
 */
export async function syncWatchHistory(): Promise<WatchHistory[]> {
  try {
    const response = await apiRequest('GET', '/api/history/sync');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to sync watch history:', error);
    return [];
  }
}

/**
 * Get the watch progress for a specific content
 */
export async function getWatchProgress(contentId: number): Promise<number> {
  try {
    const response = await apiRequest('GET', `/api/history/${contentId}`);
    if (!response.ok) return 0;
    
    const data = await response.json();
    return data.progress || 0;
  } catch (error) {
    console.error('Failed to get watch progress:', error);
    return 0;
  }
}

/**
 * Update watch progress for a specific content
 */
export async function updateWatchProgress(
  contentId: number, 
  progress: number
): Promise<boolean> {
  // Update last device
  updateLastDevice();
  
  try {
    const response = await apiRequest('POST', '/api/history', {
      contentId,
      progress,
      deviceId: getDeviceId()
    });
    
    return response.ok;
  } catch (error) {
    console.error('Failed to update watch progress:', error);
    return false;
  }
}

/**
 * Get content that can be continued watching
 */
export async function getContinueWatching(): Promise<ContentItem[]> {
  try {
    const response = await apiRequest('GET', '/api/history/continue-watching');
    if (!response.ok) return [];
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to get continue watching:', error);
    return [];
  }
}

/**
 * Clear all sync data
 */
export function clearSyncData(): void {
  localStorage.removeItem(SYNC_DATA_KEY);
}