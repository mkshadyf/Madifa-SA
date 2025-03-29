import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Home, Search, Film, User, Download, Settings, Gauge } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { usePerformanceContext } from "@/contexts/PerformanceContext";
import AuthModal from "../auth/AuthModal";

interface MobileNavProps {
  onOpenPerformanceSettings?: () => void;
}

export function MobileNav({ onOpenPerformanceSettings }: MobileNavProps) {
  const [location] = useLocation();
  const { user } = useAuth();
  const { lightweight } = usePerformanceContext();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalView, setAuthModalView] = useState<"login" | "register">("login");
  const isMobile = useIsMobile();
  
  // Don't render the component on non-mobile devices
  if (!isMobile) return null;

  const handlePerformanceClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onOpenPerformanceSettings) {
      onOpenPerformanceSettings();
    }
  };
  
  const handleSignInClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      setAuthModalView("login");
      setShowAuthModal(true);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-t border-gray-200 dark:border-gray-800 z-50 safe-area-bottom">
      <nav className="flex justify-around items-center h-16">
        <Link href="/" className={`flex flex-col items-center justify-center w-full h-full py-2 ${location === "/" ? "text-primary" : "text-gray-600 dark:text-gray-400"} active:bg-gray-100 dark:active:bg-gray-800 transition-colors`}>
          <Home size={20} />
          <span className="text-xs mt-1 font-medium">Home</span>
        </Link>
        
        <Link href="/browse" className={`flex flex-col items-center justify-center w-full h-full py-2 ${location === "/browse" ? "text-primary" : "text-gray-600 dark:text-gray-400"} active:bg-gray-100 dark:active:bg-gray-800 transition-colors`}>
          <Search size={20} />
          <span className="text-xs mt-1 font-medium">Browse</span>
        </Link>
        
        <Link href="/my-list" className={`flex flex-col items-center justify-center w-full h-full py-2 ${location === "/my-list" ? "text-primary" : "text-gray-600 dark:text-gray-400"} active:bg-gray-100 dark:active:bg-gray-800 transition-colors`}>
          <Film size={20} />
          <span className="text-xs mt-1 font-medium">My List</span>
        </Link>
        
        <Link href="/downloads" className={`flex flex-col items-center justify-center w-full h-full py-2 ${location === "/downloads" ? "text-primary" : "text-gray-600 dark:text-gray-400"} active:bg-gray-100 dark:active:bg-gray-800 transition-colors`}>
          <Download size={20} />
          <span className="text-xs mt-1 font-medium">Downloads</span>
        </Link>
        
        {/* Performance Settings Button */}
        <button 
          onClick={handlePerformanceClick}
          className={`flex flex-col items-center justify-center w-full h-full py-2 text-gray-600 dark:text-gray-400 bg-transparent border-none active:bg-gray-100 dark:active:bg-gray-800 transition-colors`}
          aria-label="Performance Settings"
        >
          <div className="relative">
            <Gauge size={20} />
            {lightweight && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full"></div>
            )}
          </div>
          <span className="text-xs mt-1 font-medium">Speed</span>
        </button>
        
        {user ? (
          <Link 
            href="/profile" 
            className={`flex flex-col items-center justify-center w-full h-full py-2 ${location === "/profile" ? "text-primary" : "text-gray-600 dark:text-gray-400"} active:bg-gray-100 dark:active:bg-gray-800 transition-colors`}
          >
            <User size={20} />
            <span className="text-xs mt-1 font-medium">Profile</span>
          </Link>
        ) : (
          <button
            onClick={handleSignInClick}
            className={`flex flex-col items-center justify-center w-full h-full py-2 text-gray-600 dark:text-gray-400 bg-transparent border-none active:bg-gray-100 dark:active:bg-gray-800 transition-colors`}
          >
            <User size={20} />
            <span className="text-xs mt-1 font-medium">Sign In</span>
          </button>
        )}
      </nav>
      
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        initialView={authModalView} 
      />
    </div>
  );
}

export default MobileNav;