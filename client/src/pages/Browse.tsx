import React, { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { ContentItem, CategoryItem } from "@shared/types";
import { useAuth } from "@/contexts/AuthContext";
import { useDataSource } from "@/contexts/DataSourceContext";
import { useToast } from "@/hooks/use-toast";
import { useAdsense } from "@/hooks/useAdsense";
import InFeedAd from "@/components/ads/InFeedAd";
import { 
  getMockContents, 
  getMockCategories,
  getMockContentsByCategory,
  getMockPremiumContents,
  getMockFreeContents
} from "@/lib/helpers";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import VideoCard from "@/components/video/VideoCard";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Grid2X2,
  LayoutList,
  Search,
  SlidersHorizontal,
  Filter,
  Play,
  Plus
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const Browse = () => {
  const params = useParams();
  const [location] = useLocation();
  const { user } = useAuth();
  const { dataSource } = useDataSource();
  const { toast } = useToast();
  const { getInFeedAdPositions } = useAdsense();
  
  // Parse URL parameters
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const initialView = searchParams.get('view') || 'all';
  const initialFilter = searchParams.get('filter') || 'all';
  const initialSort = searchParams.get('sort') || 'newest';
  const initialType = searchParams.get('type') || 'all';
  
  const categoryId = params.id ? parseInt(params.id) : undefined;
  
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [filteredContents, setFilteredContents] = useState<ContentItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filter and search states
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterMode, setFilterMode] = useState(initialFilter);
  const [sortMode, setSortMode] = useState(initialSort);
  const [contentType, setContentType] = useState(initialType);
  const [selectedRatings, setSelectedRatings] = useState<string[]>([]);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  
  const fetchMockData = () => {
    setIsLoading(true);
    
    try {
      let contentsData: ContentItem[] = [];
      
      // If category is specified, get contents for that category
      if (categoryId) {
        contentsData = getMockContentsByCategory(categoryId);
        const category = getMockCategories().find(c => c.id === categoryId);
        setSelectedCategory(category || null);
      } else {
        contentsData = getMockContents();
      }
      
      setContents(contentsData);
      setCategories(getMockCategories());
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
      let contentsData: ContentItem[] = [];
      
      // If category is specified, get contents for that category
      if (categoryId) {
        const contentsRes = await fetch(`/api/contents/category/${categoryId}`);
        if (!contentsRes.ok) {
          throw new Error("Failed to fetch category contents");
        }
        contentsData = await contentsRes.json();
        
        // Get category details
        const categoryRes = await fetch(`/api/categories/${categoryId}`);
        if (categoryRes.ok) {
          const category = await categoryRes.json();
          setSelectedCategory(category);
        }
      } else {
        const contentsRes = await fetch("/api/contents");
        if (!contentsRes.ok) {
          throw new Error("Failed to fetch contents");
        }
        contentsData = await contentsRes.json();
      }
      
      setContents(contentsData);
      
      // Get categories
      const categoriesRes = await fetch("/api/categories");
      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData);
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
  }, [dataSource, categoryId]);
  
  // Apply filters and sorting to the content
  useEffect(() => {
    let filtered = [...contents];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(query) || 
        item.description.toLowerCase().includes(query)
      );
    }
    
    // Apply premium/free filter
    if (filterMode === "premium") {
      filtered = filtered.filter(item => item.isPremium);
    } else if (filterMode === "free") {
      filtered = filtered.filter(item => !item.isPremium);
    }
    
    // Apply content type filter
    if (contentType === "movies") {
      // Implement based on your content structure
      // For now, let's assume all content is movies
    } else if (contentType === "series") {
      // Implement based on your content structure
    }
    
    // Apply rating filters
    if (selectedRatings.length > 0) {
      filtered = filtered.filter(item => 
        item.rating && selectedRatings.includes(item.rating)
      );
    }
    
    // Apply sorting
    if (sortMode === "newest") {
      filtered.sort((a, b) => b.releaseYear - a.releaseYear);
    } else if (sortMode === "oldest") {
      filtered.sort((a, b) => a.releaseYear - b.releaseYear);
    } else if (sortMode === "az") {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortMode === "za") {
      filtered.sort((a, b) => b.title.localeCompare(a.title));
    } else if (sortMode === "trending") {
      // For mock data, we'll just shuffle
      filtered.sort(() => Math.random() - 0.5);
    }
    
    setFilteredContents(filtered);
  }, [contents, searchQuery, filterMode, sortMode, contentType, selectedRatings]);
  
  const toggleRating = (rating: string) => {
    setSelectedRatings(prev => 
      prev.includes(rating)
        ? prev.filter(r => r !== rating)
        : [...prev, rating]
    );
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {selectedCategory ? selectedCategory.name : "Browse Content"}
              </h1>
              <p className="text-muted-foreground">
                {selectedCategory 
                  ? selectedCategory.description 
                  : "Discover movies and series from South Africa's finest creators"}
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
          
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search movies, series..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Select value={sortMode} onValueChange={setSortMode}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="az">A-Z</SelectItem>
                  <SelectItem value="za">Z-A</SelectItem>
                  <SelectItem value="trending">Trending</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterMode} onValueChange={setFilterMode}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Content</SelectItem>
                  <SelectItem value="premium">Premium Only</SelectItem>
                  <SelectItem value="free">Free Only</SelectItem>
                </SelectContent>
              </Select>
              
              <Drawer open={filterDrawerOpen} onOpenChange={setFilterDrawerOpen}>
                <DrawerTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <SlidersHorizontal className="h-4 w-4" />
                    <span>Filters</span>
                  </Button>
                </DrawerTrigger>
                <DrawerContent>
                  <DrawerHeader>
                    <DrawerTitle>Filter Content</DrawerTitle>
                    <DrawerDescription>
                      Apply filters to find specific content
                    </DrawerDescription>
                  </DrawerHeader>
                  <div className="p-4 space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Content Type</h3>
                      <Select value={contentType} onValueChange={setContentType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Content Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="movies">Movies</SelectItem>
                          <SelectItem value="series">Series</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Categories</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {categories.map((category) => (
                          <div key={category.id} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`category-${category.id}`} 
                              checked={categoryId === category.id}
                              // onCheckedChange would go to the category page
                            />
                            <Label htmlFor={`category-${category.id}`}>{category.name}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Ratings</h3>
                      <div className="flex flex-wrap gap-2">
                        {["G", "PG", "13+", "16+", "18+"].map((rating) => (
                          <Badge 
                            key={rating}
                            variant={selectedRatings.includes(rating) ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => toggleRating(rating)}
                          >
                            {rating}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <DrawerFooter>
                    <Button onClick={() => {
                      setSelectedRatings([]);
                      setContentType("all");
                    }}>
                      Reset Filters
                    </Button>
                    <DrawerClose asChild>
                      <Button variant="outline">Apply</Button>
                    </DrawerClose>
                  </DrawerFooter>
                </DrawerContent>
              </Drawer>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : filteredContents.length > 0 ? (
            <div className={viewMode === "grid" 
              ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4" 
              : "space-y-4"
            }>
              {/* Calculate ad positions */}
              {(() => {
                const adPositions = getInFeedAdPositions(filteredContents.length);
                
                return filteredContents.map((content, index) => {
                  // Only show ads for non-premium users
                  const showAd = adPositions.includes(index) && !user?.isPremium;
                  
                  return (
                    <React.Fragment key={`content-wrapper-${content.id}`}>
                      {/* Show ad if this is an ad position and user is not premium */}
                      {showAd && (
                        <div key={`ad-${index}`} className={viewMode === "grid" ? "col-span-full" : ""}>
                          <InFeedAd index={index} contentLength={filteredContents.length} />
                        </div>
                      )}
                      
                      {/* Display content item */}
                      {viewMode === "grid" ? (
                        <div key={`content-${content.id}`} className="hover:scale-105 transition duration-200">
                          <VideoCard
                            content={content}
                            aspect="poster"
                          />
                        </div>
                      ) : (
                        <Card key={`content-${content.id}`} className="flex overflow-hidden">
                          <div className="w-1/3 max-w-[200px] relative">
                            <img 
                              src={content.thumbnailUrl} 
                              alt={content.title} 
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-0 right-0 p-2">
                              {content.isPremium ? (
                                <Badge className="bg-primary text-white">PREMIUM</Badge>
                              ) : (
                                <Badge className="bg-muted-foreground text-white">FREE</Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex-1 flex flex-col p-4">
                            <CardHeader className="p-0 pb-2">
                              <CardTitle className="line-clamp-1">{content.title}</CardTitle>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>{content.releaseYear}</span>
                                <span>•</span>
                                <span>
                                  {content.duration ? `${Math.floor(content.duration / 60)} min` : "N/A"}
                                </span>
                                {content.rating && (
                                  <>
                                    <span>•</span>
                                    <Badge variant="outline" className="h-5 text-xs">
                                      {content.rating}
                                    </Badge>
                                  </>
                                )}
                              </div>
                            </CardHeader>
                            <CardContent className="p-0 py-2 flex-grow">
                              <p className="text-muted-foreground text-sm line-clamp-2">
                                {content.description}
                              </p>
                            </CardContent>
                            <CardFooter className="p-0 pt-2 flex justify-between">
                              <Button 
                                size="sm" 
                                className="bg-orange-600 hover:bg-orange-700 text-white"
                                onClick={() => window.location.href = `/movie/${content.id}`}
                              >
                                <Play className="h-4 w-4 mr-2" />
                                Watch
                              </Button>
                              <Button size="sm" variant="ghost">
                                <Plus className="h-4 w-4 mr-2" />
                                Add to List
                              </Button>
                            </CardFooter>
                          </div>
                        </Card>
                      )}
                    </React.Fragment>
                  );
                });
              })()}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20">
              <h2 className="text-xl font-bold mb-2">No content found</h2>
              <p className="text-muted-foreground mb-4">
                Try adjusting your filters or search query
              </p>
              <Button 
                onClick={() => {
                  setSearchQuery("");
                  setFilterMode("all");
                  setSortMode("newest");
                  setContentType("all");
                  setSelectedRatings([]);
                }}
              >
                Reset Filters
              </Button>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Browse;
