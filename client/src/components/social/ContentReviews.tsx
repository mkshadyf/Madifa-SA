import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trash2, Edit, ThumbsUp } from "lucide-react";
import { formatDate } from "@/lib/utils";
import ContentRating from "./ContentRating";

interface Review {
  id: number;
  userId: number;
  contentId: number;
  rating: number;
  review?: string; // For backward compatibility
  content?: string; // New field used by server
  title?: string;   // New field used by server
  isVisible?: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    username: string;
    email: string;
    name?: string;
    avatarUrl?: string;
  };
}

interface ContentReviewsProps {
  contentId: number;
  limit?: number;
  showAllLink?: boolean;
}

export default function ContentReviews({
  contentId,
  limit = 5,
  showAllLink = true
}: ContentReviewsProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [userRating, setUserRating] = useState(0);
  const [showMore, setShowMore] = useState(false);

  // Fetch reviews for the content
  useEffect(() => {
    const fetchReviews = async () => {
      setIsLoading(true);
      try {
        const response = await apiRequest(`/api/reviews/${contentId}`);
        if (response.ok) {
          const data = await response.json();
          setReviews(data);
        } else {
          console.error("Failed to fetch reviews");
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, [contentId]);

  // Fetch user's review if logged in
  useEffect(() => {
    if (user) {
      const fetchUserReview = async () => {
        try {
          const response = await apiRequest(`/api/reviews/${contentId}/user`);
          if (response.ok) {
            const data = await response.json();
            setUserReview(data);
            // Handle both old and new API response formats
            setReviewText(data.content || data.review || "");
            setUserRating(data.rating);
          }
        } catch (error) {
          // User hasn't reviewed yet, which is fine
          console.log("No user review found");
        }
      };

      fetchUserReview();
    }
  }, [user, contentId]);

  // Submit a new review or update existing
  const handleSubmitReview = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to submit a review.",
        variant: "destructive"
      });
      return;
    }

    if (!reviewText.trim()) {
      toast({
        title: "Review required",
        description: "Please enter your review text.",
        variant: "destructive"
      });
      return;
    }

    if (userRating === 0) {
      toast({
        title: "Rating required",
        description: "Please rate this content before submitting your review.",
        variant: "destructive"
      });
      return;
    }

    setIsPosting(true);
    try {
      let response;
      
      if (userReview) {
        // Update existing review
        response = await apiRequest("PUT", `/api/reviews/${userReview.id}`, {
          title: userReview.title || `Review for content ${contentId}`,
          content: reviewText, // Server expects 'content' not 'review'
          rating: userRating,
          isVisible: userReview.isVisible !== undefined ? userReview.isVisible : true
        });
      } else {
        // Create new review
        response = await apiRequest("POST", "/api/reviews", {
          contentId,
          title: `Review for content ${contentId}`, // Add title as required by server
          content: reviewText, // Server expects 'content' not 'review'
          rating: userRating,
          isVisible: true // Default to visible
        });
      }

      if (response.ok) {
        const data = await response.json();
        
        // Update UI
        if (userReview) {
          // Replace the existing review in the list
          setReviews(reviews.map(r => r.id === data.id ? { ...data, user: user } : r));
        } else {
          // Add the new review to the list
          setReviews([{ ...data, user: user }, ...reviews]);
        }
        
        setUserReview(data);
        setIsEditing(false);
        
        toast({
          title: userReview ? "Review updated" : "Review submitted",
          description: "Thank you for your feedback!"
        });
      } else {
        toast({
          title: "Failed to submit review",
          description: "Please try again later.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setIsPosting(false);
    }
  };

  // Delete user's review
  const handleDeleteReview = async () => {
    if (!userReview) return;
    
    try {
      const response = await apiRequest("DELETE", `/api/reviews/${userReview.id}`);
      
      if (response.ok) {
        // Remove the review from the list
        setReviews(reviews.filter(r => r.id !== userReview.id));
        setUserReview(null);
        setReviewText("");
        setUserRating(0);
        
        toast({
          title: "Review deleted",
          description: "Your review has been removed."
        });
      } else {
        toast({
          title: "Failed to delete review",
          description: "Please try again later.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    }
  };

  // Handle rating change
  const handleRatingChange = (rating: number) => {
    setUserRating(rating);
  };

  // Determine which reviews to display based on limit
  const displayedReviews = showMore 
    ? reviews 
    : reviews.slice(0, limit);

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold mb-4">Reviews</h3>
      
      {/* User's review section */}
      {user && (
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          {!userReview || isEditing ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Your rating:</span>
                <ContentRating 
                  contentId={contentId} 
                  showCount={false}
                  size="md"
                  onChange={handleRatingChange}
                />
              </div>
              
              <Textarea
                placeholder="Share your thoughts about this content..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="min-h-[100px] bg-gray-700"
              />
              
              <div className="flex justify-end gap-2">
                {isEditing && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsEditing(false);
                      if (userReview) {
                        setReviewText(userReview.content || userReview.review || "");
                      }
                    }}
                  >
                    Cancel
                  </Button>
                )}
                
                <Button 
                  onClick={handleSubmitReview} 
                  disabled={isPosting || !reviewText.trim() || userRating === 0}
                >
                  {isPosting ? "Submitting..." : userReview ? "Update Review" : "Post Review"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatarUrl || undefined} />
                    <AvatarFallback>{user.fullName?.charAt(0) || user.username?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{user.fullName || user.username}</p>
                    <div className="flex items-center gap-2">
                      <ContentRating
                        contentId={contentId}
                        showCount={false}
                        size="sm"
                        allowRating={false}
                      />
                      <span className="text-xs text-gray-400">
                        {formatDate(userReview.updatedAt)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit size={16} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={handleDeleteReview}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
              
              <p className="text-gray-300">{userReview.content || userReview.review}</p>
            </div>
          )}
        </div>
      )}
      
      {/* Other reviews */}
      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="animate-pulse text-gray-400">Loading reviews...</div>
        </div>
      ) : displayedReviews.length > 0 ? (
        <div className="space-y-6">
          {displayedReviews
            .filter(review => !user || review.userId !== user.id) // Filter out user's own review
            .map(review => (
              <div key={review.id} className="border-b border-gray-700 pb-4 last:border-0">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={review.user.avatarUrl || undefined} />
                      <AvatarFallback>{review.user.name?.charAt(0) || review.user.username.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{review.user.name || review.user.username}</p>
                      <div className="flex items-center gap-2">
                        <ContentRating
                          contentId={contentId}
                          showCount={false}
                          size="sm"
                          allowRating={false}
                        />
                        <span className="text-xs text-gray-400">
                          {formatDate(review.updatedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <p className="mt-2 text-gray-300">{review.content || review.review}</p>
              </div>
            ))}
            
          {reviews.length > limit && (
            <div className="text-center mt-4">
              <Button
                variant="outline"
                onClick={() => setShowMore(!showMore)}
              >
                {showMore ? "Show Less" : `Show All (${reviews.length})`}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400">
          <p>No reviews yet. Be the first to share your thoughts!</p>
        </div>
      )}
    </div>
  );
}