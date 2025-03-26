import React, { useState, useEffect } from "react";
import { Star, StarHalf } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ContentRatingProps {
  contentId: number;
  showCount?: boolean;
  size?: "sm" | "md" | "lg";
  allowRating?: boolean;
  onChange?: (rating: number) => void;
}

export default function ContentRating({
  contentId,
  showCount = false,
  size = "md",
  allowRating = true,
  onChange
}: ContentRatingProps) {
  const { user } = useAuth();
  const [averageRating, setAverageRating] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Determine star size based on the size prop
  const starSize = size === "sm" ? 16 : size === "md" ? 20 : 24;
  
  // Fetch average rating and ratings count for the content
  useEffect(() => {
    const fetchAverageRating = async () => {
      try {
        const response = await apiRequest(`/api/ratings/${contentId}/average`);
        const data = await response.json();
        setAverageRating(data.average);
      } catch (error) {
        console.error("Error fetching average rating:", error);
      }
    };

    const fetchRatings = async () => {
      try {
        const response = await apiRequest(`/api/ratings/${contentId}`);
        const data = await response.json();
        setTotalRatings(data.length);
      } catch (error) {
        console.error("Error fetching ratings:", error);
      }
    };

    fetchAverageRating();
    fetchRatings();
  }, [contentId]);

  // Fetch user's rating if they're logged in
  useEffect(() => {
    if (user && allowRating) {
      const fetchUserRating = async () => {
        try {
          const response = await apiRequest(`/api/ratings/${contentId}/user`);
          if (response.ok) {
            const data = await response.json();
            setUserRating(data.rating);
          }
        } catch (error) {
          // User probably hasn't rated this content yet, which is fine
          console.log("No user rating found");
        }
      };

      fetchUserRating();
    }
  }, [user, contentId, allowRating]);

  // Submit user rating
  const submitRating = async (rating: number) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to rate this content.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/ratings", {
        contentId,
        rating
      });

      if (response.ok) {
        const data = await response.json();
        setUserRating(data.rating);
        
        // Refetch average rating to reflect the update
        const avgResponse = await apiRequest(`/api/ratings/${contentId}/average`);
        const avgData = await avgResponse.json();
        setAverageRating(avgData.average);
        
        toast({
          title: "Rating submitted",
          description: "Thank you for your feedback!"
        });
        
        if (onChange) {
          onChange(rating);
        }
      } else {
        toast({
          title: "Failed to submit rating",
          description: "Please try again later.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Render stars for display (filled based on average rating)
  const renderDisplayStars = () => {
    return Array(5).fill(0).map((_, index) => {
      const starValue = index + 1;
      // For half stars
      if (averageRating >= starValue - 0.25 && averageRating < starValue + 0.25) {
        return <StarHalf key={index} size={starSize} className="text-yellow-500" />;
      }
      // Filled or empty star
      return (
        <Star 
          key={index} 
          size={starSize} 
          fill={averageRating >= starValue ? "currentColor" : "none"} 
          className={averageRating >= starValue ? "text-yellow-500" : "text-gray-400"}
        />
      );
    });
  };

  // Render interactive stars for rating
  const renderInteractiveStars = () => {
    return Array(5).fill(0).map((_, index) => {
      const starValue = index + 1;
      const isActive = (isHovering ? hoverRating : userRating) >= starValue;
      
      return (
        <Star 
          key={index} 
          size={starSize}
          fill={isActive ? "currentColor" : "none"} 
          className={`cursor-pointer transition-colors ${isActive ? "text-yellow-500" : "text-gray-400"} ${isLoading ? "pointer-events-none opacity-50" : ""}`}
          onClick={() => submitRating(starValue)}
          onMouseEnter={() => {
            setIsHovering(true);
            setHoverRating(starValue);
          }}
          onMouseLeave={() => {
            setIsHovering(false);
          }}
        />
      );
    });
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-center gap-1">
        {allowRating && user ? renderInteractiveStars() : renderDisplayStars()}
      </div>
      
      {showCount && (
        <div className="text-xs text-gray-500">
          <span className="font-bold">{averageRating.toFixed(1)}</span>
          {totalRatings > 0 && (
            <span> ({totalRatings} {totalRatings === 1 ? "rating" : "ratings"})</span>
          )}
        </div>
      )}
    </div>
  );
}