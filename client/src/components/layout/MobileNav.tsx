import { Link, useLocation } from "wouter";
import { Home, Search, Film, User, Download, Settings, Gauge } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { usePerformanceContext } from "@/contexts/PerformanceContext";

interface MobileNavProps {
  onOpenPerformanceSettings?: () => void;
}

export function MobileNav({ onOpenPerformanceSettings }: MobileNavProps) {
  const [location] = useLocation();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { lightweight } = usePerformanceContext();
  
  if (!isMobile) return null;

  const handlePerformanceClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onOpenPerformanceSettings) {
      onOpenPerformanceSettings();
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 z-50">
      <nav className="flex justify-around items-center h-16">
        <Link href="/">
          <a className={`flex flex-col items-center w-full px-1 py-1 ${location === "/" ? "text-primary" : "text-gray-400"}`}>
            <Home size={18} />
            <span className="text-xs mt-1">Home</span>
          </a>
        </Link>
        
        <Link href="/browse">
          <a className={`flex flex-col items-center w-full px-1 py-1 ${location === "/browse" ? "text-primary" : "text-gray-400"}`}>
            <Search size={18} />
            <span className="text-xs mt-1">Browse</span>
          </a>
        </Link>
        
        <Link href="/my-list">
          <a className={`flex flex-col items-center w-full px-1 py-1 ${location === "/my-list" ? "text-primary" : "text-gray-400"}`}>
            <Film size={18} />
            <span className="text-xs mt-1">My List</span>
          </a>
        </Link>
        
        <Link href="/downloads">
          <a className={`flex flex-col items-center w-full px-1 py-1 ${location === "/downloads" ? "text-primary" : "text-gray-400"}`}>
            <Download size={18} />
            <span className="text-xs mt-1">Downloads</span>
          </a>
        </Link>
        
        {/* Performance Settings Button */}
        <a 
          href="#" 
          onClick={handlePerformanceClick}
          className="flex flex-col items-center w-full px-1 py-1 text-gray-400"
        >
          <div className="relative">
            <Gauge size={18} />
            {lightweight && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full"></div>
            )}
          </div>
          <span className="text-xs mt-1">Speed</span>
        </a>
        
        <Link href={user ? "/profile" : "/login"}>
          <a className={`flex flex-col items-center w-full px-1 py-1 ${location === "/profile" || location === "/login" ? "text-primary" : "text-gray-400"}`}>
            <User size={18} />
            <span className="text-xs mt-1">{user ? "Profile" : "Sign In"}</span>
          </a>
        </Link>
      </nav>
    </div>
  );
}

export default MobileNav;