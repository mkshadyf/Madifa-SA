import { useState } from "react";
import { useLocation } from "wouter";
import { useDownloads } from "@/hooks/useDownloads";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import VideoCard from "@/components/video/VideoCard";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DownloadCloud,
  Trash2,
  AlertCircle,
  RefreshCw,
  Loader2
} from "lucide-react";
import { formatDate } from "@/lib/utils";

const Downloads = () => {
  const { downloads, isLoading, deleteDownload, deleteAllDownloads, refreshDownloads } = useDownloads();
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Redirect if not logged in
  if (!user) {
    toast({
      title: "Authentication required",
      description: "Please log in to view your downloads.",
      variant: "destructive",
    });
    navigate("/");
    return null;
  }
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshDownloads();
    setIsRefreshing(false);
  };
  
  // Group downloads by state
  const completedDownloads = downloads.filter(d => d.downloadState === 'complete');
  const inProgressDownloads = downloads.filter(d => ['pending', 'downloading'].includes(d.downloadState));
  const failedDownloads = downloads.filter(d => d.downloadState === 'error');
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold">My Downloads</h1>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                {isRefreshing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Refresh
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    disabled={downloads.length === 0}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear all downloads?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. All downloaded content will be removed from your device.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={deleteAllDownloads}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete All
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : downloads.length === 0 ? (
            <div className="text-center py-20 space-y-4">
              <DownloadCloud className="h-16 w-16 mx-auto text-muted-foreground" />
              <h2 className="text-xl font-semibold">No downloads yet</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Download your favorite content to watch offline. Downloaded content will appear here.
              </p>
              <Button 
                onClick={() => navigate("/browse")}
                className="mt-4"
              >
                Browse Content
              </Button>
            </div>
          ) : (
            <div className="space-y-8">
              {/* In Progress Downloads */}
              {inProgressDownloads.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Downloading</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {inProgressDownloads.map((download) => (
                      <div 
                        key={download.id}
                        className="bg-card border rounded-lg p-4 space-y-3"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-24 h-24 overflow-hidden rounded-md">
                            <img 
                              src={download.thumbnailUrl} 
                              alt={download.title} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold truncate">{download.title}</h3>
                            <div className="text-sm text-muted-foreground">
                              Started {formatDate(download.downloadDate)}
                            </div>
                            <div className="mt-2 space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>{download.downloadProgress}%</span>
                                <span>{download.downloadState === 'pending' ? 'Pending' : 'Downloading'}</span>
                              </div>
                              <Progress value={download.downloadProgress} />
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Cancel
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Cancel download?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will cancel the download and remove any partially downloaded content.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Keep Downloading</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => deleteDownload(download.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Cancel Download
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Completed Downloads */}
              {completedDownloads.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Available Offline</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {completedDownloads.map((download) => (
                      <div key={download.id} className="relative group">
                        <VideoCard
                          content={download}
                          aspect="poster"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                          <Button 
                            size="sm"
                            onClick={() => navigate(`/watch/${download.id}?source=local`)}
                          >
                            Watch
                          </Button>
                          <Button 
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteDownload(download.id)}
                          >
                            Delete
                          </Button>
                        </div>
                        {download.expiryDate && (
                          <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white text-xs p-1 text-center">
                            Expires: {formatDate(download.expiryDate)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Failed Downloads */}
              {failedDownloads.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Failed Downloads</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {failedDownloads.map((download) => (
                      <div 
                        key={download.id}
                        className="bg-card border border-destructive/40 rounded-lg p-4 space-y-3"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-24 h-24 overflow-hidden rounded-md">
                            <img 
                              src={download.thumbnailUrl} 
                              alt={download.title} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold truncate">{download.title}</h3>
                            <div className="text-sm text-muted-foreground">
                              Failed on {formatDate(download.downloadDate)}
                            </div>
                            <div className="mt-2 flex items-start gap-1 text-sm text-destructive">
                              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                              <span>{download.errorMessage || "Download failed"}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              deleteDownload(download.id);
                              // Re-attempt download (this would trigger the download flow again)
                              navigate(`/watch/${download.id}`);
                            }}
                          >
                            Try Again
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => deleteDownload(download.id)}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Downloads;