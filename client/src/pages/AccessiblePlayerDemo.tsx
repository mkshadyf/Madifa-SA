import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { ContentItem } from '@shared/types';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import AccessibleVideoPlayer from '@/components/video/AccessibleVideoPlayer';

export default function AccessiblePlayerDemo() {
  const [_, setLocation] = useLocation();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { user } = useAuth();
  const [content, setContent] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedContent, setRelatedContent] = useState<ContentItem[]>([]);
  
  const contentId = parseInt(id);
  
  useEffect(() => {
    if (isNaN(contentId)) {
      setError('Invalid content ID');
      setLoading(false);
      return;
    }
    
    const fetchContent = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await apiRequest({
          url: `/api/content/${contentId}`,
          method: 'GET'
        });
        
        if (!data) {
          setError('Content not found');
          return;
        }
        
        setContent(data);
        
        // Fetch related content
        const relatedData = await apiRequest({
          url: `/api/content/category/${data.categoryId}`,
          method: 'GET'
        });
        
        if (Array.isArray(relatedData)) {
          setRelatedContent(relatedData.filter((item: ContentItem) => item.id !== contentId));
        }
        
      } catch (err) {
        console.error('Error fetching content:', err);
        setError('Failed to load content. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchContent();
  }, [contentId]);
  
  const handleGoBack = () => {
    setLocation('/browse');
  };
  
  const handleVideoComplete = () => {
    toast({
      title: 'Video completed',
      description: 'Great! You\'ve finished watching this video.'
    });
  };
  
  const handleProgressUpdate = (progress: number) => {
    console.log(`Video progress updated: ${progress}%`);
  };
  
  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (error || !content) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Error</h1>
          <p className="text-gray-600 mb-8">{error || 'Content not found'}</p>
          <Button onClick={handleGoBack}>Go Back</Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Button 
        variant="ghost" 
        onClick={handleGoBack} 
        className="mb-4 flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Browse
      </Button>
      
      <h1 className="text-2xl md:text-3xl font-bold mb-2">{content.title}</h1>
      
      <div className="mb-6">
        <AccessibleVideoPlayer 
          content={content}
          onProgressUpdate={handleProgressUpdate}
          onVideoComplete={handleVideoComplete}
        />
      </div>
      
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">About</h2>
          <p className="text-muted-foreground">{content.description}</p>
          
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="block text-muted-foreground">Release Year</span>
              <span className="font-medium">{content.releaseYear}</span>
            </div>
            
            {content.duration && (
              <div>
                <span className="block text-muted-foreground">Duration</span>
                <span className="font-medium">{Math.floor(content.duration / 60)}m {content.duration % 60}s</span>
              </div>
            )}
            
            {content.rating && (
              <div>
                <span className="block text-muted-foreground">Rating</span>
                <span className="font-medium">{content.rating}</span>
              </div>
            )}
            
            <div>
              <span className="block text-muted-foreground">Type</span>
              <span className="font-medium">{content.isPremium ? 'Premium' : 'Free'}</span>
            </div>
          </div>
        </div>
        
        {relatedContent.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">More Like This</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {relatedContent.slice(0, 5).map((item) => (
                <div 
                  key={item.id} 
                  className="cursor-pointer group"
                  onClick={() => setLocation(`/accessible-player/${item.id}`)}
                >
                  <div className="relative aspect-video rounded-md overflow-hidden mb-2">
                    <img 
                      src={item.thumbnailUrl} 
                      alt={item.title} 
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  <h3 className="text-sm font-medium truncate group-hover:text-primary transition-colors">{item.title}</h3>
                </div>
              ))}
            </div>
            
            <Button 
              variant="outline" 
              className="mt-4 flex items-center gap-2"
              onClick={() => setLocation(`/browse?category=${content.categoryId}`)}
            >
              See More
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        <div className="mt-8 p-4 bg-primary/5 rounded-lg border border-primary/20">
          <h2 className="text-lg font-semibold mb-2">Accessibility Features</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Advanced closed captioning with customizable appearance</li>
            <li>Keyboard shortcuts for all player controls</li>
            <li>High contrast controls with clear visual feedback</li>
            <li>Screen reader compatible with descriptive text</li>
            <li>Caption positioning and styling options</li>
            <li>Variable playback speed controls</li>
          </ul>
        </div>
      </div>
    </div>
  );
}