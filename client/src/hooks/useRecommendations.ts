import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useQuery } from '@tanstack/react-query';
import { getRecommendedContent, getSimilarContent, getTrendingContent } from '@/lib/recommendationEngine';
import { ContentItem } from '@shared/types';
import { useAuth } from '@/contexts/AuthContext';

export function useRecommendations() {
  const { user } = useAuth();
  const [recommendedContent, setRecommendedContent] = useState<ContentItem[]>([]);
  const [trendingContent, setTrendingContent] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all content
  const { data: allContent = [] as ContentItem[] } = useQuery<ContentItem[]>({
    queryKey: ['/api/content'],
  });

  // Fetch user's watch history
  const { data: watchHistory = [] as ContentItem[] } = useQuery<ContentItem[]>({
    queryKey: ['/api/watch-history', user?.id],
    enabled: !!user,
  });

  // Fetch user's watchlist
  const { data: watchlist = [] as ContentItem[] } = useQuery<ContentItem[]>({
    queryKey: ['/api/watchlist', user?.id],
    enabled: !!user,
  });

  // Generate recommendations
  useEffect(() => {
    const generateRecommendations = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const contentData = allContent as ContentItem[];
        const historyData = watchHistory as ContentItem[];
        const watchlistData = watchlist as ContentItem[];

        // Generate recommendations if we have content
        if (contentData.length > 0) {
          const recommended = getRecommendedContent(
            contentData,
            historyData,
            watchlistData,
            10
          );
          setRecommendedContent(recommended);

          // Generate trending based on all watch history
          // In a real application, this would be pre-calculated on the server
          const trending = getTrendingContent(
            contentData,
            historyData, // In real app, this would be all users' history
            10
          );
          setTrendingContent(trending);
        }
      } catch (err) {
        console.error('Error generating recommendations:', err);
        setError('Failed to generate recommendations');
      } finally {
        setIsLoading(false);
      }
    };

    generateRecommendations();
  }, [user?.id, allContent, watchHistory, watchlist]);

  /**
   * Get content similar to a specific item
   */
  const getSimilarContentItems = (content: ContentItem, limit = 5): ContentItem[] => {
    if (!content) return [];
    return getSimilarContent(content, allContent as ContentItem[], limit);
  };

  return {
    recommendedContent,
    trendingContent,
    getSimilarContentItems,
    isLoading,
    error
  };
}