import { ContentItem } from "@shared/types";

// Scoring weights for different recommendation factors
const WEIGHTS = {
  GENRE_MATCH: 3,
  CATEGORY_MATCH: 2.5,
  TAG_MATCH: 2,
  CONTENT_TYPE_MATCH: 1.5,
  COMPLETION_BONUS: 2,
  RECENCY_BONUS: 1.5,
  POPULARITY_SCORE: 1,
  PREMIUM_PREFERENCE: 0.8,
  DURATION_PREFERENCE: 0.5
};

interface WatchHistoryItem {
  contentId: number;
  watchedAt: string; // ISO string date
  watchTimePercentage: number; // 0-100
  completed: boolean;
}

interface UserPreferences {
  favoriteGenres?: string[];
  favoriteCategories?: string[];
  favoriteContentTypes?: string[];
  favoriteTags?: string[];
  preferredDuration?: 'short' | 'medium' | 'long';
  ratingsMap?: Record<number, number>; // contentId -> rating (1-5)
  isPremium?: boolean;
}

/**
 * Calculate a similarity score between two content items based on matching attributes
 */
function calculateSimilarity(item1: ContentItem, item2: ContentItem): number {
  let score = 0;

  // Genre similarity (if applicable)
  if (item1.genre && item2.genre && item1.genre === item2.genre) {
    score += WEIGHTS.GENRE_MATCH;
  }

  // Category similarity
  if (item1.category && item2.category && item1.category === item2.category) {
    score += WEIGHTS.CATEGORY_MATCH;
  }

  // Content type similarity
  if (item1.contentType && item2.contentType && item1.contentType === item2.contentType) {
    score += WEIGHTS.CONTENT_TYPE_MATCH;
  }

  // Tag similarity (if tags exist)
  if (item1.tags && item2.tags) {
    const item1Tags = new Set(item1.tags);
    const item2Tags = new Set(item2.tags);
    
    // Calculate Jaccard similarity of tags
    const intersection = new Set([...item1Tags].filter(tag => item2Tags.has(tag)));
    const union = new Set([...item1Tags, ...item2Tags]);
    
    if (union.size > 0) {
      const tagSimilarity = intersection.size / union.size;
      score += tagSimilarity * WEIGHTS.TAG_MATCH;
    }
  }

  // Duration similarity (bucketed)
  if (item1.duration && item2.duration) {
    const durationDiff = Math.abs(item1.duration - item2.duration);
    // Similar duration (within 10 minutes)
    if (durationDiff < 600) {
      score += WEIGHTS.DURATION_PREFERENCE;
    } 
    // Somewhat similar (within 20 minutes)
    else if (durationDiff < 1200) {
      score += WEIGHTS.DURATION_PREFERENCE * 0.5;
    }
  }

  return score;
}

/**
 * Get duration preference bucket
 */
function getDurationBucket(duration: number): 'short' | 'medium' | 'long' {
  if (duration < 900) return 'short'; // Less than 15 minutes
  if (duration < 3600) return 'medium'; // Less than 1 hour
  return 'long'; // 1 hour or more
}

/**
 * Generate content recommendations based on watch history and user preferences
 */
export function generateRecommendations(
  allContent: ContentItem[],
  watchHistory: WatchHistoryItem[] = [],
  userPreferences: UserPreferences = {},
  limit: number = 10
): ContentItem[] {
  if (!allContent.length) return [];
  
  // Extract watched content IDs
  const watchedContentIds = new Set(watchHistory.map(item => item.contentId));
  
  // Filter out already fully watched content (unless specifically looking for similar content)
  const unwatchedContent = allContent.filter(item => !watchedContentIds.has(item.id));
  
  // Create content score map
  const contentScores: Map<number, number> = new Map();
  
  // Initialize with base scores
  unwatchedContent.forEach(item => {
    let score = 0;
    
    // Add popularity score if available
    if (item.popularity) {
      score += (item.popularity / 100) * WEIGHTS.POPULARITY_SCORE;
    }
    
    // Premium content preference
    if (userPreferences.isPremium !== undefined) {
      // If user is premium and content is premium, boost score
      if (userPreferences.isPremium && item.isPremium) {
        score += WEIGHTS.PREMIUM_PREFERENCE;
      }
      // If user is not premium and content is not premium, also boost score
      else if (!userPreferences.isPremium && !item.isPremium) {
        score += WEIGHTS.PREMIUM_PREFERENCE;
      }
    }
    
    // Preferred duration
    if (userPreferences.preferredDuration && item.duration) {
      const durationBucket = getDurationBucket(item.duration);
      if (durationBucket === userPreferences.preferredDuration) {
        score += WEIGHTS.DURATION_PREFERENCE;
      }
    }
    
    // Genre preferences
    if (userPreferences.favoriteGenres && item.genre) {
      if (userPreferences.favoriteGenres.includes(item.genre)) {
        score += WEIGHTS.GENRE_MATCH;
      }
    }
    
    // Category preferences
    if (userPreferences.favoriteCategories && item.category) {
      if (userPreferences.favoriteCategories.includes(item.category)) {
        score += WEIGHTS.CATEGORY_MATCH;
      }
    }
    
    // Content type preferences
    if (userPreferences.favoriteContentTypes && item.contentType) {
      if (userPreferences.favoriteContentTypes.includes(item.contentType)) {
        score += WEIGHTS.CONTENT_TYPE_MATCH;
      }
    }
    
    // Tag preferences
    if (userPreferences.favoriteTags && item.tags) {
      const matchingTags = item.tags.filter(tag => 
        userPreferences.favoriteTags?.includes(tag)
      );
      
      if (matchingTags.length > 0) {
        score += (matchingTags.length / item.tags.length) * WEIGHTS.TAG_MATCH;
      }
    }
    
    contentScores.set(item.id, score);
  });
  
  // Calculate collaborative similarity scores based on watch history
  if (watchHistory.length > 0) {
    // Get watched content details
    const watchedContent = allContent.filter(item => watchedContentIds.has(item.id));
    
    // Process each unwatched content item
    unwatchedContent.forEach(unwatchedItem => {
      // Calculate similarity to each watched item
      watchedContent.forEach(watchedItem => {
        // Find watch details for this watched item
        const watchDetail = watchHistory.find(h => h.contentId === watchedItem.id);
        if (!watchDetail) return;
        
        // Calculate similarity score
        let similarity = calculateSimilarity(unwatchedItem, watchedItem);
        
        // Apply completion bonus if the user finished watching this content
        if (watchDetail.completed) {
          similarity *= WEIGHTS.COMPLETION_BONUS;
        } else {
          // Scale by watch percentage (more weight to items watched longer)
          similarity *= (watchDetail.watchTimePercentage / 100) * 0.8;
        }
        
        // Apply recency bonus (more weight to recently watched)
        const watchedDate = new Date(watchDetail.watchedAt);
        const currentDate = new Date();
        const daysSinceWatched = (currentDate.getTime() - watchedDate.getTime()) / (1000 * 3600 * 24);
        
        // Exponential decay for older watch history
        const recencyFactor = Math.exp(-0.1 * daysSinceWatched);
        similarity *= 1 + (recencyFactor * WEIGHTS.RECENCY_BONUS);
        
        // Add to total score
        const currentScore = contentScores.get(unwatchedItem.id) || 0;
        contentScores.set(unwatchedItem.id, currentScore + similarity);
      });
    });
  }
  
  // If user has ratings, incorporate them
  if (userPreferences.ratingsMap) {
    // Find similar content to highly rated items
    for (const [ratedContentId, rating] of Object.entries(userPreferences.ratingsMap)) {
      const numRating = Number(rating);
      // Only boost for ratings 4 or 5
      if (numRating >= 4) {
        const ratedContent = allContent.find(item => item.id === Number(ratedContentId));
        if (ratedContent) {
          // Calculate similarity to all unwatched items
          unwatchedContent.forEach(unwatchedItem => {
            const similarity = calculateSimilarity(unwatchedItem, ratedContent);
            // Scale by rating (5 star gets full weight, 4 star gets 80%)
            const ratingFactor = numRating / 5;
            
            // Add to score
            const currentScore = contentScores.get(unwatchedItem.id) || 0;
            contentScores.set(unwatchedItem.id, currentScore + (similarity * ratingFactor));
          });
        }
      }
    }
  }
  
  // Sort content by score and return top recommendations
  return unwatchedContent
    .sort((a, b) => {
      const scoreA = contentScores.get(a.id) || 0;
      const scoreB = contentScores.get(b.id) || 0;
      return scoreB - scoreA;
    })
    .slice(0, limit);
}

/**
 * Extract user preferences based on watch history and ratings
 */
export function extractUserPreferences(
  watchHistory: WatchHistoryItem[],
  allContent: ContentItem[],
  existingRatings: Record<number, number> = {}
): UserPreferences {
  // Get content details for watched items
  const watchedContent = allContent.filter(item => 
    watchHistory.some(h => h.contentId === item.id)
  );
  
  if (!watchedContent.length) return {};
  
  // Count occurrences of each genre, category, etc.
  const genreCounts: Record<string, number> = {};
  const categoryCounts: Record<string, number> = {};
  const contentTypeCounts: Record<string, number> = {};
  const tagCounts: Record<string, number> = {};
  
  // Duration preferences tracking
  const durationBuckets: Record<string, number> = {
    short: 0,
    medium: 0, 
    long: 0
  };
  
  // Track premium vs free preferences
  let premiumCount = 0;
  let freeCount = 0;
  
  // Process each watched item
  watchedContent.forEach(item => {
    // Find corresponding watch history entry
    const watchDetail = watchHistory.find(h => h.contentId === item.id);
    if (!watchDetail) return;
    
    // Weight based on completion and watch time
    const weight = watchDetail.completed 
      ? 2 
      : (watchDetail.watchTimePercentage / 100);
    
    // Count genres
    if (item.genre) {
      genreCounts[item.genre] = (genreCounts[item.genre] || 0) + weight;
    }
    
    // Count categories
    if (item.category) {
      categoryCounts[item.category] = (categoryCounts[item.category] || 0) + weight;
    }
    
    // Count content types
    if (item.contentType) {
      contentTypeCounts[item.contentType] = (contentTypeCounts[item.contentType] || 0) + weight;
    }
    
    // Count tags
    if (item.tags && item.tags.length) {
      item.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + (weight / item.tags.length);
      });
    }
    
    // Track duration preferences
    if (item.duration) {
      const bucket = getDurationBucket(item.duration);
      durationBuckets[bucket] += weight;
    }
    
    // Track premium vs free
    if (item.isPremium) {
      premiumCount += weight;
    } else {
      freeCount += weight;
    }
  });
  
  // Sort each category by count
  const sortedGenres = Object.entries(genreCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([genre]) => genre);
    
  const sortedCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([category]) => category);
    
  const sortedContentTypes = Object.entries(contentTypeCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([type]) => type);
    
  const sortedTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10) // Limit to top 10 tags
    .map(([tag]) => tag);
  
  // Determine preferred duration
  const preferredDuration = Object.entries(durationBuckets)
    .sort((a, b) => b[1] - a[1])[0][0] as 'short' | 'medium' | 'long';
  
  // Determine premium preference based on watch history
  const isPremiumPreferred = premiumCount > freeCount;
  
  return {
    favoriteGenres: sortedGenres.length ? sortedGenres : undefined,
    favoriteCategories: sortedCategories.length ? sortedCategories : undefined,
    favoriteContentTypes: sortedContentTypes.length ? sortedContentTypes : undefined,
    favoriteTags: sortedTags.length ? sortedTags : undefined,
    preferredDuration,
    ratingsMap: Object.keys(existingRatings).length ? existingRatings : undefined,
    isPremium: isPremiumPreferred
  };
}