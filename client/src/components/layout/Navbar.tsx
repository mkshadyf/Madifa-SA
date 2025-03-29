import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { generateAvatarUrl } from "@/lib/utils";
import AuthModal from "../auth/AuthModal";
import { 
  Search, 
  Home, 
  Film, 
  Video, 
  Music, 
  Play, 
  Grid3X3, 
  Bookmark,
  Download, 
  User as UserIcon,
  Menu as MenuIcon,
  Shield
} from "lucide-react";

const Navbar = () => {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [openSearch, setOpenSearch] = useState(false);
  const [openAuthModal, setOpenAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "register">("login");

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogin = () => {
    setAuthModalMode("login");
    setOpenAuthModal(true);
  };

  const handleRegister = () => {
    setAuthModalMode("register");
    setOpenAuthModal(true);
  };

  const handleLogout = () => {
    logout();
  };

  const navLinks = [
    { name: "Home", path: "/", icon: <Home className="h-5 w-5" /> },
    { name: "Movies", path: "/browse?type=movie", icon: <Film className="h-5 w-5" /> },
    { name: "Short Films", path: "/browse?type=short_film", icon: <Video className="h-5 w-5" /> },
    { name: "Music Videos", path: "/browse?type=music_video", icon: <Music className="h-5 w-5" /> },
    { name: "Trailers", path: "/browse?type=trailer", icon: <Play className="h-5 w-5" /> },
    { name: "My List", path: "/my-list", icon: <Bookmark className="h-5 w-5" /> },
    { name: "Downloads", path: "/downloads", icon: <Download className="h-5 w-5" />, requiresAuth: true },
  ];

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 bg-opacity-95 backdrop-blur-sm border-b ${
        isScrolled ? "bg-background border-gray-800" : "bg-transparent border-transparent"
      } transition-all duration-300 safe-area-top`}>
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-10">
            <Link href="/" className="flex items-center">
              <img 
                src="/images/madifa_logo.jpg" 
                alt="Madifa Logo" 
                className="h-12 w-12 rounded-full mr-2"
              />
              <span className="text-primary text-3xl font-bold">MADIFA</span>
            </Link>
            
            <div className="hidden md:flex space-x-6">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  href={link.path}
                  className={`${
                    location === link.path 
                      ? "text-primary" 
                      : "text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary"
                  } transition`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative hidden md:block">
              <Input 
                type="text" 
                placeholder="Search..." 
                className="bg-white/80 dark:bg-gray-800/80 border-gray-300 dark:border-gray-700 rounded-full py-1 px-4 text-sm w-40 lg:w-64"
              />
              <Search className="h-4 w-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400" />
            </div>
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="cursor-pointer h-8 w-8 hidden md:block">
                    <AvatarImage src={user.avatarUrl || generateAvatarUrl(user.fullName || user.username)} />
                    <AvatarFallback className="bg-primary text-white">
                      {user.username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/my-list">My List</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/subscription">Subscription</Link>
                  </DropdownMenuItem>
                  {user.isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="flex items-center">
                          <Shield className="h-4 w-4 mr-2" />
                          Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center space-x-1">
                <Button variant="outline" onClick={handleLogin} className="text-foreground border-primary-dark hover:bg-primary-dark transition rounded-full px-4 py-1">
                  Log In
                </Button>
                <Button onClick={handleRegister} className="bg-primary hover:bg-primary/90 transition text-white rounded-full px-4 py-1">
                  Sign Up
                </Button>
              </div>
            )}
            
            {/* Mobile menu trigger */}
            <Sheet>
              <SheetTrigger className="md:hidden">
                <MenuIcon className="h-6 w-6" />
              </SheetTrigger>
              <SheetContent side="right" className="w-[250px] bg-background/95 backdrop-blur-sm">
                <SheetHeader>
                  <div className="flex items-center">
                    <img 
                      src="/images/madifa_logo.jpg" 
                      alt="Madifa Logo" 
                      className="h-10 w-10 rounded-full mr-2"
                    />
                    <SheetTitle className="text-2xl font-bold text-primary">MADIFA</SheetTitle>
                  </div>
                </SheetHeader>
                <div className="py-4">
                  <nav className="flex flex-col space-y-4">
                    {navLinks.map((link) => (
                      <Link 
                        key={link.name} 
                        href={link.path}
                        className={`flex items-center space-x-3 p-2 rounded-md ${
                          location === link.path 
                            ? "bg-primary/10 text-primary" 
                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-primary dark:hover:text-primary"
                        } transition`}
                      >
                        {link.icon}
                        <span>{link.name}</span>
                      </Link>
                    ))}
                    {user && (
                      <>
                        <Link 
                          href="/profile"
                          className="flex items-center space-x-3 p-2 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-primary dark:hover:text-primary transition"
                        >
                          <UserIcon className="h-5 w-5" />
                          <span>Profile</span>
                        </Link>
                        {user.isAdmin && (
                          <Link 
                            href="/admin"
                            className="flex items-center space-x-3 p-2 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-primary dark:hover:text-primary transition"
                          >
                            <Shield className="h-5 w-5" />
                            <span>Admin Dashboard</span>
                          </Link>
                        )}
                      </>
                    )}
                  </nav>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <Input 
                    type="text" 
                    placeholder="Search..." 
                    className="bg-white/80 dark:bg-gray-800/80 border-gray-300 dark:border-gray-700 rounded-full py-1 pl-4 pr-10 text-sm w-full"
                  />
                  <Search className="h-4 w-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400" />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
      
      <AuthModal 
        isOpen={openAuthModal} 
        onClose={() => setOpenAuthModal(false)} 
        initialView={authModalMode} 
      />
    </>
  );
};

export default Navbar;
