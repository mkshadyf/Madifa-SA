import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format duration from seconds to "HH:MM:SS" or "MM:SS" format
export function formatDuration(seconds: number): string {
  if (!seconds) return '00:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const paddedMinutes = String(minutes).padStart(2, '0');
  const paddedSeconds = String(remainingSeconds).padStart(2, '0');

  if (hours > 0) {
    return `${hours}:${paddedMinutes}:${paddedSeconds}`;
  }
  
  return `${paddedMinutes}:${paddedSeconds}`;
}

// Format date to readable string
export function formatDate(date: Date | string): string {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-ZA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(dateObj);
}

// Get random element from array
export function getRandomElement<T>(array: T[]): T {
  if (!array || array.length === 0) return null as unknown as T;
  return array[Math.floor(Math.random() * array.length)];
}

// Calculate progress percentage
export function calculateProgress(current: number, total: number): number {
  if (!current || !total || total === 0) return 0;
  const percentage = (current / total) * 100;
  return Math.min(Math.max(percentage, 0), 100);
}

// Parse video URL to extract video ID (for various providers)
export function parseVideoUrl(url: string): { provider: string; id: string } | null {
  if (!url) return null;
  
  // YouTube
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const youtubeMatch = url.match(youtubeRegex);
  
  if (youtubeMatch) {
    return { provider: 'youtube', id: youtubeMatch[1] };
  }
  
  // Vimeo
  const vimeoRegex = /(?:vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)(?:[a-zA-Z0-9_-]+)?)/i;
  const vimeoMatch = url.match(vimeoRegex);
  
  if (vimeoMatch) {
    return { provider: 'vimeo', id: vimeoMatch[1] };
  }
  
  // Dailymotion
  const dailymotionRegex = /(?:dailymotion\.com\/(?:video\/|hub\/(?:[^\/]+)#video=)|dai\.ly\/)([a-zA-Z0-9]+)/i;
  const dailymotionMatch = url.match(dailymotionRegex);
  
  if (dailymotionMatch) {
    return { provider: 'dailymotion', id: dailymotionMatch[1] };
  }
  
  return null;
}

// Generate secure avatar URL from user initials
export function generateAvatarUrl(name: string): string {
  if (!name) return '';
  const initials = name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=8A2BE2&color=fff`;
}

// Calculate similarity between two objects with weighted properties
export function calculateSimilarity(
  objA: Record<string, any>,
  objB: Record<string, any>,
  weights: Record<string, number> = {}
): number {
  if (!objA || !objB) return 0;
  
  const keys = Object.keys(weights).length ? Object.keys(weights) : Object.keys(objA);
  let totalScore = 0;
  let maxScore = 0;
  
  for (const key of keys) {
    const weight = weights[key] || 1;
    maxScore += weight;
    
    // Skip if property doesn't exist in either object
    if (objA[key] === undefined || objB[key] === undefined) continue;
    
    // Handle different types of comparisons
    if (typeof objA[key] === 'number' && typeof objB[key] === 'number') {
      // For numeric values, calculate how close they are (normalized to 0-1)
      const max = Math.max(objA[key], objB[key]);
      const min = Math.min(objA[key], objB[key]);
      // Avoid division by zero
      const similarity = max === 0 ? (min === 0 ? 1 : 0) : 1 - ((max - min) / max);
      totalScore += similarity * weight;
    } else if (typeof objA[key] === 'string' && typeof objB[key] === 'string') {
      // For strings, exact match = 1, otherwise 0
      totalScore += (objA[key] === objB[key] ? 1 : 0) * weight;
    } else if (typeof objA[key] === 'boolean' && typeof objB[key] === 'boolean') {
      // For booleans, exact match = 1, otherwise 0
      totalScore += (objA[key] === objB[key] ? 1 : 0) * weight;
    }
  }
  
  return maxScore === 0 ? 0 : totalScore / maxScore;
}
