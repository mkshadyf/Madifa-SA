import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { 
  Facebook, 
  Twitter, 
  Linkedin, 
  Mail, 
  Share2, 
  Copy, 
  MessageSquare, 
  CheckCircle 
} from "lucide-react";
import { FaTelegram } from "react-icons/fa";

interface SocialShareProps {
  contentId: number;
  title: string;
  description?: string;
  imageUrl?: string;
  variant?: "icon" | "button" | "text";
  size?: "sm" | "md" | "lg";
  className?: string;
}

interface SharePlatform {
  name: string;
  icon: React.ReactNode;
  color: string;
  shareUrl: (url: string, title: string, description: string) => string;
}

export default function SocialShare({
  contentId,
  title,
  description = "",
  imageUrl = "",
  variant = "button",
  size = "md",
  className = ""
}: SocialShareProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareStats, setShareStats] = useState({ total: 0, platforms: {} as Record<string, number> });
  const [isLoading, setIsLoading] = useState(false);

  // Generate the URL to be shared
  const shareUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/movie/${contentId}`
    : `https://madifa.co.za/movie/${contentId}`;

  // Define share platforms
  const platforms: SharePlatform[] = [
    {
      name: "Facebook",
      icon: <Facebook size={18} />,
      color: "bg-[#1877F2] hover:bg-[#0e66da]",
      shareUrl: (url, title, description) => 
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(title)}`
    },
    {
      name: "Twitter",
      icon: <Twitter size={18} />,
      color: "bg-[#1DA1F2] hover:bg-[#0c85d0]",
      shareUrl: (url, title, description) => 
        `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
    },
    {
      name: "WhatsApp",
      icon: <MessageSquare size={18} />,
      color: "bg-[#25D366] hover:bg-[#1da74d]",
      shareUrl: (url, title, description) => 
        `https://api.whatsapp.com/send?text=${encodeURIComponent(`${title} - ${url}`)}`
    },
    {
      name: "Telegram",
      icon: <FaTelegram size={18} />,
      color: "bg-[#0088cc] hover:bg-[#0077b3]",
      shareUrl: (url, title, description) => 
        `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
    },
    {
      name: "LinkedIn",
      icon: <Linkedin size={18} />,
      color: "bg-[#0077B5] hover:bg-[#005e93]",
      shareUrl: (url, title, description) => 
        `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
    },
    {
      name: "Email",
      icon: <Mail size={18} />,
      color: "bg-gray-600 hover:bg-gray-700",
      shareUrl: (url, title, description) => 
        `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${description}\n\n${url}`)}`
    }
  ];

  // Fetch share statistics when component mounts
  useEffect(() => {
    const fetchShareStats = async () => {
      try {
        const response = await apiRequest(`/api/social-shares/${contentId}`);
        if (response.ok) {
          const data = await response.json();
          
          // Calculate stats
          const stats = {
            total: data.length,
            platforms: data.reduce((acc: Record<string, number>, share: any) => {
              acc[share.platform] = (acc[share.platform] || 0) + 1;
              return acc;
            }, {})
          };
          
          setShareStats(stats);
        }
      } catch (error) {
        console.error("Error fetching share stats:", error);
      }
    };

    fetchShareStats();
  }, [contentId]);

  // Reset copied state when popover closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => setCopied(false), 300);
    }
  }, [isOpen]);

  // Handle share to platform
  const handleShare = async (platform: string) => {
    // If user is logged in, track the share
    if (user) {
      setIsLoading(true);
      try {
        await apiRequest("POST", "/api/social-shares", {
          contentId,
          platform,
          url: shareUrl
        });
        
        // Update local stats
        setShareStats(prev => ({
          total: prev.total + 1,
          platforms: {
            ...prev.platforms,
            [platform]: (prev.platforms[platform] || 0) + 1
          }
        }));
      } catch (error) {
        console.error("Error tracking share:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    // Find platform's share URL
    const platformObj = platforms.find(p => p.name === platform);
    if (platformObj) {
      window.open(
        platformObj.shareUrl(shareUrl, title, description),
        "_blank",
        "noopener,noreferrer"
      );
    }
  };

  // Copy link to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: "Link copied",
        description: "Share link has been copied to clipboard."
      });
      
      // Track copy as a share if user is logged in
      if (user) {
        await apiRequest("POST", "/api/social-shares", {
          contentId,
          platform: "Copy Link",
          url: shareUrl
        });
        
        // Update local stats
        setShareStats(prev => ({
          total: prev.total + 1,
          platforms: {
            ...prev.platforms,
            "Copy Link": (prev.platforms["Copy Link"] || 0) + 1
          }
        }));
      }
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        {variant === "icon" ? (
          <Button
            variant="ghost"
            size="icon"
            className={className}
            aria-label="Share this content"
          >
            <Share2 size={size === "sm" ? 16 : size === "md" ? 20 : 24} />
          </Button>
        ) : variant === "text" ? (
          <Button
            variant="link"
            className={`p-0 h-auto flex items-center gap-1 ${className}`}
            aria-label="Share this content"
          >
            <Share2 size={size === "sm" ? 14 : size === "md" ? 16 : 20} />
            <span>Share</span>
          </Button>
        ) : (
          <Button
            variant="outline"
            size={size === "sm" ? "sm" : size === "lg" ? "lg" : "default"}
            className={`flex items-center gap-2 ${className}`}
            aria-label="Share this content"
          >
            <Share2 size={size === "sm" ? 14 : size === "md" ? 16 : 20} />
            <span>Share</span>
          </Button>
        )}
      </PopoverTrigger>
      
      <PopoverContent className="w-64 p-4" side="top">
        <div className="text-center mb-3">
          <h4 className="font-bold">Share this content</h4>
          <p className="text-xs text-gray-400">Choose a platform to share</p>
        </div>
        
        <div className="grid grid-cols-3 gap-2 mb-3">
          {platforms.map(platform => (
            <Button
              key={platform.name}
              className={`w-full flex flex-col items-center gap-1 px-2 py-3 h-auto ${platform.color}`}
              onClick={() => handleShare(platform.name)}
              disabled={isLoading}
            >
              {platform.icon}
              <span className="text-xs">{platform.name}</span>
            </Button>
          ))}
        </div>
        
        <div className="flex items-center mt-4">
          <div className="flex-1 text-xs bg-gray-800 rounded-l-md py-2 px-3 truncate">
            {shareUrl}
          </div>
          <Button
            variant="default"
            size="sm"
            className="rounded-l-none"
            onClick={copyToClipboard}
            disabled={copied}
          >
            {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
          </Button>
        </div>
        
        {shareStats.total > 0 && (
          <div className="mt-4 text-xs text-gray-400 text-center">
            Shared {shareStats.total} times
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}