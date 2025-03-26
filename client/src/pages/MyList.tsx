import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ContentItem } from "@shared/types";
import { useAuth } from "@/contexts/AuthContext";
import { useDataSource } from "@/contexts/DataSourceContext";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { getMockWatchlist } from "@/lib/helpers";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import VideoCard from "@/components/video/VideoCard";
import { Button } from "@/components/ui/button";
import { Grid2X2, LayoutList } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import AuthModal from "@/components/auth/AuthModal";

const MyList = () => {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { dataSource } = useDataSource();
  const { toast } = useToast();
  
  const [watchlist, setWatchlist] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  const fetchMockWatchlist = () => {
    setIsLoading(true);
    
    if (!user) {
      setWatchlist([]);
      setIsLoading(false);
      return;
    }
    
    try {
      // Get watchlist from mock data
      const watchlistData = getMockWatchlist(user.id);
      setWatchlist(watchlistData);
    } catch (error) {
      console.error("Error fetching mock watchlist:", error);
      toast({
        title: "Error",
        description: "Failed to load watchlist. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchSupabaseWatchlist = async () => {
    setIsLoading(true);
    
    if (!user) {
      setWatchlist([]);
      setIsLoading(false);
      return;
    }
    
    try {
      const token = localStorage.getItem("auth_token");
      
      if (!token) {
        throw new Error("Not authenticated");
      }
      
      const res = await fetch("/api/watchlist", {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      
      if (!res.ok) {
        throw new Error("Failed to fetch watchlist");
      }
      
      const watchlistData = await res.json();
      
      // Transform data to match ContentItem structure
      // The API returns {id, userId, contentId, addedAt, content}
      const transformedWatchlist = watchlistData.map((item: any) => item.content);
      
      setWatchlist(transformedWatchlist);
    } catch (error) {
      console.error("Error fetching watchlist:", error);
      toast({
        title: "Error",
        description: "Failed to load watchlist. Please try again.",
        variant: "destructive",
      });
      
      // Fallback to mock data
      fetchMockWatchlist();
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    
    if (dataSource === "mock") {
      fetchMockWatchlist();
    } else {
      fetchSupabaseWatchlist();
    }
  }, [dataSource, user]);
  
  const handleRemoveFromWatchlist = async (contentId: number) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    
    try {
      if (dataSource === "supabase") {
        await apiRequest("DELETE", `/api/watchlist/${contentId}`, undefined);
        
        toast({
          title: "Removed from watchlist",
          description: "Content has been removed from your watchlist.",
        });
        
        // Update local state
        setWatchlist(prev => prev.filter(item => item.id !== contentId));
        
        // Invalidate watchlist cache
        queryClient.invalidateQueries({ queryKey: ["/api/watchlist"] });
      } else {
        // For mock data, just update the local state
        setWatchlist(prev => prev.filter(item => item.id !== contentId));
        
        toast({
          title: "Removed from watchlist",
          description: "Content has been removed from your watchlist.",
        });
      }
    } catch (error) {
      console.error("Error removing from watchlist:", error);
      toast({
        title: "Error",
        description: "Failed to remove content from watchlist.",
        variant: "destructive",
      });
    }
  };
  
  if (!user && !isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Sign In Required</h1>
            <p className="mb-6 text-muted-foreground">
              You need to sign in to view your watchlist.
            </p>
            <div className="flex justify-center gap-4">
              <Button onClick={() => navigate("/login")}>Sign In</Button>
              <Button variant="outline" onClick={() => navigate("/")}>
                Back to Home
              </Button>
            </div>
          </div>
        </main>
        <Footer />
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          initialView="login"
        />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">My List</h1>
              <p className="text-muted-foreground">
                {watchlist.length === 0
                  ? "Your watchlist is empty. Start adding content you want to watch later!"
                  : `You have ${watchlist.length} item${watchlist.length !== 1 ? 's' : ''} in your watchlist.`}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("grid")}
              >
                <Grid2X2 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("list")}
              >
                <LayoutList className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : watchlist.length > 0 ? (
            <div className={viewMode === "grid" 
              ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4" 
              : "space-y-4"
            }>
              {watchlist.map((content) => (
                <div key={content.id} className="group relative">
                  <VideoCard
                    content={content}
                    aspect={viewMode === "grid" ? "poster" : "video"}
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleRemoveFromWatchlist(content.id)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20">
              <h2 className="text-xl font-bold mb-2">Your watchlist is empty</h2>
              <p className="text-muted-foreground mb-4">
                Start browsing content and add items to your list
              </p>
              <Button onClick={() => navigate("/browse")}>
                Browse Content
              </Button>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default MyList;
