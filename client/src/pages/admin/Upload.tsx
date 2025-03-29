import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { 
  FilmIcon, CheckIcon, Upload as UploadIcon, CloudUpload, FileVideo, 
  Link2, AlertCircle, Clock, ImageIcon, Info
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Category interface
interface Category {
  id: number;
  name: string;
  description?: string;
  thumbnailUrl?: string;
}

// Upload form schema
const uploadFormSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters long").max(100),
  description: z.string().min(10, "Description must be at least 10 characters long"),
  categoryId: z.number().positive("Please select a category"),
  contentType: z.enum(['movie', 'series', 'music_video', 'trailer', 'short_film'], {
    required_error: "Please select a content type",
  }),
  releaseYear: z.number().int().min(1900).max(new Date().getFullYear() + 5),
  isPremium: z.boolean().default(false),
  displayPriority: z.number().int().min(0).max(100).default(0),
  thumbnailUrl: z.string().url("Please enter a valid URL").optional(),
  videoUrl: z.string().url("Please enter a valid URL"),
  trailerUrl: z.string().url("Please enter a valid URL").optional(),
  duration: z.number().int().positive().optional(),
  rating: z.string().optional(),
});

type UploadFormValues = z.infer<typeof uploadFormSchema>;

// Direct upload component
const DirectUploadTab = () => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isVideoParsing, setIsVideoParsing] = useState(false);
  
  // Fetch categories for the form select
  const { data: categories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });
  
  // Define form with validation
  const form = useForm<UploadFormValues>({
    resolver: zodResolver(uploadFormSchema),
    defaultValues: {
      title: '',
      description: '',
      contentType: 'movie',
      releaseYear: new Date().getFullYear(),
      isPremium: false,
      displayPriority: 0,
    },
  });
  
  // Handle file selection for direct upload
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Start mock upload process
    setIsUploading(true);
    setUploadProgress(0);
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        const newProgress = prev + 5;
        if (newProgress >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setIsVideoParsing(true);
          
          // Simulate video processing
          setTimeout(() => {
            setIsVideoParsing(false);
            
            // Auto-fill form with filename and other details
            form.setValue('title', file.name.replace(/\.[^/.]+$/, ""));
            form.setValue('videoUrl', `https://example.com/videos/${file.name}`);
            
            toast({
              title: 'Upload Complete',
              description: 'Video has been uploaded and is ready to be published',
            });
          }, 2000);
          
          return 100;
        }
        return newProgress;
      });
    }, 300);
  };
  
  // Submit handler
  const onSubmit = (data: UploadFormValues) => {
    console.log('Form data submitted:', data);
    toast({
      title: 'Video Published',
      description: 'Your video has been successfully published',
    });
  };
  
  return (
    <div>
      {(isUploading || isVideoParsing) ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-10">
              {isUploading ? (
                <>
                  <CloudUpload className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Uploading Video...</h3>
                  <div className="max-w-md mx-auto mb-4">
                    <Slider
                      value={[uploadProgress]}
                      max={100}
                      step={1}
                      disabled
                    />
                    <div className="text-right text-sm text-muted-foreground mt-1">
                      {uploadProgress}%
                    </div>
                  </div>
                  <p className="text-muted-foreground">
                    Please don't close this window while your video is uploading
                  </p>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-center mb-4">
                    <Spinner size="lg" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Processing Video</h3>
                  <p className="text-muted-foreground mb-2">
                    We're analyzing and preparing your video...
                  </p>
                  <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>This may take a few minutes</span>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-5">
            {/* Upload Section */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Upload Video</CardTitle>
                <CardDescription>
                  Select a video file from your computer
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <FileVideo className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Drop your video here</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    MP4, MOV, or WebM formats supported. Max size 5GB.
                  </p>
                  <Input
                    type="file"
                    className="hidden"
                    id="video-upload"
                    accept="video/mp4,video/quicktime,video/webm"
                    onChange={handleFileSelect}
                  />
                  <Button asChild>
                    <label htmlFor="video-upload">
                      <UploadIcon className="mr-2 h-4 w-4" />
                      Select Video
                    </label>
                  </Button>
                </div>
                
                <div className="mt-6">
                  <h4 className="text-sm font-semibold mb-2">Or add from URL</h4>
                  <div className="flex gap-2">
                    <Input placeholder="https://example.com/video.mp4" />
                    <Button variant="outline">
                      <Link2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="text-sm text-muted-foreground flex flex-col items-start">
                <div className="flex items-center mb-2">
                  <Info className="h-4 w-4 mr-2" />
                  <span>Need to upload multiple videos?</span>
                </div>
                <Button variant="link" className="p-0 h-auto" asChild>
                  <a href="/admin/vimeo">Use the Vimeo Management section instead</a>
                </Button>
              </CardFooter>
            </Card>
            
            {/* Content Information Form */}
            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle>Content Information</CardTitle>
                <CardDescription>
                  Fill in the details about your video
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter video title" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Enter a detailed description" 
                              rows={3}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="contentType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Content Type</FormLabel>
                            <Select 
                              onValueChange={(value) => field.onChange(value)}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select content type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="movie">Movie</SelectItem>
                                <SelectItem value="series">Series</SelectItem>
                                <SelectItem value="music_video">Music Video</SelectItem>
                                <SelectItem value="trailer">Trailer</SelectItem>
                                <SelectItem value="short_film">Short Film</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="categoryId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select 
                              onValueChange={(value) => field.onChange(parseInt(value))}
                              defaultValue={field.value?.toString()}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {categories?.map((category) => (
                                  <SelectItem 
                                    key={category.id} 
                                    value={category.id.toString()}
                                  >
                                    {category.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="releaseYear"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Release Year</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min={1900}
                                max={new Date().getFullYear() + 5}
                                {...field}
                                onChange={e => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="rating"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Content Rating</FormLabel>
                            <Select 
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select rating" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="G">G</SelectItem>
                                <SelectItem value="PG">PG</SelectItem>
                                <SelectItem value="PG-13">PG-13</SelectItem>
                                <SelectItem value="R">R</SelectItem>
                                <SelectItem value="NC-17">NC-17</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="thumbnailUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Thumbnail URL</FormLabel>
                            <FormControl>
                              <Input placeholder="https://..." {...field} />
                            </FormControl>
                            <FormDescription>
                              URL for the video thumbnail image
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="trailerUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Trailer URL (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="https://..." {...field} />
                            </FormControl>
                            <FormDescription>
                              URL for the trailer video if available
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="isPremium"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Premium Content
                            </FormLabel>
                            <FormDescription>
                              Mark this content as premium (subscribers only)
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="displayPriority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Display Priority ({field.value})</FormLabel>
                          <FormControl>
                            <Slider
                              value={[field.value]}
                              max={100}
                              step={1}
                              onValueChange={(vals) => field.onChange(vals[0])}
                            />
                          </FormControl>
                          <FormDescription>
                            Higher values will be displayed more prominently
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" className="w-full md:w-auto">
                      <CheckIcon className="mr-2 h-4 w-4" />
                      Publish Content
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
          
          <Alert className="mt-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Video Processing</AlertTitle>
            <AlertDescription>
              After uploading, videos are processed in the background. This can take a few minutes
              depending on the file size and format. You'll be notified when processing is complete.
            </AlertDescription>
          </Alert>
        </>
      )}
    </div>
  );
};

// Vimeo upload tab
const VimeoUploadTab = () => {
  return (
    <div className="text-center py-10">
      <FilmIcon className="h-12 w-12 text-primary mx-auto mb-4" />
      <h3 className="text-lg font-semibold mb-2">Vimeo Integration</h3>
      <p className="text-muted-foreground max-w-md mx-auto mb-6">
        For more advanced video management, use our dedicated Vimeo management interface.
      </p>
      <Button asChild>
        <a href="/admin/vimeo">Go to Vimeo Management</a>
      </Button>
    </div>
  );
};

export default function Upload() {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Upload Content</h1>
        <p className="text-muted-foreground">
          Add new videos and media to your platform
        </p>
      </div>

      <Tabs defaultValue="direct" className="space-y-6">
        <TabsList>
          <TabsTrigger value="direct">Direct Upload</TabsTrigger>
          <TabsTrigger value="vimeo">Vimeo</TabsTrigger>
        </TabsList>
        
        <TabsContent value="direct">
          <DirectUploadTab />
        </TabsContent>
        
        <TabsContent value="vimeo">
          <VimeoUploadTab />
        </TabsContent>
      </Tabs>
    </>
  );
}