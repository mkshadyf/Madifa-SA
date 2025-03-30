import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names with Tailwind's merge function
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Calculate video progress percentage 
 */
export function calculateProgress(currentTime: number, duration: number): number {
  if (duration === 0) return 0;
  return (currentTime / duration) * 100;
}

/**
 * Format duration for display (mm:ss or hh:mm:ss)
 */
export function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format view count for display (e.g., 1.2k, 2.3M)
 */
export function formatViewCount(count: number): string {
  if (count < 1000) return count.toString();
  if (count < 1000000) return `${(count / 1000).toFixed(1)}k`;
  return `${(count / 1000000).toFixed(1)}M`;
}

/**
 * Format release date (YYYY-MM-DD) to display format
 */
export function formatReleaseDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  } catch (error) {
    return dateString;
  }
}

/**
 * Get elapsed time since date (e.g., "2 days ago")
 */
export function getElapsedTime(dateString: string): string {
  try {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
      }
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 30) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 365) {
      const diffMonths = Math.floor(diffDays / 30);
      return `${diffMonths} month${diffMonths !== 1 ? 's' : ''} ago`;
    } else {
      const diffYears = Math.floor(diffDays / 365);
      return `${diffYears} year${diffYears !== 1 ? 's' : ''} ago`;
    }
  } catch (error) {
    return 'Unknown date';
  }
}

/**
 * Extract year from date string
 */
export function extractYear(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.getFullYear().toString();
  } catch (error) {
    return '';
  }
}

/**
 * Convert minutes to hours and minutes display
 */
export function convertMinutesToHoursAndMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

/**
 * Truncate text with ellipsis if too long
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Generate random ID
 */
export function generateRandomId(): string {
  return Math.random().toString(36).substring(2, 15);
}

/**
 * Filter bad words from text (simplistic implementation)
 */
export function filterBadWords(text: string): string {
  const badWords = ['badword1', 'badword2', 'badword3'];
  let filteredText = text;
  
  badWords.forEach(word => {
    const regex = new RegExp(word, 'gi');
    filteredText = filteredText.replace(regex, '*'.repeat(word.length));
  });
  
  return filteredText;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Check if a URL is valid
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Generate avatar URL from username or email
 */
export function generateAvatarUrl(identifier: string): string {
  // Use either UI Avatars or Dicebear API
  const encodedIdentifier = encodeURIComponent(identifier);
  return `https://ui-avatars.com/api/?name=${encodedIdentifier}&background=random&size=200`;
}

/**
 * Parse video URL to extract provider and video ID
 */
export function parseVideoUrl(url: string): { provider: string; id: string; directUrl?: string } | null {
  if (!url) return null;

  try {
    // Vimeo URL patterns
    const vimeoPatterns = [
      /vimeo\.com\/(\d+)/,                   // vimeo.com/123456789
      /vimeo\.com\/channels\/[^\/]+\/(\d+)/, // vimeo.com/channels/channel/123456789
      /vimeo\.com\/groups\/[^\/]+\/videos\/(\d+)/, // vimeo.com/groups/group/videos/123456789
      /player\.vimeo\.com\/video\/(\d+)/     // player.vimeo.com/video/123456789
    ];

    // YouTube URL patterns
    const youtubePatterns = [
      /youtube\.com\/watch\?v=([^&]+)/,      // youtube.com/watch?v=abc123
      /youtube\.com\/embed\/([^?]+)/,        // youtube.com/embed/abc123
      /youtube\.com\/v\/([^?]+)/,            // youtube.com/v/abc123
      /youtu\.be\/([^?]+)/                   // youtu.be/abc123
    ];

    // Check Vimeo patterns
    for (const pattern of vimeoPatterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return { provider: 'vimeo', id: match[1] };
      }
    }

    // Check YouTube patterns
    for (const pattern of youtubePatterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return { provider: 'youtube', id: match[1] };
      }
    }

    // Check for direct URLs to media files
    const directVideoPattern = /\.(mp4|webm|ogg|mov|m3u8|mpd)($|\?)/i;
    if (url.match(directVideoPattern)) {
      return { 
        provider: 'direct', 
        id: new URL(url).pathname.split('/').pop() || '',
        directUrl: url
      };
    }

    // Unknown URL type
    return null;
  } catch (error) {
    console.error('Error parsing video URL:', error);
    return null;
  }
}

/**
 * Get the MIME type for a video file based on extension
 */
export function getVideoMimeType(url: string): string {
  // Default to MP4 if no extension is found
  if (!url) return 'video/mp4';
  
  // Check file extension
  if (url.endsWith('.mp4')) return 'video/mp4';
  if (url.endsWith('.webm')) return 'video/webm';
  if (url.endsWith('.ogg') || url.endsWith('.ogv')) return 'video/ogg';
  if (url.endsWith('.mov')) return 'video/quicktime';
  if (url.endsWith('.m3u8')) return 'application/x-mpegURL';
  if (url.endsWith('.mpd')) return 'application/dash+xml';
  
  // Handle URLs with query parameters
  const urlWithoutParams = url.split('?')[0];
  if (urlWithoutParams.endsWith('.mp4')) return 'video/mp4';
  if (urlWithoutParams.endsWith('.webm')) return 'video/webm';
  if (urlWithoutParams.endsWith('.ogg') || urlWithoutParams.endsWith('.ogv')) return 'video/ogg';
  if (urlWithoutParams.endsWith('.mov')) return 'video/quicktime';
  if (urlWithoutParams.endsWith('.m3u8')) return 'application/x-mpegURL';
  if (urlWithoutParams.endsWith('.mpd')) return 'application/dash+xml';
  
  // Default to MP4
  return 'video/mp4';
}

/**
 * Format date for display
 */
export function formatDate(date: Date | string, format: string = 'medium'): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Return invalid date as empty string
  if (isNaN(dateObj.getTime())) return '';
  
  try {
    switch (format) {
      case 'short':
        return dateObj.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
      case 'medium':
        return dateObj.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        });
      case 'long':
        return dateObj.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        });
      case 'numeric':
        return dateObj.toLocaleDateString('en-US', {
          month: 'numeric',
          day: 'numeric',
          year: 'numeric'
        });
      case 'year':
        return dateObj.getFullYear().toString();
      case 'month-year':
        return dateObj.toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric'
        });
      case 'time':
        return dateObj.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        });
      case 'datetime':
        return `${dateObj.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })} ${dateObj.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        })}`;
      case 'iso':
        return dateObj.toISOString();
      default:
        return dateObj.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        });
    }
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
}