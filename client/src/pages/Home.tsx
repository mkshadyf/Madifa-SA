import { useState, useEffect, useCallback } from "react";
import { ContentItem, CategoryItem } from "@shared/types";
import { useAuth } from "@/contexts/AuthContext";
import { useDataSource } from "@/contexts/DataSourceContext";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useRecommendations } from "@/hooks/useRecommendations";
import { useSync } from "@/hooks/useSync";
import { 
  getMockContents, 
  getMockCategories, 
  getMockWatchHistory,
  getMockPremiumContents,
  getMockFreeContents,
  getRandomElement 
} from "@/lib/helpers";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import SubscriptionBanner from "@/components/home/SubscriptionBanner";
import ContentCarousel from "@/components/home/ContentCarousel";
import CategorySection from "@/components/home/CategorySection";

const Home = () => {
  const { user } = useAuth();
  const { dataSource } = useDataSource();
  const { toast } = useToast();
  const { recommendedContent, trendingContent: recommendedTrending, isLoading: recommendationsLoading } = useRecommendations();
  const { continueWatchingContent, loadContinueWatching } = useSync();
  
  const [featuredContent, setFeaturedContent] = useState<ContentItem | null>(null);
  const [continueWatching, setContinueWatching] = useState<ContentItem[]>([]);
  const [trendingContent, setTrendingContent] = useState<ContentItem[]>([]);
  const [freeContent, setFreeContent] = useState<ContentItem[]>([]);
  const [premiumContent, setPremiumContent] = useState<ContentItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Content organized by type
  const [movieContent, setMovieContent] = useState<ContentItem[]>([]);
  const [seriesContent, setSeriesContent] = useState<ContentItem[]>([]);
  const [trailerContent, setTrailerContent] = useState<ContentItem[]>([]);
  const [musicVideoContent, setMusicVideoContent] = useState<ContentItem[]>([]);
  
  // Memoize data fetch functions to prevent unnecessary re-renders
  const fetchMockData = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Get all contents
      const allContents = getMockContents();
      
      // Set featured content
      const availableFeatured = user?.isPremium 
        ? allContents.filter(c => c.isPremium) 
        : allContents;
      setFeaturedContent(getRandomElement(availableFeatured));
      
      // Get user watch history
      if (user) {
        setContinueWatching(getMockWatchHistory(user.id));
      }
      
      // Get trending, premium, and free content
      const premiumContents = getMockPremiumContents();
      const freeContents = getMockFreeContents();
      
      // Shuffle arrays and limit to 10 items
      setTrendingContent(
        [...allContents].sort(() => 0.5 - Math.random()).slice(0, 10)
      );
      setPremiumContent(premiumContents.slice(0, 10));
      setFreeContent(freeContents.slice(0, 10));
      
      // Organize content by type
      setMovieContent(allContents.filter((c: ContentItem) => !c.contentType || c.contentType === 'movie').slice(0, 10));
      setSeriesContent(allContents.filter((c: ContentItem) => c.contentType === 'series').slice(0, 10));
      setTrailerContent(allContents.filter((c: ContentItem) => c.contentType === 'trailer').slice(0, 10));
      setMusicVideoContent(allContents.filter((c: ContentItem) => c.contentType === 'music_video').slice(0, 10));
      
      // Get real categories from API instead of mock data
      try {
        const categoriesRes = await fetch("/api/categories");
        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          // Filter out test categories
          const realCategories = categoriesData.filter((category: CategoryItem) => 
            !category.name.includes('Test Category')
          );
          setCategories(realCategories);
        } else {
          // Fallback to mock categories only if API fails
          setCategories(getMockCategories());
        }
      } catch (categoryError) {
        console.error("Error fetching categories:", categoryError);
        // Fallback to mock categories
        setCategories(getMockCategories());
      }
    } catch (error) {
      console.error("Error fetching mock data:", error);
      toast({
        title: "Error",
        description: "Failed to load content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);
  
  const fetchSupabaseData = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Fetch content from API endpoints
      const [
        contentsRes,
        categoriesRes,
        premiumRes,
        freeRes,
        movieRes,
        seriesRes,
        trailerRes,
        musicVideoRes
      ] = await Promise.all([
        fetch("/api/contents"),
        fetch("/api/categories"),
        fetch("/api/contents/premium"),
        fetch("/api/contents/free"),
        fetch("/api/contents/type/movie"),
        fetch("/api/contents/type/series"),
        fetch("/api/contents/type/trailer"),
        fetch("/api/contents/type/music_video")
      ]);
      
      if (!contentsRes.ok || !categoriesRes.ok || !premiumRes.ok || !freeRes.ok) {
        throw new Error("Failed to fetch data");
      }
      
      const [contents, categories, premium, free, movies, series, trailers, musicVideos] = await Promise.all([
        contentsRes.json(),
        categoriesRes.json(),
        premiumRes.json(),
        freeRes.json(),
        movieRes.json(),
        seriesRes.json(),
        trailerRes.json(),
        musicVideoRes.json()
      ]);
      
      // Set featured content
      const availableFeatured = user?.isPremium ? premium : contents;
      setFeaturedContent(availableFeatured[Math.floor(Math.random() * availableFeatured.length)]);
      
      // Get trending (for now, just shuffle all content)
      setTrendingContent(
        [...contents].sort(() => 0.5 - Math.random()).slice(0, 10)
      );
      
      setPremiumContent(premium);
      setFreeContent(free);
      // Filter out test categories
      const realCategories = categories.filter((category: CategoryItem) => 
        !category.name.includes('Test Category')
      );
      setCategories(realCategories);
      
      // Set content by type using dedicated endpoints
      setMovieContent(movies.slice(0, 10));
      setSeriesContent(series.slice(0, 10));
      setTrailerContent(trailers.slice(0, 10));
      setMusicVideoContent(musicVideos.slice(0, 10));
      
      // Fetch watch history if user is logged in
      if (user) {
        const token = localStorage.getItem("auth_token");
        
        if (token) {
          const historyRes = await fetch("/api/history", {
            headers: {
              Authorization: `Bearer ${token}`,
            }
          });
          
          if (historyRes.ok) {
            const history = await historyRes.json();
            setContinueWatching(history);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load content. Please try again.",
        variant: "destructive",
      });
      
      // Fallback to mock data
      fetchMockData();
    } finally {
      setIsLoading(false);
    }
  }, [user, toast, fetchMockData]);
  
  useEffect(() => {
    if (dataSource === "mock") {
      fetchMockData();
    } else {
      fetchSupabaseData();
    }
  }, [dataSource, user, fetchMockData, fetchSupabaseData]);
  
  // Update trending content with recommendations when available
  useEffect(() => {
    if (recommendedTrending && recommendedTrending.length > 0) {
      setTrendingContent(recommendedTrending);
    }
  }, [recommendedTrending]);
  
  // Update continue watching from sync manager
  useEffect(() => {
    if (user && continueWatchingContent.length > 0) {
      setContinueWatching(continueWatchingContent);
    }
  }, [user, continueWatchingContent]);
  
  // Only want to run this once when user is available
  useEffect(() => {
    let isActive = true;
    
    if (user && isActive) {
      loadContinueWatching();
    }
    
    return () => {
      isActive = false;
    };
  }, [user, loadContinueWatching]);
  
  const handleAddToWatchlist = useCallback(async (contentId: number) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to add content to your watchlist.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      if (dataSource === "supabase") {
        await apiRequest("POST", "/api/watchlist", { contentId });
        
        toast({
          title: "Added to watchlist",
          description: "Content has been added to your watchlist.",
        });
        
        // Invalidate watchlist cache
        queryClient.invalidateQueries({ queryKey: ["/api/watchlist"] });
      } else {
        // For mock data, just show a toast
        toast({
          title: "Added to watchlist",
          description: "Content has been added to your watchlist.",
        });
      }
    } catch (error) {
      console.error("Error adding to watchlist:", error);
      toast({
        title: "Error",
        description: "Failed to add content to watchlist.",
        variant: "destructive",
      });
    }
  }, [user, dataSource, toast]);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-16">
        {/* Hero Section */}
        {featuredContent && (
          <HeroSection 
            content={featuredContent} 
            onAddToWatchlist={handleAddToWatchlist}
          />
        )}
        
        {/* Subscription Banner */}
        <SubscriptionBanner />
        
        <div className="container mx-auto px-4 py-8">
          {/* Continue Watching Section */}
          {continueWatching.length > 0 && (
            <ContentCarousel 
              title="Continue Watching" 
              items={continueWatching} 
              onAddToWatchlist={handleAddToWatchlist}
              showProgress
            />
          )}
          
          {/* Recommended for You Section - Only show for logged in users */}
          {user && recommendedContent && recommendedContent.length > 0 && (
            <ContentCarousel 
              title="Recommended for You" 
              viewAllLink="/browse?sort=recommended" 
              items={recommendedContent}
              onAddToWatchlist={handleAddToWatchlist}
            />
          )}
          
          {/* Trending Section */}
          <ContentCarousel 
            title="Trending in South Africa" 
            viewAllLink="/browse?sort=trending" 
            items={trendingContent}
            aspect="poster"
            onAddToWatchlist={handleAddToWatchlist}
          />
          
          {/* Premium Content Section */}
          <ContentCarousel 
            title="Premium Content" 
            viewAllLink="/browse?filter=premium" 
            items={premiumContent}
            onAddToWatchlist={handleAddToWatchlist}
          />
          
          {/* Free Content Section */}
          <ContentCarousel 
            title="Free to Watch" 
            viewAllLink="/browse?filter=free" 
            items={freeContent}
            onAddToWatchlist={handleAddToWatchlist}
          />
          
          {/* Content organized by type */}
          {movieContent.length > 0 && (
            <ContentCarousel 
              title="Movies" 
              viewAllLink="/browse?type=movie" 
              items={movieContent}
              onAddToWatchlist={handleAddToWatchlist}
            />
          )}
          
          {/* Series section removed as requested */}
          
          {musicVideoContent.length > 0 && (
            <ContentCarousel 
              title="Music Videos" 
              viewAllLink="/browse?type=music_video" 
              items={musicVideoContent}
              onAddToWatchlist={handleAddToWatchlist}
            />
          )}
          
          {trailerContent.length > 0 && (
            <ContentCarousel 
              title="Trailers" 
              viewAllLink="/browse?type=trailer" 
              items={trailerContent}
              onAddToWatchlist={handleAddToWatchlist}
            />
          )}
          
          {/* Categories Section */}
          <CategorySection categories={categories} />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Home;
