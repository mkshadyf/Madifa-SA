import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { ContentItem, CategoryItem } from "@shared/types";
import { useAuth } from "@/contexts/AuthContext";
import { useDataSource } from "@/contexts/DataSourceContext";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useRecommendations } from "@/hooks/useRecommendations";
import { useDownloads } from "@/hooks/useDownloads";
import { useSync } from "@/hooks/useSync";
import { 
  getMockContent, 
  getMockCategory,
  getMockContents,
  getRelatedContent
} from "@/lib/helpers";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import VideoPlayer from "@/components/video/VideoPlayer";
import ContentCarousel from "@/components/home/ContentCarousel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDuration } from "@/lib/utils";
import { Play, Plus, Bookmark, Clock, Calendar, Film, Tag, Star, Download, Monitor } from "lucide-react";
import AuthModal from "@/components/auth/AuthModal";
import { ContentRating, ContentReviews, SocialShare } from "@/components/social";

const MovieDetails = () => {
  const params = useParams();
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  const { dataSource } = useDataSource();
  const { toast } = useToast();
  const { getSimilarContentItems } = useRecommendations();
  const { startDownload, isContentDownloaded, getDownloadState } = useDownloads();
  // Get device sync info
  const { updateLastDevice, deviceId, isOnNewDevice } = useSync();
  
  const [content, setContent] = useState<ContentItem | null>(null);
  const [category, setCategory] = useState<CategoryItem | null>(null);
  const [relatedContent, setRelatedContent] = useState<ContentItem[]>([]);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Parse URL parameters
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const autoPlay = searchParams.get('autoplay') === 'true';
  
  const contentId = params.id ? parseInt(params.id) : 0;
  
  const fetchMockData = () => {
    setIsLoading(true);
    
    try {
      // Get content
      const contentData = getMockContent(contentId);
      if (!contentData) {
        toast({
          title: "Content not found",
          description: "The requested content could not be found.",
          variant: "destructive",
        });
        navigate("/");
        return;
      }
      
      setContent(contentData);
      
      // Get category
      const categoryData = getMockCategory(contentData.categoryId);
      setCategory(categoryData || null);
      
      // Get related content using recommendation engine
      if (contentData) {
        const similarContent = getSimilarContentItems(contentData, 8);
        setRelatedContent(similarContent);
      }
      
      // Check if in watchlist (for mock, always false)
      setInWatchlist(false);
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
  };
  
  const fetchSupabaseData = async () => {
    setIsLoading(true);
    
    try {
      // Fetch content
      const contentRes = await fetch(`/api/contents/${contentId}`);
      
      if (!contentRes.ok) {
        toast({
          title: "Content not found",
          description: "The requested content could not be found.",
          variant: "destructive",
        });
        navigate("/");
        return;
      }
      
      const contentData = await contentRes.json();
      setContent(contentData);
      
      // Fetch category
      const categoryRes = await fetch(`/api/categories/${contentData.categoryId}`);
      if (categoryRes.ok) {
        const categoryData = await categoryRes.json();
        setCategory(categoryData);
      }
      
      // Get related content using recommendation engine for better results
      const similarContent = getSimilarContentItems(contentData, 8);
      if (similarContent.length > 0) {
        setRelatedContent(similarContent);
      } else {
        // Fallback to traditional category-based recommendation if recommendation engine returns no results
        const relatedRes = await fetch(`/api/contents/category/${contentData.categoryId}`);
        if (relatedRes.ok) {
          const relatedData = await relatedRes.json();
          // Filter out current content
          setRelatedContent(relatedData.filter((item: ContentItem) => item.id !== contentId));
        }
      }
      
      // Check if in watchlist
      if (user) {
        const token = localStorage.getItem("auth_token");
        
        if (token) {
          const watchlistRes = await fetch("/api/watchlist", {
            headers: {
              Authorization: `Bearer ${token}`,
            }
          });
          
          if (watchlistRes.ok) {
            const watchlist = await watchlistRes.json();
            setInWatchlist(watchlist.some((item: any) => item.contentId === contentId));
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
  };
  
  useEffect(() => {
    if (dataSource === "mock") {
      fetchMockData();
    } else {
      fetchSupabaseData();
    }
  }, [dataSource, contentId, user]);
  
  const handleAddToWatchlist = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    
    try {
      if (dataSource === "supabase") {
        if (inWatchlist) {
          // Remove from watchlist
          await apiRequest("DELETE", `/api/watchlist/${contentId}`, undefined);
          
          toast({
            title: "Removed from watchlist",
            description: "Content has been removed from your watchlist.",
          });
        } else {
          // Add to watchlist
          await apiRequest("POST", "/api/watchlist", { contentId });
          
          toast({
            title: "Added to watchlist",
            description: "Content has been added to your watchlist.",
          });
        }
        
        // Toggle state
        setInWatchlist(!inWatchlist);
        
        // Invalidate watchlist cache
        queryClient.invalidateQueries({ queryKey: ["/api/watchlist"] });
      } else {
        // For mock data, just toggle the state and show a toast
        setInWatchlist(!inWatchlist);
        
        toast({
          title: inWatchlist ? "Removed from watchlist" : "Added to watchlist",
          description: inWatchlist 
            ? "Content has been removed from your watchlist." 
            : "Content has been added to your watchlist.",
        });
      }
    } catch (error) {
      console.error("Error updating watchlist:", error);
      toast({
        title: "Error",
        description: "Failed to update watchlist.",
        variant: "destructive",
      });
    }
  };
  
  const handleProgressUpdate = async (progress: number) => {
    if (!user || !content) return;
    
    try {
      if (dataSource === "supabase") {
        await apiRequest("POST", "/api/history", { 
          contentId: content.id,
          progress
        });
        
        // No need to show toast for progress updates
        
        // Optionally invalidate history cache
        queryClient.invalidateQueries({ queryKey: ["/api/history"] });
      }
      // For mock data, do nothing
    } catch (error) {
      console.error("Error updating progress:", error);
      // Don't show toast for errors in progress updates
    }
  };
  
  const handleVideoComplete = () => {
    toast({
      title: "Video completed",
      description: "Thanks for watching!",
    });
  };
  
  const handleDownload = async () => {
    if (!content) return;
    
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    
    try {
      setIsDownloading(true);
      await startDownload(content);
      setIsDownloading(false);
    } catch (error) {
      console.error("Error downloading content:", error);
      setIsDownloading(false);
      toast({
        title: "Download failed",
        description: "There was an error downloading this content. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  if (!content && !isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Content Not Found</h1>
            <Button onClick={() => navigate("/")}>Back to Home</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-16">
        {content && (
          <>
            <div className="w-full">
              <VideoPlayer 
                content={content} 
                autoPlay={autoPlay} 
                onProgressUpdate={handleProgressUpdate}
                onVideoComplete={handleVideoComplete}
              />
            </div>
            
            <div className="container mx-auto px-4 py-8">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-8">
                <div className="flex-1">
                  <div className="flex items-center flex-wrap gap-2 mb-2">
                    {content.isPremium && (
                      <Badge className="bg-primary text-white">PREMIUM</Badge>
                    )}
                    {!content.isPremium && (
                      <Badge className="bg-muted-foreground text-white">FREE</Badge>
                    )}
                    {content.rating && (
                      <Badge variant="outline">{content.rating}</Badge>
                    )}
                    <span className="text-muted-foreground text-sm">
                      {content.duration && formatDuration(content.duration)}
                    </span>
                  </div>
                  
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">{content.title}</h1>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{content.releaseYear}</span>
                    </div>
                    
                    {category && (
                      <div className="flex items-center gap-1">
                        <Tag className="h-4 w-4" />
                        <span>{category.name}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{Math.floor((content.duration || 0) / 60)} minutes</span>
                    </div>
                  </div>
                  
                  <p className="mb-6 text-foreground">{content.description}</p>
                  
                  <div className="flex flex-wrap gap-3 mb-8">
                    <Button 
                      className="bg-orange-600 hover:bg-orange-700 text-white" 
                      onClick={() => {
                        // First check if user is logged in
                        if (!user) {
                          // Not logged in - show auth modal
                          setShowAuthModal(true);
                        } 
                        // Then check if content is premium and user is not premium
                        else if (content.isPremium && !user.isPremium) {
                          // Show upgrade modal for premium content
                          setShowAuthModal(true);
                        } else {
                          // User is logged in and either content is not premium or user is premium
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                      }}
                    >
                      <Play className="h-5 w-5 mr-2" />
                      Watch Now
                    </Button>
                    
                    <Button 
                      variant={inWatchlist ? "default" : "secondary"}
                      onClick={handleAddToWatchlist}
                    >
                      {inWatchlist ? (
                        <>
                          <Bookmark className="h-5 w-5 mr-2 fill-current" />
                          In My List
                        </>
                      ) : (
                        <>
                          <Plus className="h-5 w-5 mr-2" />
                          Add to My List
                        </>
                      )}
                    </Button>
                    
                    <Button 
                      variant="outline"
                      onClick={handleDownload}
                      disabled={isDownloading || isContentDownloaded(content.id)}
                    >
                      {isDownloading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Downloading...
                        </>
                      ) : isContentDownloaded(content.id) ? (
                        <>
                          <Download className="h-5 w-5 mr-2 fill-current" />
                          Downloaded
                        </>
                      ) : (
                        <>
                          <Download className="h-5 w-5 mr-2" />
                          Download
                        </>
                      )}
                    </Button>
                    
                    {isContentDownloaded(content.id) && (
                      <Button 
                        variant="ghost"
                        onClick={() => navigate("/downloads")}
                      >
                        View Downloads
                      </Button>
                    )}
                  </div>
                  
                  {/* Sync indicator */}
                  {user && (
                    <div className="flex items-center mt-4 text-sm">
                      <Monitor className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {isOnNewDevice 
                          ? "Video progress will sync across all your devices"
                          : `Watching on this device (${deviceId.substring(0, 8)})`
                        }
                      </span>
                      {isOnNewDevice && (
                        <Button 
                          variant="link" 
                          size="sm"
                          className="ml-2 p-0 h-auto text-primary"
                          onClick={() => {
                            updateLastDevice();
                            toast({
                              title: "Device synced",
                              description: "This is now your primary device for watching content",
                            });
                          }}
                        >
                          Set as primary device
                        </Button>
                      )}
                    </div>
                  )}
                  
                  <Separator className="my-6" />
                  
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm text-muted-foreground">Release Year</h3>
                        <p>{content.releaseYear}</p>
                      </div>
                      <div>
                        <h3 className="text-sm text-muted-foreground">Category</h3>
                        <p>{category?.name || "Uncategorized"}</p>
                      </div>
                      <div>
                        <h3 className="text-sm text-muted-foreground">Rating</h3>
                        <p>{content.rating || "Not Rated"}</p>
                      </div>
                      <div>
                        <h3 className="text-sm text-muted-foreground">Duration</h3>
                        <p>{Math.floor((content.duration || 0) / 60)} minutes</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="md:w-1/3 rounded-lg overflow-hidden">
                  <img 
                    src={content.thumbnailUrl} 
                    alt={content.title} 
                    className="w-full aspect-[2/3] object-cover"
                  />
                </div>
              </div>
              
              {/* Social features */}
              <div className="py-8">
                <div className="grid grid-cols-1 gap-8">
                  <div>
                    <h2 className="text-2xl font-semibold mb-4">Ratings & Reviews</h2>
                    <div className="bg-card rounded-lg p-6 shadow-sm">
                      <div className="flex flex-col md:flex-row gap-8">
                        <div className="md:w-1/3">
                          <h3 className="text-xl font-medium mb-4">Rate this content</h3>
                          <ContentRating 
                            contentId={content.id} 
                            showCount={true} 
                            size="lg" 
                            allowRating={true} 
                          />
                        </div>
                        <div className="md:w-2/3">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-medium">Reviews</h3>
                            <SocialShare 
                              contentId={content.id} 
                              title={content.title} 
                              description={content.description} 
                              imageUrl={content.thumbnailUrl} 
                              variant="button" 
                            />
                          </div>
                          <ContentReviews 
                            contentId={content.id} 
                            limit={3} 
                            showAllLink={true} 
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Related content */}
              {relatedContent.length > 0 && (
                <div className="mt-12">
                  <ContentCarousel 
                    title="More Like This" 
                    items={relatedContent}
                    aspect="poster"
                  />
                </div>
              )}
            </div>
          </>
        )}
      </main>
      
      <Footer />
      
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        initialView={user ? "upgrade" : "register"}
      />
    </div>
  );
};

export default MovieDetails;
