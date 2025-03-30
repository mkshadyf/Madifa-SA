import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ContentItem } from "@shared/types";
import { generateRecommendations, extractUserPreferences } from "@/utils/recommendationEngine";
import { useAuth } from "@/contexts/AuthContext";

interface UseRecommendationsOptions {
  contentType?: string; // Filter recommendations by content type
  limit?: number;
  enabled?: boolean;
}

// Hook to manage personalized content recommendations
export function useRecommendations({ 
  contentType, 
  limit = 10,
  enabled = true
}: UseRecommendationsOptions = {}) {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<ContentItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch all content
  const { data: allContent, isLoading: isLoadingContent } = useQuery({
    queryKey: ['/api/contents'],
    enabled
  });

  // Fetch watch history for the current user
  const { data: watchHistory, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['/api/user/watch-history'],
    enabled: enabled && !!user
  });

  // Fetch user ratings
  const { data: ratings, isLoading: isLoadingRatings } = useQuery({
    queryKey: ['/api/user/ratings'],
    enabled: enabled && !!user
  });

  // Generate recommendations whenever dependencies change
  useEffect(() => {
    if (!enabled || isLoadingContent || (!!user && (isLoadingHistory || isLoadingRatings))) {
      return;
    }

    setIsGenerating(true);

    try {
      // Process content data
      const processedContent = allContent || [];
      
      // Filter by content type if specified
      const filteredContent = contentType 
        ? processedContent.filter((item: ContentItem) => item.contentType === contentType)
        : processedContent;
      
      if (user && watchHistory && ratings) {
        // When logged in, use personalized recommendations
        const processedWatchHistory = watchHistory.map((item: any) => ({
          contentId: item.contentId,
          watchedAt: item.updatedAt || item.createdAt,
          watchTimePercentage: item.progress || 0,
          completed: item.completed || false
        }));
        
        // Process ratings into a map format
        const ratingsMap: Record<number, number> = {};
        ratings.forEach((rating: any) => {
          ratingsMap[rating.contentId] = rating.rating;
        });
        
        // Extract user preferences
        const userPreferences = extractUserPreferences(
          processedWatchHistory,
          filteredContent as ContentItem[],
          ratingsMap
        );
        
        // Generate personalized recommendations
        const personalizedRecommendations = generateRecommendations(
          filteredContent as ContentItem[],
          processedWatchHistory,
          userPreferences,
          limit
        );
        
        setRecommendations(personalizedRecommendations);
      } else {
        // When not logged in, use simpler popularity-based recommendations
        const sortedByPopularity = [...filteredContent].sort((a: ContentItem, b: ContentItem) => {
          // Sort by popularity (if available) and then by newest
          const popularityA = a.popularity || 0;
          const popularityB = b.popularity || 0;
          
          if (popularityA !== popularityB) {
            return popularityB - popularityA;
          }
          
          // If popularity is the same, sort by newest (id as fallback)
          const dateA = a.releaseDate ? new Date(a.releaseDate).getTime() : a.id;
          const dateB = b.releaseDate ? new Date(b.releaseDate).getTime() : b.id;
          
          return dateB - dateA;
        });
        
        setRecommendations(sortedByPopularity.slice(0, limit));
      }
    } catch (error) {
      console.error("Error generating recommendations:", error);
      // Fall back to empty recommendations
      setRecommendations([]);
    } finally {
      setIsGenerating(false);
    }
  }, [
    enabled,
    allContent, 
    watchHistory, 
    ratings, 
    user, 
    contentType,
    limit,
    isLoadingContent,
    isLoadingHistory,
    isLoadingRatings
  ]);

  const isLoading = isLoadingContent || (!!user && (isLoadingHistory || isLoadingRatings)) || isGenerating;

  return {
    recommendations,
    isLoading
  };
}