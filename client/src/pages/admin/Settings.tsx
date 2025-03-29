import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
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
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { 
  Settings2, Save, Trash2, RefreshCw, PlusCircle, LogOut, ShieldAlert,
  Info, Globe, CheckCircle, AlertTriangle, Gauge, RotateCw, FileCode, PanelLeft,
  Moon, Sun, MonitorSmartphone, Paintbrush, Download
} from 'lucide-react';

// Site settings schema
const siteSettingsSchema = z.object({
  siteName: z.string().min(2, "Site name must be at least 2 characters").max(50),
  siteTagline: z.string().max(100, "Tagline cannot exceed 100 characters").optional(),
  contactEmail: z.string().email("Please enter a valid email address"),
  logoUrl: z.string().url("Please enter a valid URL").optional(),
  faviconUrl: z.string().url("Please enter a valid URL").optional(),
  primaryColor: z.string().regex(/^#([A-Fa-f0-9]{6})$/, "Please enter a valid hex color code"),
  facebookUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  twitterUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  instagramUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  youtubeUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
});

type SiteSettingsValues = z.infer<typeof siteSettingsSchema>;

// API Settings schema
const apiSettingsSchema = z.object({
  vimeoToken: z.string().min(5, "API token is required"),
  vimeoClientId: z.string().min(5, "Client ID is required"),
  vimeoClientSecret: z.string().min(5, "Client secret is required"),
  googleAnalyticsId: z.string().optional(),
  adSensePublisherId: z.string().optional(),
});

type ApiSettingsValues = z.infer<typeof apiSettingsSchema>;

// System Settings schema
const systemSettingsSchema = z.object({
  websiteUrl: z.string().url("Please enter a valid URL"),
  maxUploadSize: z.number().int().positive(),
  enableMaintenanceMode: z.boolean().default(false),
  enableRegistration: z.boolean().default(true),
  enablePasswordReset: z.boolean().default(true),
  enableApiAccess: z.boolean().default(false),
  defaultUserRole: z.enum(["user", "premium_user", "editor", "admin"]),
  sessionTimeout: z.number().int().positive(),
  backupSchedule: z.enum(["daily", "weekly", "monthly", "never"]),
  logLevel: z.enum(["error", "warning", "info", "debug"]),
});

type SystemSettingsValues = z.infer<typeof systemSettingsSchema>;

// Default settings
const defaultSiteSettings: SiteSettingsValues = {
  siteName: "Madifa Streams",
  siteTagline: "South African Streaming Platform",
  contactEmail: "admin@madifa.co.za",
  logoUrl: "",
  faviconUrl: "",
  primaryColor: "#6D28D9",
  facebookUrl: "",
  twitterUrl: "",
  instagramUrl: "",
  youtubeUrl: "",
};

const defaultApiSettings: ApiSettingsValues = {
  vimeoToken: "••••••••••••••••••••••••••••••••••••••••••••••••",
  vimeoClientId: "••••••••••••••••••••••",
  vimeoClientSecret: "••••••••••••••••••••••••••••••••••••••••••••••••",
  googleAnalyticsId: "",
  adSensePublisherId: "",
};

const defaultSystemSettings: SystemSettingsValues = {
  websiteUrl: "https://madifa.co.za",
  maxUploadSize: 500,
  enableMaintenanceMode: false,
  enableRegistration: true,
  enablePasswordReset: true,
  enableApiAccess: false,
  defaultUserRole: "user",
  sessionTimeout: 60,
  backupSchedule: "daily",
  logLevel: "error",
};

// Log record interface
interface LogRecord {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  source: string;
  details?: string;
}

export default function Settings() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('site');
  
  // Site settings form
  const siteForm = useForm<SiteSettingsValues>({
    resolver: zodResolver(siteSettingsSchema),
    defaultValues: defaultSiteSettings,
  });
  
  // API settings form
  const apiForm = useForm<ApiSettingsValues>({
    resolver: zodResolver(apiSettingsSchema),
    defaultValues: defaultApiSettings,
  });
  
  // System settings form
  const systemForm = useForm<SystemSettingsValues>({
    resolver: zodResolver(systemSettingsSchema),
    defaultValues: defaultSystemSettings,
  });
  
  // Fetch logs
  const { data: logs, isLoading: logsLoading } = useQuery<LogRecord[]>({
    queryKey: ['/api/admin/logs'],
    enabled: activeTab === 'logs',
  });
  
  // Save site settings mutation
  const saveSiteSettingsMutation = useMutation({
    mutationFn: async (data: SiteSettingsValues) => {
      const response = await fetch('/api/admin/settings/site', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save site settings');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Settings saved',
        description: 'Site settings have been saved successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to save settings. Please try again.',
        variant: 'destructive',
      });
    },
  });
  
  // Save API settings mutation
  const saveApiSettingsMutation = useMutation({
    mutationFn: async (data: ApiSettingsValues) => {
      const response = await fetch('/api/admin/settings/api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save API settings');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Settings saved',
        description: 'API settings have been saved successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to save settings. Please try again.',
        variant: 'destructive',
      });
    },
  });
  
  // Save system settings mutation
  const saveSystemSettingsMutation = useMutation({
    mutationFn: async (data: SystemSettingsValues) => {
      const response = await fetch('/api/admin/settings/system', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save system settings');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Settings saved',
        description: 'System settings have been saved successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to save settings. Please try again.',
        variant: 'destructive',
      });
    },
  });
  
  // Submit handlers
  const onSaveSiteSettings = (data: SiteSettingsValues) => {
    saveSiteSettingsMutation.mutate(data);
  };
  
  const onSaveApiSettings = (data: ApiSettingsValues) => {
    saveApiSettingsMutation.mutate(data);
  };
  
  const onSaveSystemSettings = (data: SystemSettingsValues) => {
    saveSystemSettingsMutation.mutate(data);
  };
  
  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Configure your platform settings and preferences
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="site">
            <Globe className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Site</span>
          </TabsTrigger>
          <TabsTrigger value="api">
            <FileCode className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">API</span>
          </TabsTrigger>
          <TabsTrigger value="system">
            <Settings2 className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">System</span>
          </TabsTrigger>
          <TabsTrigger value="logs">
            <PanelLeft className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Logs</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Site Settings Tab */}
        <TabsContent value="site">
          <Card>
            <CardHeader>
              <CardTitle>Site Settings</CardTitle>
              <CardDescription>
                Configure general information about your streaming platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Form {...siteForm}>
                <form 
                  id="site-settings-form" 
                  onSubmit={siteForm.handleSubmit(onSaveSiteSettings)} 
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Basic Information</h3>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={siteForm.control}
                        name="siteName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Site Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormDescription>
                              The name of your streaming platform
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={siteForm.control}
                        name="contactEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Email</FormLabel>
                            <FormControl>
                              <Input {...field} type="email" />
                            </FormControl>
                            <FormDescription>
                              Primary contact email for users
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={siteForm.control}
                      name="siteTagline"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tagline</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>
                            A short description of your platform
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Appearance</h3>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={siteForm.control}
                        name="logoUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Logo URL</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormDescription>
                              URL to your site logo image
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={siteForm.control}
                        name="faviconUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Favicon URL</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormDescription>
                              URL to your site favicon (16x16px)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={siteForm.control}
                        name="primaryColor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Primary Color</FormLabel>
                            <div className="flex gap-2">
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <div 
                                className="h-10 w-10 rounded-md border"
                                style={{ backgroundColor: field.value }}
                              />
                            </div>
                            <FormDescription>
                              Hex color code (e.g. #6D28D9)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex items-end space-x-2">
                        <Button type="button" variant="outline" className="flex-1">
                          <Sun className="mr-2 h-4 w-4" />
                          Light Mode
                        </Button>
                        <Button type="button" variant="outline" className="flex-1">
                          <Moon className="mr-2 h-4 w-4" />
                          Dark Mode
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Social Media</h3>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={siteForm.control}
                        name="facebookUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Facebook URL</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={siteForm.control}
                        name="twitterUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Twitter URL</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={siteForm.control}
                        name="instagramUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Instagram URL</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={siteForm.control}
                        name="youtubeUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>YouTube URL</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="border-t pt-6">
              <Button 
                form="site-settings-form"
                type="submit"
                disabled={saveSiteSettingsMutation.isPending}
                className="ml-auto"
              >
                {saveSiteSettingsMutation.isPending ? (
                  <>
                    <Spinner className="mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Settings
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* API Settings Tab */}
        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle>API Integrations</CardTitle>
              <CardDescription>
                Manage API keys and external service connections
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Form {...apiForm}>
                <form 
                  id="api-settings-form" 
                  onSubmit={apiForm.handleSubmit(onSaveApiSettings)} 
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Vimeo Integration</h3>
                    
                    <FormField
                      control={apiForm.control}
                      name="vimeoToken"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vimeo API Token</FormLabel>
                          <FormControl>
                            <Input {...field} type="password" />
                          </FormControl>
                          <FormDescription>
                            Access token for Vimeo API integration
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={apiForm.control}
                        name="vimeoClientId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Client ID</FormLabel>
                            <FormControl>
                              <Input {...field} type="password" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={apiForm.control}
                        name="vimeoClientSecret"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Client Secret</FormLabel>
                            <FormControl>
                              <Input {...field} type="password" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="flex justify-end">
                      <Button type="button" variant="outline" size="sm">
                        <RotateCw className="mr-2 h-4 w-4" />
                        Test Connection
                      </Button>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Analytics & Tracking</h3>
                    
                    <FormField
                      control={apiForm.control}
                      name="googleAnalyticsId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Google Analytics ID</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="UA-XXXXXXXXX-X or G-XXXXXXXXXX" />
                          </FormControl>
                          <FormDescription>
                            Your Google Analytics tracking ID
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={apiForm.control}
                      name="adSensePublisherId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Google AdSense Publisher ID</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="pub-XXXXXXXXXXXXXXXX" />
                          </FormControl>
                          <FormDescription>
                            Your AdSense publisher ID if you want to display ads
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="border-t pt-6">
              <Button 
                form="api-settings-form"
                type="submit"
                disabled={saveApiSettingsMutation.isPending}
                className="ml-auto"
              >
                {saveApiSettingsMutation.isPending ? (
                  <>
                    <Spinner className="mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save API Settings
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* System Settings Tab */}
        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>
                Advanced platform configuration and maintenance options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Form {...systemForm}>
                <form 
                  id="system-settings-form" 
                  onSubmit={systemForm.handleSubmit(onSaveSystemSettings)} 
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">General Settings</h3>
                    
                    <FormField
                      control={systemForm.control}
                      name="websiteUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website URL</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>
                            Your main website URL (including https://)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={systemForm.control}
                      name="maxUploadSize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Upload Size (MB)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min={1} 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            Maximum file size for uploads in megabytes
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">User & Security Settings</h3>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={systemForm.control}
                        name="defaultUserRole"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Default User Role</FormLabel>
                            <Select 
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="user">User</SelectItem>
                                <SelectItem value="premium_user">Premium User</SelectItem>
                                <SelectItem value="editor">Editor</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Default role assigned to new users
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={systemForm.control}
                        name="sessionTimeout"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Session Timeout (minutes)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min={5}
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormDescription>
                              How long until user sessions expire
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <FormField
                        control={systemForm.control}
                        name="enableRegistration"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                User Registration
                              </FormLabel>
                              <FormDescription>
                                Allow new users to register on the platform
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
                        control={systemForm.control}
                        name="enablePasswordReset"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Password Reset
                              </FormLabel>
                              <FormDescription>
                                Allow users to reset their passwords
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
                        control={systemForm.control}
                        name="enableApiAccess"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                API Access
                              </FormLabel>
                              <FormDescription>
                                Enable external API access to your platform
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
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Maintenance</h3>
                    
                    <FormField
                      control={systemForm.control}
                      name="enableMaintenanceMode"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-amber-50 dark:bg-amber-950/20">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Maintenance Mode
                            </FormLabel>
                            <FormDescription>
                              Put the site in maintenance mode (only admins can access)
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
                      control={systemForm.control}
                      name="backupSchedule"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Database Backup Schedule</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select schedule" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                              <SelectItem value="never">Never</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            How often to create automatic database backups
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={systemForm.control}
                      name="logLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Log Level</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select log level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="error">Error</SelectItem>
                              <SelectItem value="warning">Warning</SelectItem>
                              <SelectItem value="info">Info</SelectItem>
                              <SelectItem value="debug">Debug</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Detail level for system logs
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex items-center justify-between gap-4">
                      <Button type="button" variant="outline" className="flex-1">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Clear Cache
                      </Button>
                      <Button type="button" variant="outline" className="flex-1">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Backup
                      </Button>
                    </div>
                  </div>
                  
                  <Alert variant="destructive" className="mt-6">
                    <ShieldAlert className="h-4 w-4" />
                    <AlertTitle>Critical Settings</AlertTitle>
                    <AlertDescription>
                      Changes to these settings may affect the functionality of your platform. Proceed with caution.
                    </AlertDescription>
                  </Alert>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="border-t pt-6">
              <Button 
                form="system-settings-form"
                type="submit"
                disabled={saveSystemSettingsMutation.isPending}
                className="ml-auto"
              >
                {saveSystemSettingsMutation.isPending ? (
                  <>
                    <Spinner className="mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save System Settings
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* System Logs Tab */}
        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>System Logs</CardTitle>
                  <CardDescription>
                    View and analyze system activity logs
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select defaultValue="error">
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="Log level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="error">Errors</SelectItem>
                      <SelectItem value="warning">Warnings</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button variant="outline">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                  </Button>
                  
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {logsLoading ? (
                <div className="py-12 text-center">
                  <Spinner size="lg" className="mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading logs...</p>
                </div>
              ) : logs && logs.length > 0 ? (
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Level</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead className="w-full">Message</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="font-mono text-xs">
                            {format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss')}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                log.level === 'error' ? 'destructive' :
                                log.level === 'warning' ? 'outline' : 'secondary'
                              }
                            >
                              {log.level}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {log.source}
                          </TableCell>
                          <TableCell className="font-mono text-xs truncate max-w-[400px]">
                            {log.message}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="py-12 text-center">
                  <PanelLeft className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold">No logs found</h3>
                  <p className="text-muted-foreground mt-2">
                    There are no logs matching the current filters
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t pt-6 flex justify-between">
              <div className="text-sm text-muted-foreground">
                Log retention: 30 days
              </div>
              <Button variant="outline" size="sm">
                <Trash2 className="mr-2 h-4 w-4" />
                Clear Logs
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}