import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Home, Search, Film, User } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import AuthModal from "../auth/AuthModal";

export function MobileNav() {
  const [location] = useLocation();
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalView, setAuthModalView] = useState<"login" | "register">("login");
  const isMobile = useIsMobile();
  
  // Don't render the component on non-mobile devices
  if (!isMobile) return null;
  
  const handleSignInClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      setAuthModalView("login");
      setShowAuthModal(true);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-t border-gray-200 dark:border-gray-800 z-50 safe-area-bottom">
      <nav className="grid grid-cols-4 items-center h-16">
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