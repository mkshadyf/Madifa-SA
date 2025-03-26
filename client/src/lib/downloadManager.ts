import { ContentItem } from '@shared/types';

// Interface for downloads stored in localStorage
export interface DownloadedContent extends ContentItem {
  downloadDate: string;
  downloadProgress: number; // 0-100
  localUrl?: string; // URL to locally stored content (if download complete)
  downloadState: 'pending' | 'downloading' | 'complete' | 'error';
  errorMessage?: string;
  expiryDate?: string; // When the download expires (for premium content)
}

// LocalStorage key
const DOWNLOADS_STORAGE_KEY = 'madifa_downloads';

/**
 * Get all downloaded content
 */
export function getDownloadedContent(): DownloadedContent[] {
  try {
    const storedDownloads = localStorage.getItem(DOWNLOADS_STORAGE_KEY);
    if (!storedDownloads) return [];
    
    const downloads = JSON.parse(storedDownloads) as DownloadedContent[];
    return downloads;
  } catch (error) {
    console.error('Failed to get downloaded content:', error);
    return [];
  }
}

/**
 * Check if content is downloaded
 */
export function isContentDownloaded(contentId: number): boolean {
  const downloads = getDownloadedContent();
  return downloads.some(item => 
    item.id === contentId && 
    item.downloadState === 'complete'
  );
}

/**
 * Get download state for a specific content
 */
export function getDownloadState(contentId: number): DownloadedContent | undefined {
  const downloads = getDownloadedContent();
  return downloads.find(item => item.id === contentId);
}

/**
 * Save download state to localStorage
 */
function saveDownloads(downloads: DownloadedContent[]): void {
  try {
    localStorage.setItem(DOWNLOADS_STORAGE_KEY, JSON.stringify(downloads));
  } catch (error) {
    console.error('Failed to save downloads:', error);
  }
}

/**
 * Update download progress
 */
export function updateDownloadProgress(contentId: number, progress: number): void {
  const downloads = getDownloadedContent();
  const index = downloads.findIndex(item => item.id === contentId);
  
  if (index >= 0) {
    downloads[index].downloadProgress = Math.min(Math.max(progress, 0), 100);
    if (progress >= 100) {
      downloads[index].downloadState = 'complete';
    }
    saveDownloads(downloads);
  }
}

/**
 * Start download process for a content item
 */
export async function downloadContent(content: ContentItem, isPremium: boolean = false): Promise<boolean> {
  // Check if already downloaded or in progress
  const existingDownload = getDownloadState(content.id);
  if (existingDownload && ['downloading', 'complete'].includes(existingDownload.downloadState)) {
    return true; // Already downloaded or in progress
  }
  
  try {
    // Create a new download entry
    const downloadEntry: DownloadedContent = {
      ...content,
      downloadDate: new Date().toISOString(),
      downloadProgress: 0,
      downloadState: 'downloading',
      // If premium content, set expiry to 30 days from now
      expiryDate: isPremium 
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        : undefined
    };
    
    // Add to downloads list
    const downloads = getDownloadedContent();
    const updatedDownloads = [...downloads.filter(d => d.id !== content.id), downloadEntry];
    saveDownloads(updatedDownloads);
    
    // Simulate download progress (in real app, this would be an actual download)
    await simulateDownload(content.id);
    
    return true;
  } catch (error) {
    console.error('Download failed:', error);
    // Update download state to error
    const downloads = getDownloadedContent();
    const index = downloads.findIndex(item => item.id === content.id);
    
    if (index >= 0) {
      downloads[index].downloadState = 'error';
      downloads[index].errorMessage = error instanceof Error ? error.message : 'Unknown error';
      saveDownloads(downloads);
    }
    
    return false;
  }
}

/**
 * Remove a downloaded content
 */
export function removeDownload(contentId: number): boolean {
  try {
    const downloads = getDownloadedContent();
    const updatedDownloads = downloads.filter(item => item.id !== contentId);
    saveDownloads(updatedDownloads);
    return true;
  } catch (error) {
    console.error('Failed to remove download:', error);
    return false;
  }
}

/**
 * Clear all downloads
 */
export function clearAllDownloads(): boolean {
  try {
    localStorage.removeItem(DOWNLOADS_STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Failed to clear downloads:', error);
    return false;
  }
}

/**
 * Helper: Simulate download progress (for demo purposes)
 */
async function simulateDownload(contentId: number): Promise<void> {
  const totalSteps = 10;
  const stepSize = 100 / totalSteps;
  
  for (let step = 1; step <= totalSteps; step++) {
    // Wait for a random time between 200-700ms
    await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 500));
    
    // Update progress
    updateDownloadProgress(contentId, step * stepSize);
  }
  
  // Set the localUrl for completed download (in a real app, this would be a blob URL or file path)
  const downloads = getDownloadedContent();
  const index = downloads.findIndex(item => item.id === contentId);
  
  if (index >= 0) {
    downloads[index].localUrl = downloads[index].videoUrl;
    saveDownloads(downloads);
  }
}