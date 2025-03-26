import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import AuthModal from "../auth/AuthModal";

const SubscriptionBanner = () => {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  const handleSubscribeClick = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    
    navigate("/subscription");
  };
  
  // Don't show banner for premium users
  if (user?.isPremium) {
    return null;
  }

  return (
    <>
      <div className="bg-primary-dark/50 backdrop-blur-sm border-t border-b border-primary py-3">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
          <div className="flex-1 mb-3 md:mb-0">
            <h3 className="text-lg font-semibold text-white">Upgrade to Premium for R59/month</h3>
            <p className="text-muted-foreground text-sm">Enjoy ad-free viewing and access to full movies and series</p>
          </div>
          <Button 
            className="bg-orange-600 hover:bg-orange-700 text-white"
            onClick={handleSubscribeClick}
          >
            Subscribe Now
          </Button>
        </div>
      </div>
      
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        initialView="register"
      />
    </>
  );
};

export default SubscriptionBanner;
