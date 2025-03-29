import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Upload, Trash2, Edit, Play, Pause, Film, FileText, Download, RefreshCw, CheckCircle2, XCircle, Eye, AlertCircle, Languages, Check, X } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { formatDuration } from '@/lib/utils';

interface VimeoVideoDetails {
  id: string;
  title: string;
  description: string;
  duration: number;
  thumbnailUrl: string;
  videoUrl: string;
  streamingUrl: string;
  privacySettings: {
    view: string;
    embed: string;
    download: boolean;
    add: boolean;
  };
}

interface VimeoAuthStatus {
  authenticated: boolean;
  user?: {
    name: string;
    uri: string;
    account: string;
  };
}

// Define response type for getAllVideos
interface VideosResponse {
  videos: VimeoVideoDetails[];
  total: number;
  page: number;
  perPage: number;
}

interface Category {
  id: number;
  name: string;
}

interface VideoCaptions {
  uri: string;
  active: boolean;
  language: string;
  link: string;
  name: string;
  type: string;
}

export default function VimeoManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [authStatus, setAuthStatus] = useState<VimeoAuthStatus | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [videos, setVideos] = useState<VimeoVideoDetails[]>([]);
  const [isVideosLoading, setIsVideosLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [totalVideos, setTotalVideos] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeThumbnailUrl, setActiveThumbnailUrl] = useState<string | null>(null);
  const [importFormData, setImportFormData] = useState({
    categoryId: '',
    isPremium: false,
    contentType: 'movie',
  });
  const [uploadFormData, setUploadFormData] = useState({
    fileUrl: '',
    name: '',
    description: '',
    privacy: {
      view: 'anybody' as 'anybody' | 'nobody' | 'password' | 'disable' | 'unlisted',
      embed: 'public' as 'public' | 'private' | 'whitelist',
      download: false,
      add: false,
    },
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showThumbnailDialog, setShowThumbnailDialog] = useState(false);
  const [videoCaptions, setVideoCaptions] = useState<VideoCaptions[]>([]);
  const [isCaptionsLoading, setIsCaptionsLoading] = useState(false);

  // Check Vimeo authentication status
  useEffect(() => {
    const checkAuth = async () => {
      setIsAuthLoading(true);
      try {
        const response = await apiRequest('GET', '/api/vimeo/auth-check');
        const data = await response.json();
        setAuthStatus(data);
      } catch (error) {
        console.error('Failed to check Vimeo authentication:', error);
        toast({
          title: 'Authentication Error',
          description: 'Failed to check Vimeo API authentication status.',
          variant: 'destructive',
        });
      } finally {
        setIsAuthLoading(false);
      }
    };

    checkAuth();
  }, [toast]);

  // Fetch videos from Vimeo
  useEffect(() => {
    const fetchVideos = async () => {
      setIsVideosLoading(true);
      try {
        const response = await apiRequest('GET', `/api/vimeo/videos?page=${currentPage}&perPage=${perPage}`);
        const data: VideosResponse = await response.json();
        setVideos(data.videos);
        setTotalVideos(data.total);
      } catch (error) {
        console.error('Failed to fetch Vimeo videos:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch videos from Vimeo.',
          variant: 'destructive',
        });
      } finally {
        setIsVideosLoading(false);
      }
    };

    if (authStatus?.authenticated) {
      fetchVideos();
    }
  }, [authStatus, currentPage, perPage, toast]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiRequest('GET', '/api/categories');
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch content categories.',
          variant: 'destructive',
        });
      }
    };

    fetchCategories();
  }, [toast]);

  // Handle video upload
  const handleUploadVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFormData.fileUrl || !uploadFormData.name) {
      toast({
        title: 'Missing fields',
        description: 'File URL and name are required.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate progress updates (in a real app, this would come from the API)
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 1000);

    try {
      const response = await apiRequest('POST', '/api/vimeo/videos', uploadFormData);
      
      if (response.ok) {
        const data = await response.json();
        clearInterval(progressInterval);
        setUploadProgress(100);
        
        // Reset form
        setUploadFormData({
          fileUrl: '',
          name: '',
          description: '',
          privacy: {
            view: 'anybody',
            embed: 'public',
            download: false,
            add: false,
          },
        });

        toast({
          title: 'Upload Successful',
          description: `Video upload initiated with ID: ${data.videoId}`,
        });

        // Refresh videos list after a delay to allow processing
        setTimeout(() => {
          setCurrentPage(1); // Reset to first page
        }, 3000);
      } else {
        const error = await response.text();
        throw new Error(error);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      toast({
        title: 'Upload Failed',
        description: 'Failed to upload video to Vimeo.',
        variant: 'destructive',
      });
    } finally {
      clearInterval(progressInterval);
      setIsUploading(false);
    }
  };

  // Handle video import to platform
  const handleImportVideo = async (videoId: string) => {
    if (!importFormData.categoryId) {
      toast({
        title: 'Missing category',
        description: 'Please select a category for this video.',
        variant: 'destructive',
      });
      return;
    }

    setIsImporting(true);
    setSelectedVideoId(videoId);

    try {
      const response = await apiRequest('POST', `/api/vimeo/import/${videoId}`, {
        categoryId: parseInt(importFormData.categoryId),
        isPremium: importFormData.isPremium,
        contentType: importFormData.contentType,
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: 'Import Successful',
          description: `Video "${data.content.title}" imported to platform.`,
        });

        // Reset import form
        setImportFormData({
          categoryId: '',
          isPremium: false,
          contentType: 'movie',
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Import failed');
      }
    } catch (error) {
      console.error('Import failed:', error);
      toast({
        title: 'Import Failed',
        description: error instanceof Error ? error.message : 'Failed to import video to platform.',
        variant: 'destructive',
      });
    } finally {
      setIsImporting(false);
      setSelectedVideoId(null);
    }
  };

  // Handle video deletion
  const handleDeleteVideo = async (videoId: string) => {
    setIsDeleting(true);
    setSelectedVideoId(videoId);

    try {
      const response = await apiRequest('DELETE', `/api/vimeo/videos/${videoId}`);

      if (response.ok) {
        // Remove from local state
        setVideos(prev => prev.filter(video => video.id !== videoId));
        
        toast({
          title: 'Video Deleted',
          description: 'Video was successfully deleted from Vimeo.',
        });
      } else {
        const error = await response.text();
        throw new Error(error);
      }
    } catch (error) {
      console.error('Delete failed:', error);
      toast({
        title: 'Delete Failed',
        description: 'Failed to delete video from Vimeo.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setSelectedVideoId(null);
    }
  };

  // Handle thumbnail preview
  const handleThumbnailPreview = (url: string) => {
    setActiveThumbnailUrl(url);
    setShowThumbnailDialog(true);
  };
  
  // Function to open import dialog and load captions
  const openImportDialog = (video: VimeoVideoDetails) => {
    setSelectedVideoId(video.id);
    setIsCaptionsLoading(true);
    setVideoCaptions([]);
    
    apiRequest('GET', `/api/vimeo/videos/${video.id}/captions`)
      .then(response => response.json())
      .then(data => {
        setVideoCaptions(data);
      })
      .catch(error => {
        console.error('Failed to fetch captions:', error);
        toast({
          title: 'Error',
          description: 'Failed to load video captions.',
          variant: 'destructive',
        });
      })
      .finally(() => {
        setIsCaptionsLoading(false);
      });
  };

  // If not authenticated or not an admin, show error
  if (!isAuthLoading && (!user || !user.isAdmin)) {
    return (
      <Card className="w-full max-w-3xl mx-auto mt-8">
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>
            You need administrator privileges to access this page.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Vimeo Content Management</h1>

      {/* Vimeo Authentication Status */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Vimeo Authentication Status</CardTitle>
          <CardDescription>
            Status of your Vimeo API integration
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isAuthLoading ? (
            <div className="flex items-center justify-center p-4">
              <span className="animate-spin mr-2">
                <RefreshCw size={20} />
              </span>
              Checking authentication...
            </div>
          ) : (
            <div className="flex items-center">
              {authStatus?.authenticated ? (
                <>
                  <CheckCircle2 className="text-green-500 mr-2" />
                  <div>
                    <p className="font-semibold">Authenticated</p>
                    {authStatus.user && (
                      <p className="text-sm text-muted-foreground">
                        Account: {authStatus.user.name}
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <XCircle className="text-red-500 mr-2" />
                  <div>
                    <p className="font-semibold">Not Authenticated</p>
                    <p className="text-sm text-muted-foreground">
                      Please check your Vimeo API credentials in the environment variables.
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="videos">
        <TabsList className="mb-6 w-full overflow-x-auto flex-wrap">
          <TabsTrigger value="videos" className="flex-1 sm:flex-none min-w-fit">
            <span className="hidden sm:inline">Vimeo Videos</span>
            <span className="sm:hidden flex flex-col items-center text-xs">
              <Film className="h-4 w-4 mb-1" />
              Videos
            </span>
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex-1 sm:flex-none min-w-fit">
            <span className="hidden sm:inline">Upload New Video</span>
            <span className="sm:hidden flex flex-col items-center text-xs">
              <Upload className="h-4 w-4 mb-1" />
              Upload
            </span>
          </TabsTrigger>
          <TabsTrigger value="captions" className="flex-1 sm:flex-none min-w-fit">
            <span className="hidden sm:inline">Captions Management</span>
            <span className="sm:hidden flex flex-col items-center text-xs">
              <Languages className="h-4 w-4 mb-1" />
              Captions
            </span>
          </TabsTrigger>
        </TabsList>

        {/* Videos List Tab */}
        <TabsContent value="videos">
          <Card>
            <CardHeader>
              <CardTitle>Your Vimeo Videos</CardTitle>
              <CardDescription>
                Manage videos from your Vimeo account and import them to the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isVideosLoading ? (
                <div className="flex items-center justify-center p-8">
                  <span className="animate-spin mr-2">
                    <RefreshCw size={20} />
                  </span>
                  Loading videos...
                </div>
              ) : videos.length === 0 ? (
                <div className="text-center py-8">
                  <Film className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-lg font-semibold">No videos found</h3>
                  <p className="text-sm text-muted-foreground">
                    Your Vimeo account doesn't have any videos or we couldn't retrieve them.
                  </p>
                </div>
              ) : (
                <>
                  {/* Mobile Video List */}
                  <div className="block md:hidden">
                    <div className="space-y-4">
                      {videos.map((video) => (
                        <Card key={video.id} className="overflow-hidden">
                          <div className="flex items-start">
                            <button
                              className="relative h-20 w-1/3 overflow-hidden group"
                              onClick={() => handleThumbnailPreview(video.thumbnailUrl)}
                            >
                              <img
                                src={video.thumbnailUrl}
                                alt={`Thumbnail for ${video.title}`}
                                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200"
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center transition-all duration-200">
                                <Eye className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" size={20} />
                              </div>
                            </button>
                            <div className="p-3 flex-1">
                              <h4 className="font-medium text-sm line-clamp-1">{video.title}</h4>
                              <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                                {video.description || 'No description'}
                              </p>
                              <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center gap-2">
                                  <Badge variant={video.privacySettings.view === 'anybody' ? 'default' : 'outline'} className="text-xs">
                                    {video.privacySettings.view}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">{formatDuration(video.duration)}</span>
                                </div>
                              </div>
                              <div className="flex gap-2 mt-3">
                                <Dialog onOpenChange={(open) => {
                                  if (open) {
                                    openImportDialog(video);
                                  }
                                }}>
                                  <DialogTrigger asChild>
                                    <Button variant="outline" size="sm" className="h-8 px-2 text-xs">
                                      <Film className="h-3 w-3 mr-1" /> Import
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Import Video to Platform</DialogTitle>
                                    </DialogHeader>
                                    <div className="py-4">
                                      <form className="space-y-4">
                                        <div className="space-y-2">
                                          <Label htmlFor="contentType">Content Type</Label>
                                          <Select
                                            value={importFormData.contentType}
                                            onValueChange={(value) =>
                                              setImportFormData({ ...importFormData, contentType: value })
                                            }
                                          >
                                            <SelectTrigger>
                                              <SelectValue placeholder="Select content type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="movie">Movie</SelectItem>
                                              <SelectItem value="trailer">Trailer</SelectItem>
                                              <SelectItem value="music_video">Music Video</SelectItem>
                                              <SelectItem value="short_film">Short Film</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                        <div className="space-y-2">
                                          <Label htmlFor="category">Category</Label>
                                          <Select
                                            value={importFormData.categoryId}
                                            onValueChange={(value) =>
                                              setImportFormData({ ...importFormData, categoryId: value })
                                            }
                                          >
                                            <SelectTrigger>
                                              <SelectValue placeholder="Select a category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {categories.map((category) => (
                                                <SelectItem key={category.id} value={category.id.toString()}>
                                                  {category.name}
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <Checkbox
                                            id={`isPremium-mobile-${video.id}`}
                                            checked={importFormData.isPremium}
                                            onCheckedChange={(checked) =>
                                              setImportFormData({
                                                ...importFormData,
                                                isPremium: checked === true,
                                              })
                                            }
                                          />
                                          <Label htmlFor={`isPremium-mobile-${video.id}`}>Premium content</Label>
                                        </div>
                                        <div className="mt-6">
                                          <h3 className="text-sm font-medium mb-2">Captions</h3>
                                          {isCaptionsLoading ? (
                                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                              <RefreshCw size={14} className="animate-spin" />
                                              <span>Loading...</span>
                                            </div>
                                          ) : videoCaptions.length > 0 ? (
                                            <div className="text-sm text-green-600">
                                              <CheckCircle2 className="h-4 w-4 inline mr-1" />
                                              {videoCaptions.length} captions available
                                            </div>
                                          ) : (
                                            <div className="text-sm text-yellow-600">
                                              <AlertCircle className="h-4 w-4 inline mr-1" />
                                              No captions available
                                            </div>
                                          )}
                                        </div>
                                      </form>
                                    </div>
                                    <DialogFooter>
                                      <Button
                                        onClick={() => !isImporting && handleImportVideo(video.id)}
                                        disabled={isImporting && selectedVideoId === video.id}
                                      >
                                        {isImporting && selectedVideoId === video.id ? (
                                          <>
                                            <RefreshCw size={16} className="animate-spin mr-2" />
                                            Importing...
                                          </>
                                        ) : (
                                          'Import Video'
                                        )}
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="sm" className="h-8 px-2 text-xs">
                                      <Trash2 className="h-3 w-3 mr-1" /> Delete
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Video</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete this video? This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDeleteVideo(video.id)}>
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                  
                  {/* Desktop Video Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Thumbnail</TableHead>
                          <TableHead>Title</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Privacy</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {videos.map((video) => (
                          <TableRow key={video.id}>
                            <TableCell>
                              <button
                                className="relative h-16 w-28 overflow-hidden rounded-md border group"
                                onClick={() => handleThumbnailPreview(video.thumbnailUrl)}
                              >
                                <img
                                  src={video.thumbnailUrl}
                                  alt={`Thumbnail for ${video.title}`}
                                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center transition-all duration-200">
                                  <Eye className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" size={20} />
                                </div>
                              </button>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{video.title}</p>
                                <p className="text-xs text-muted-foreground truncate max-w-xs">
                                  {video.description || 'No description'}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              {formatDuration(video.duration)}
                            </TableCell>
                            <TableCell>
                              <Badge variant={video.privacySettings.view === 'anybody' ? 'default' : 'outline'}>
                                {video.privacySettings.view}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Dialog onOpenChange={(open) => {
                                  if (open) {
                                    // Load captions data when the dialog opens
                                    setIsCaptionsLoading(true);
                                    setVideoCaptions([]);
                                    
                                    apiRequest('GET', `/api/vimeo/videos/${video.id}/captions`)
                                      .then(response => response.json())
                                      .then(data => {
                                        setVideoCaptions(data);
                                      })
                                      .catch(error => {
                                        console.error('Failed to fetch captions:', error);
                                        toast({
                                          title: 'Error',
                                          description: 'Failed to load video captions.',
                                          variant: 'destructive',
                                        });
                                      })
                                      .finally(() => {
                                        setIsCaptionsLoading(false);
                                      });
                                  }
                                }}>
                                  <DialogTrigger asChild>
                                    <Button variant="outline" size="sm">
                                      <Film className="h-4 w-4 mr-1" /> Import
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Import Video to Platform</DialogTitle>
                                    </DialogHeader>
                                    <div className="py-4">
                                      <form className="space-y-4">
                                        <div className="space-y-2">
                                          <Label htmlFor="contentType">Content Type</Label>
                                          <Select
                                            value={importFormData.contentType}
                                            onValueChange={(value) =>
                                              setImportFormData({ ...importFormData, contentType: value })
                                            }
                                          >
                                            <SelectTrigger>
                                              <SelectValue placeholder="Select content type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="movie">Movie</SelectItem>
                                              <SelectItem value="trailer">Trailer</SelectItem>
                                              <SelectItem value="music_video">Music Video</SelectItem>
                                              <SelectItem value="short_film">Short Film</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                        <div className="space-y-2">
                                          <Label htmlFor="category">Category</Label>
                                          <Select
                                            value={importFormData.categoryId}
                                            onValueChange={(value) =>
                                              setImportFormData({ ...importFormData, categoryId: value })
                                            }
                                          >
                                            <SelectTrigger>
                                              <SelectValue placeholder="Select a category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {categories.map((category) => (
                                                <SelectItem key={category.id} value={category.id.toString()}>
                                                  {category.name}
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <Checkbox
                                            id="isPremium"
                                            checked={importFormData.isPremium}
                                            onCheckedChange={(checked) =>
                                              setImportFormData({
                                                ...importFormData,
                                                isPremium: checked === true,
                                              })
                                            }
                                          />
                                          <Label htmlFor="isPremium">Premium content</Label>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                          Premium content is only available to subscribers.
                                        </p>
                                        
                                        {/* Captions Section */}
                                        <div className="mt-6">
                                          <h3 className="text-sm font-medium mb-2">Available Captions</h3>
                                          
                                          {isCaptionsLoading ? (
                                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                              <span className="animate-spin">
                                                <RefreshCw size={14} />
                                              </span>
                                              <span>Loading captions...</span>
                                            </div>
                                          ) : videoCaptions.length > 0 ? (
                                            <div className="border rounded-md p-3">
                                              <div className="text-sm text-green-600 dark:text-green-400 flex items-center mb-2">
                                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                                <span>{videoCaptions.length} caption track(s) will be imported automatically</span>
                                              </div>
                                              <div className="space-y-2 max-h-32 overflow-y-auto">
                                                {videoCaptions.map((caption, index) => (
                                                  <div key={index} className="flex items-center text-xs">
                                                    <Badge variant={caption.active ? "default" : "outline"} className="mr-2">
                                                      {caption.language}
                                                    </Badge>
                                                    <span className="text-muted-foreground">{caption.name}</span>
                                                    {caption.active && (
                                                      <span className="ml-2 text-xs text-green-600 dark:text-green-400">(default)</span>
                                                    )}
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                          ) : (
                                            <div className="text-sm text-muted-foreground border rounded-md p-3">
                                              <div className="flex items-center">
                                                <AlertCircle className="h-4 w-4 mr-1 text-yellow-500" />
                                                <span>No captions available for this video</span>
                                              </div>
                                              <p className="text-xs mt-1">
                                                You can add captions later from the video details page.
                                              </p>
                                            </div>
                                          )}
                                        </div>
                                      </form>
                                    </div>
                                    <div className="flex justify-end">
                                      <Button
                                        onClick={() => !isImporting && handleImportVideo(video.id)}
                                        className={isImporting && selectedVideoId === video.id ? "opacity-70 cursor-not-allowed" : ""}
                                      >
                                        {isImporting && selectedVideoId === video.id ? (
                                          <>
                                            <span className="animate-spin mr-2">
                                              <RefreshCw size={16} />
                                            </span>
                                            Importing...
                                          </>
                                        ) : (
                                          'Import Video'
                                        )}
                                      </Button>
                                    </div>
                                  </DialogContent>
                                </Dialog>

                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="sm">
                                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This will permanently delete the video "{video.title}" from Vimeo.
                                        This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => !isDeleting && handleDeleteVideo(video.id)}
                                        className={`bg-red-600 hover:bg-red-700 ${isDeleting && selectedVideoId === video.id ? "opacity-70 cursor-not-allowed" : ""}`}
                                      >
                                        {isDeleting && selectedVideoId === video.id ? (
                                          <>
                                            <span className="animate-spin mr-2">
                                              <RefreshCw size={16} />
                                            </span>
                                            Deleting...
                                          </>
                                        ) : (
                                          'Delete'
                                        )}
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>

                                <Button variant="outline" size="sm" asChild>
                                  <a href={video.videoUrl} target="_blank" rel="noopener noreferrer">
                                    <Play className="h-4 w-4 mr-1" /> Play
                                  </a>
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  <div className="mt-4">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => {
                              if (currentPage > 1) {
                                setCurrentPage(prev => prev - 1);
                              }
                            }}
                            className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                          />
                        </PaginationItem>
                        <PaginationItem>
                          <span className="px-4">
                            Page {currentPage} of {Math.ceil(totalVideos / perPage)}
                          </span>
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationNext
                            onClick={() => {
                              if (currentPage < Math.ceil(totalVideos / perPage)) {
                                setCurrentPage(prev => prev + 1);
                              }
                            }}
                            className={currentPage >= Math.ceil(totalVideos / perPage) ? "pointer-events-none opacity-50" : ""}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Upload New Video Tab */}
        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle>Upload New Video to Vimeo</CardTitle>
              <CardDescription>
                Upload a video directly to your Vimeo account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUploadVideo} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="fileUrl">File URL</Label>
                  <Input
                    id="fileUrl"
                    placeholder="https://example.com/video.mp4 or /path/to/local/file.mp4"
                    value={uploadFormData.fileUrl}
                    onChange={(e) =>
                      setUploadFormData({
                        ...uploadFormData,
                        fileUrl: e.target.value,
                      })
                    }
                    disabled={isUploading}
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Can be a URL to a video file or a local file path on the server
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Title</Label>
                  <Input
                    id="name"
                    placeholder="Video title"
                    value={uploadFormData.name}
                    onChange={(e) =>
                      setUploadFormData({
                        ...uploadFormData,
                        name: e.target.value,
                      })
                    }
                    disabled={isUploading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Video description"
                    value={uploadFormData.description}
                    onChange={(e) =>
                      setUploadFormData({
                        ...uploadFormData,
                        description: e.target.value,
                      })
                    }
                    disabled={isUploading}
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Privacy Settings</h3>
                  
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="privacyView">Who can view this video?</Label>
                      <Select
                        value={uploadFormData.privacy.view}
                        onValueChange={(value: any) =>
                          setUploadFormData({
                            ...uploadFormData,
                            privacy: {
                              ...uploadFormData.privacy,
                              view: value,
                            },
                          })
                        }
                        disabled={isUploading}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="anybody">Anybody</SelectItem>
                          <SelectItem value="nobody">Nobody</SelectItem>
                          <SelectItem value="password">Password Protected</SelectItem>
                          <SelectItem value="disable">Disable</SelectItem>
                          <SelectItem value="unlisted">Unlisted</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="privacyEmbed">Who can embed this video?</Label>
                      <Select
                        value={uploadFormData.privacy.embed}
                        onValueChange={(value: any) =>
                          setUploadFormData({
                            ...uploadFormData,
                            privacy: {
                              ...uploadFormData.privacy,
                              embed: value,
                            },
                          })
                        }
                        disabled={isUploading}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">Public</SelectItem>
                          <SelectItem value="private">Private</SelectItem>
                          <SelectItem value="whitelist">Whitelist</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="download"
                        checked={uploadFormData.privacy.download}
                        onCheckedChange={(checked) =>
                          setUploadFormData({
                            ...uploadFormData,
                            privacy: {
                              ...uploadFormData.privacy,
                              download: checked === true,
                            },
                          })
                        }
                        disabled={isUploading}
                      />
                      <Label htmlFor="download">Allow downloads</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="add"
                        checked={uploadFormData.privacy.add}
                        onCheckedChange={(checked) =>
                          setUploadFormData({
                            ...uploadFormData,
                            privacy: {
                              ...uploadFormData.privacy,
                              add: checked === true,
                            },
                          })
                        }
                        disabled={isUploading}
                      />
                      <Label htmlFor="add">Allow adding to collections</Label>
                    </div>
                  </div>
                </div>

                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Upload progress</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} />
                  </div>
                )}

                <Button type="submit" disabled={isUploading} className="w-full">
                  {isUploading ? (
                    <>
                      <span className="animate-spin mr-2">
                        <RefreshCw size={16} />
                      </span>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" /> Upload to Vimeo
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Captions Management Tab */}
        <TabsContent value="captions">
          <Card>
            <CardHeader>
              <CardTitle>Captions Management</CardTitle>
              <CardDescription>
                Upload and manage captions for your videos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isVideosLoading ? (
                <div className="flex items-center justify-center p-8">
                  <span className="animate-spin mr-2">
                    <RefreshCw size={20} />
                  </span>
                  Loading videos...
                </div>
              ) : videos.length === 0 ? (
                <div className="text-center py-8">
                  <Film className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-lg font-semibold">No videos found</h3>
                  <p className="text-sm text-muted-foreground">
                    Upload videos first to manage captions
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="videoSelect">Select Video:</Label>
                    <Select
                      onValueChange={(value) => {
                        setSelectedVideoId(value);
                        // Load captions for the selected video
                        setIsCaptionsLoading(true);
                        setVideoCaptions([]);
                        
                        apiRequest('GET', `/api/vimeo/videos/${value}/captions`)
                          .then(response => response.json())
                          .then(data => {
                            setVideoCaptions(data);
                          })
                          .catch(error => {
                            console.error('Failed to fetch captions:', error);
                            toast({
                              title: 'Error',
                              description: 'Failed to load video captions.',
                              variant: 'destructive',
                            });
                          })
                          .finally(() => {
                            setIsCaptionsLoading(false);
                          });
                      }}
                    >
                      <SelectTrigger id="videoSelect" className="w-[350px]">
                        <SelectValue placeholder="Select a video" />
                      </SelectTrigger>
                      <SelectContent>
                        {videos.map((video) => (
                          <SelectItem key={video.id} value={video.id}>
                            {video.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedVideoId ? (
                    <div className="border rounded-md p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Captions for Selected Video</h3>
                        <Button 
                          variant="outline"
                          onClick={() => {
                            // This will open a file upload dialog
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = '.srt,.vtt';
                            input.onchange = async (e) => {
                              const files = (e.target as HTMLInputElement).files;
                              if (files && files[0]) {
                                const file = files[0];
                                
                                toast({
                                  title: 'Upload Initiated',
                                  description: `Uploading ${file.name}...`,
                                });
                                
                                try {
                                  // Determine language from filename (e.g., "filename-en.srt" -> "en")
                                  let language = 'en'; // Default to English
                                  const nameMatch = file.name.match(/-([a-z]{2})\.(srt|vtt)$/i);
                                  if (nameMatch && nameMatch[1]) {
                                    language = nameMatch[1].toLowerCase();
                                  }
                                  
                                  // Create a reader to read the file content
                                  const reader = new FileReader();
                                  reader.onload = async (event) => {
                                    if (event.target && event.target.result) {
                                      const fileContent = event.target.result as string;
                                      
                                      // Send file content to the server
                                      const response = await apiRequest('POST', `/api/vimeo/videos/${selectedVideoId}/captions`, {
                                        language: language,
                                        name: file.name.replace(/\.(srt|vtt)$/i, ''),
                                        fileUrl: fileContent,
                                        type: file.name.endsWith('.srt') ? 'subtitles' : 'captions'
                                      });
                                      
                                      if (response.ok) {
                                        toast({
                                          title: 'Caption Uploaded',
                                          description: `Successfully uploaded caption in ${language} language.`,
                                        });
                                        
                                        // Refresh captions list
                                        setIsCaptionsLoading(true);
                                        const captionsResponse = await apiRequest('GET', `/api/vimeo/videos/${selectedVideoId}/captions`);
                                        const captionsData = await captionsResponse.json();
                                        setVideoCaptions(captionsData);
                                        setIsCaptionsLoading(false);
                                      } else {
                                        const errorData = await response.text();
                                        throw new Error(errorData);
                                      }
                                    }
                                  };
                                  
                                  reader.readAsText(file);
                                } catch (error) {
                                  console.error('Failed to upload caption:', error);
                                  toast({
                                    title: 'Upload Failed',
                                    description: error instanceof Error ? error.message : 'Failed to upload caption file',
                                    variant: 'destructive',
                                  });
                                }
                              }
                            };
                            input.click();
                          }}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload New Caption
                        </Button>
                      </div>
                      
                      {isCaptionsLoading ? (
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground py-4">
                          <span className="animate-spin">
                            <RefreshCw size={16} />
                          </span>
                          <span>Loading captions...</span>
                        </div>
                      ) : videoCaptions.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Language</TableHead>
                              <TableHead>Name</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {videoCaptions.map((caption, index) => (
                              <TableRow key={index}>
                                <TableCell>
                                  <Badge variant={caption.active ? "default" : "outline"}>
                                    {caption.language}
                                  </Badge>
                                </TableCell>
                                <TableCell>{caption.name}</TableCell>
                                <TableCell>
                                  {caption.active ? (
                                    <span className="text-xs text-green-600 dark:text-green-400 flex items-center">
                                      <CheckCircle2 className="h-4 w-4 mr-1" /> Default
                                    </span>
                                  ) : (
                                    <span className="text-xs text-muted-foreground">Inactive</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <div className="flex space-x-2">
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      onClick={() => {
                                        window.open(caption.link, '_blank');
                                      }}
                                    >
                                      <Download className="h-4 w-4 mr-1" /> Download
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={async () => {
                                        try {
                                          // Toggle caption active status (set as default or remove default)
                                          const response = await apiRequest(
                                            'PUT', 
                                            `/api/vimeo/videos/${selectedVideoId}/captions/${caption.uri.split('/').pop()}`, 
                                            { active: !caption.active }
                                          );
                                          
                                          if (response.ok) {
                                            toast({
                                              title: caption.active ? 'Default Removed' : 'Default Set',
                                              description: caption.active 
                                                ? `Removed ${caption.language} as default caption` 
                                                : `Set ${caption.language} as default caption`,
                                            });
                                            
                                            // Refresh captions list
                                            setIsCaptionsLoading(true);
                                            const captionsResponse = await apiRequest('GET', `/api/vimeo/videos/${selectedVideoId}/captions`);
                                            const captionsData = await captionsResponse.json();
                                            setVideoCaptions(captionsData);
                                            setIsCaptionsLoading(false);
                                          } else {
                                            const errorData = await response.text();
                                            throw new Error(errorData);
                                          }
                                        } catch (error) {
                                          console.error('Failed to update caption status:', error);
                                          toast({
                                            title: 'Update Failed',
                                            description: error instanceof Error ? error.message : 'Failed to update caption status',
                                            variant: 'destructive',
                                          });
                                        }
                                      }}
                                    >
                                      {caption.active ? (
                                        <>
                                          <X className="h-4 w-4 mr-1" /> Remove Default
                                        </>
                                      ) : (
                                        <>
                                          <Check className="h-4 w-4 mr-1" /> Set as Default
                                        </>
                                      )}
                                    </Button>
                                    <Button 
                                      variant="destructive" 
                                      size="sm"
                                      onClick={async () => {
                                        try {
                                          // Delete caption
                                          const response = await apiRequest(
                                            'DELETE', 
                                            `/api/vimeo/videos/${selectedVideoId}/captions/${caption.uri.split('/').pop()}`
                                          );
                                          
                                          if (response.ok) {
                                            toast({
                                              title: 'Caption Deleted',
                                              description: `Successfully deleted ${caption.language} caption`,
                                            });
                                            
                                            // Remove from local state
                                            setVideoCaptions(prev => prev.filter(c => c.uri !== caption.uri));
                                          } else {
                                            const errorData = await response.text();
                                            throw new Error(errorData);
                                          }
                                        } catch (error) {
                                          console.error('Failed to delete caption:', error);
                                          toast({
                                            title: 'Delete Failed',
                                            description: error instanceof Error ? error.message : 'Failed to delete caption',
                                            variant: 'destructive',
                                          });
                                        }
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <div className="text-center py-8">
                          <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                          <h3 className="mt-2 text-lg font-semibold">No captions found</h3>
                          <p className="text-sm text-muted-foreground">
                            This video doesn't have any caption tracks yet. Upload a new caption file to get started.
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center border rounded-md p-8">
                      <Languages className="mx-auto h-12 w-12 text-muted-foreground" />
                      <h3 className="mt-2 text-lg font-semibold">Select a video first</h3>
                      <p className="text-sm text-muted-foreground">
                        Choose a video from the dropdown above to manage its captions
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Thumbnail Preview Dialog */}
      <Dialog open={showThumbnailDialog} onOpenChange={setShowThumbnailDialog}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Thumbnail Preview</DialogTitle>
            <DialogDescription>
              Preview how this thumbnail will appear on the platform.
            </DialogDescription>
          </DialogHeader>
          {activeThumbnailUrl && (
            <div className="space-y-4">
              <div className="flex justify-center border rounded-md p-4 bg-muted/20">
                <img 
                  src={activeThumbnailUrl} 
                  alt="Video thumbnail" 
                  className="max-w-full max-h-[70vh] object-contain rounded-md shadow-md"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="border p-2 rounded-md">
                  <p className="text-xs font-semibold mb-1 text-muted-foreground">Mobile View</p>
                  <div className="aspect-video h-24 overflow-hidden rounded-sm">
                    <img 
                      src={activeThumbnailUrl} 
                      alt="Mobile preview" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="border p-2 rounded-md">
                  <p className="text-xs font-semibold mb-1 text-muted-foreground">Carousel View</p>
                  <div className="aspect-[16/9] h-24 overflow-hidden rounded-sm">
                    <img 
                      src={activeThumbnailUrl} 
                      alt="Carousel preview" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="border p-2 rounded-md">
                  <p className="text-xs font-semibold mb-1 text-muted-foreground">Grid View</p>
                  <div className="aspect-[4/3] h-24 overflow-hidden rounded-sm">
                    <img 
                      src={activeThumbnailUrl} 
                      alt="Grid preview" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
              <div className="text-xs text-muted-foreground px-2">
                <p>Thumbnail URL: <span className="font-mono text-xs break-all">{activeThumbnailUrl}</span></p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}