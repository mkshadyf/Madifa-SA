import { ContentItem, CategoryItem } from '@shared/types';
import { calculateSimilarity } from './utils';

// Weights for different factors in recommendation
const WEIGHTS = {
  CATEGORY_MATCH: 3,
  RATING_MATCH: 1,
  RELEASE_YEAR_PROXIMITY: 0.5,
  ALREADY_WATCHED: -5,
  IN_WATCHLIST: -3
};

/**
 * Calculate a recommendation score for a content item based on user history
 * @param content The content item to score
 * @param watchHistory Array of content items the user has watched
 * @param watchlist Array of content items in the user's watchlist
 * @returns A numerical score (higher = more recommended)
 */
export function calculateRecommendationScore(
  content: ContentItem,
  watchHistory: ContentItem[],
  watchlist: ContentItem[]
): number {
  let score = 0;
  
  // Check if already watched - give negative score to avoid repeats
  const alreadyWatched = watchHistory.some(item => item.id === content.id);
  if (alreadyWatched) {
    score += WEIGHTS.ALREADY_WATCHED;
  }
  
  // Check if already in watchlist - give negative score
  const inWatchlist = watchlist.some(item => item.id === content.id);
  if (inWatchlist) {
    score += WEIGHTS.IN_WATCHLIST;
  }
  
  // Find most-watched categories
  const categoryFrequency: Record<number, number> = {};
  watchHistory.forEach(item => {
    categoryFrequency[item.categoryId] = (categoryFrequency[item.categoryId] || 0) + 1;
  });
  
  // Category match
  if (categoryFrequency[content.categoryId]) {
    score += WEIGHTS.CATEGORY_MATCH * categoryFrequency[content.categoryId];
  }
  
  // Find similar items in watch history
  const similarityScores = watchHistory.map(historyItem => {
    // Skip if it's the same content
    if (historyItem.id === content.id) return 0;
    
    let itemScore = 0;
    
    // Rating similarity
    if (historyItem.rating && content.rating && historyItem.rating === content.rating) {
      itemScore += WEIGHTS.RATING_MATCH;
    }
    
    // Release year proximity
    const yearDiff = Math.abs(historyItem.releaseYear - content.releaseYear);
    itemScore += WEIGHTS.RELEASE_YEAR_PROXIMITY * (10 - Math.min(yearDiff, 10)) / 10;
    
    return itemScore;
  });
  
  // Add average similarity score
  if (similarityScores.length > 0) {
    const avgSimilarity = similarityScores.reduce((sum, score) => sum + score, 0) / similarityScores.length;
    score += avgSimilarity;
  }
  
  return score;
}

/**
 * Get recommended content for a user based on their history
 * @param allContent Array of all available content items
 * @param watchHistory Array of content the user has watched
 * @param watchlist Array of content in the user's watchlist
 * @param limit Maximum number of recommendations to return
 * @returns Array of recommended content items with scores
 */
export function getRecommendedContent(
  allContent: ContentItem[],
  watchHistory: ContentItem[] = [],
  watchlist: ContentItem[] = [],
  limit: number = 10
): ContentItem[] {
  // If no watch history, return random popular content
  if (watchHistory.length === 0) {
    return allContent
      .filter(item => !watchlist.some(wItem => wItem.id === item.id))
      .sort(() => 0.5 - Math.random())
      .slice(0, limit);
  }
  
  // Calculate scores for each item
  const scoredContent = allContent.map(item => ({
    ...item,
    recommendationScore: calculateRecommendationScore(item, watchHistory, watchlist)
  }));
  
  // Sort by score (higher is better) and take the top items
  return scoredContent
    .sort((a, b) => (b.recommendationScore || 0) - (a.recommendationScore || 0))
    .slice(0, limit);
}

/**
 * Get content similar to a specific item
 * @param content The content item to find similar content for
 * @param allContent All available content items
 * @param limit Maximum number of similar items to return
 * @returns Array of similar content items
 */
export function getSimilarContent(
  content: ContentItem,
  allContent: ContentItem[],
  limit: number = 5
): ContentItem[] {
  if (!content) return [];
  
  // Filter out the current content
  const otherContent = allContent.filter(item => item.id !== content.id);
  
  // Calculate similarity scores
  const similarContent = otherContent.map(item => ({
    ...item,
    similarityScore: (
      // Same category is most important
      (item.categoryId === content.categoryId ? 5 : 0) +
      // Similar release year
      (Math.max(0, 10 - Math.abs(item.releaseYear - content.releaseYear)) * 0.3) +
      // Similar rating
      (item.rating === content.rating ? 2 : 0) +
      // Similar premium status
      (item.isPremium === content.isPremium ? 1 : 0)
    )
  }));
  
  // Sort by similarity score and return top results
  return similarContent
    .sort((a, b) => (b.similarityScore || 0) - (a.similarityScore || 0))
    .slice(0, limit);
}

/**
 * Get trending content based on watch history frequency
 * @param allContent All available content
 * @param allWatchHistory Combined watch history of all users
 * @param limit Maximum number of trending items to return
 * @returns Array of trending content items
 */
export function getTrendingContent(
  allContent: ContentItem[],
  allWatchHistory: ContentItem[],
  limit: number = 10
): ContentItem[] {
  // Count watches per content
  const watchCounts: Record<number, number> = {};
  allWatchHistory.forEach(item => {
    watchCounts[item.id] = (watchCounts[item.id] || 0) + 1;
  });
  
  // Add watch count to content
  const contentWithCounts = allContent.map(item => ({
    ...item,
    watchCount: watchCounts[item.id] || 0
  }));
  
  // Sort by watch count
  return contentWithCounts
    .sort((a, b) => b.watchCount - a.watchCount)
    .slice(0, limit);
}