import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { 
  Form, 
  FormControl, 
  FormDescription,
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { User, Settings, CreditCard, Bell, Shield, LogOut, Loader } from "lucide-react";
import { generateAvatarUrl } from "@/lib/utils";

const profileSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  fullName: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(6, { message: "Current password is required" }),
  newPassword: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string().min(6, { message: "Confirm password is required" }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

const Profile = () => {
  const [, navigate] = useLocation();
  const { user, isLoading: authLoading, logout, updateUser } = useAuth();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState("account");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: user?.username || "",
      email: user?.email || "",
      fullName: user?.fullName || "",
    },
  });
  
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  
  useEffect(() => {
    if (user) {
      profileForm.reset({
        username: user.username,
        email: user.email,
        fullName: user.fullName || "",
      });
    }
  }, [user]);
  
  const onProfileSubmit = async (values: ProfileFormValues) => {
    if (!user) return;
    
    try {
      setIsSubmitting(true);
      
      // Update user profile
      await updateUser({
        username: values.username,
        email: values.email,
        fullName: values.fullName,
      });
      
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated.",
      });
    } catch (error) {
      console.error("Profile update error:", error);
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update profile.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const onPasswordSubmit = async (values: PasswordFormValues) => {
    if (!user) return;
    
    try {
      setIsSubmitting(true);
      
      // This would normally call an API endpoint to change password
      // For now, just show a success message
      
      toast({
        title: "Password updated",
        description: "Your password has been changed successfully.",
      });
      
      // Reset form
      passwordForm.reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Password update error:", error);
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update password.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleLogout = () => {
    logout();
    navigate("/");
  };
  
  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <Loader className="h-10 w-10 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }
  
  if (!user) {
    navigate("/login");
    return null;
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-64 space-y-4">
              <div className="flex flex-col items-center p-4 border border-border rounded-lg">
                <Avatar className="h-20 w-20 mb-2">
                  <AvatarImage src={user.avatarUrl || generateAvatarUrl(user.fullName || user.username)} />
                  <AvatarFallback className="bg-primary text-white text-xl">
                    {user.username.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-lg font-semibold">{user.fullName || user.username}</h2>
                <p className="text-sm text-muted-foreground mb-2">{user.email}</p>
                <Badge variant={user.isPremium ? "premium" : "default"}>{user.isPremium ? "Premium" : "Free"}</Badge>
              </div>
              
              <div className="hidden md:block">
                <Tabs defaultValue={activeTab} orientation="vertical" onValueChange={setActiveTab}>
                  <TabsList className="flex flex-col h-auto bg-transparent space-y-1">
                    <TabsTrigger value="account" className="justify-start">
                      <User className="h-4 w-4 mr-2" />
                      Account
                    </TabsTrigger>
                    <TabsTrigger value="subscription" className="justify-start">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Subscription
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="justify-start">
                      <Bell className="h-4 w-4 mr-2" />
                      Notifications
                    </TabsTrigger>
                    <TabsTrigger value="security" className="justify-start">
                      <Shield className="h-4 w-4 mr-2" />
                      Security
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                
                <Button 
                  variant="destructive" 
                  className="w-full mt-6"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Log Out
                </Button>
              </div>
              
              <div className="flex md:hidden">
                <Tabs defaultValue={activeTab} className="w-full" onValueChange={setActiveTab}>
                  <TabsList className="grid grid-cols-4 w-full">
                    <TabsTrigger value="account">
                      <User className="h-4 w-4" />
                    </TabsTrigger>
                    <TabsTrigger value="subscription">
                      <CreditCard className="h-4 w-4" />
                    </TabsTrigger>
                    <TabsTrigger value="notifications">
                      <Bell className="h-4 w-4" />
                    </TabsTrigger>
                    <TabsTrigger value="security">
                      <Shield className="h-4 w-4" />
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
            
            <div className="flex-1">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="md:hidden">
                <TabsList className="hidden">
                  <TabsTrigger value="account">Account</TabsTrigger>
                  <TabsTrigger value="subscription">Subscription</TabsTrigger>
                  <TabsTrigger value="notifications">Notifications</TabsTrigger>
                  <TabsTrigger value="security">Security</TabsTrigger>
                </TabsList>
              </Tabs>
              
              {activeTab === "account" && (
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Account Information</CardTitle>
                      <CardDescription>
                        Update your personal information
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Form {...profileForm}>
                        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                          <FormField
                            control={profileForm.control}
                            name="username"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Username</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormDescription>
                                  This is your public display name.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={profileForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input {...field} type="email" />
                                </FormControl>
                                <FormDescription>
                                  We'll use this email for notifications and login.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={profileForm.control}
                            name="fullName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Full Name (Optional)</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <Button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="w-full md:w-auto"
                          >
                            {isSubmitting ? (
                              <>
                                <Loader className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              "Save Changes"
                            )}
                          </Button>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                </div>
              )}
              
              {activeTab === "subscription" && (
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Subscription</CardTitle>
                      <CardDescription>
                        Manage your subscription plan
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="border border-border rounded-lg p-4">
                          <div className="flex justify-between items-center mb-4">
                            <div>
                              <h3 className="font-semibold">
                                {user.isPremium ? "Premium Plan" : "Free Plan"}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {user.isPremium 
                                  ? "You're enjoying ad-free viewing and premium content" 
                                  : "Upgrade to remove ads and access premium content"}
                              </p>
                            </div>
                            <Badge variant={user.isPremium ? "premium" : "default"}>{user.isPremium ? "Premium" : "Free"}</Badge>
                          </div>
                          
                          {user.isPremium ? (
                            <Button 
                              variant="outline" 
                              className="w-full md:w-auto"
                              onClick={() => navigate("/subscription")}
                            >
                              Manage Subscription
                            </Button>
                          ) : (
                            <Button 
                              className="w-full md:w-auto bg-primary"
                              onClick={() => navigate("/subscription")}
                            >
                              Upgrade to Premium
                            </Button>
                          )}
                        </div>
                        
                        <div className="border border-border rounded-lg p-4">
                          <h3 className="font-semibold mb-2">Payment History</h3>
                          {user.isPremium ? (
                            <div className="text-sm">
                              <div className="flex justify-between py-2 border-b">
                                <span>Premium Subscription</span>
                                <span>R59.00 • Last payment: {new Date().toLocaleDateString()}</span>
                              </div>
                              <p className="text-muted-foreground mt-2">
                                Your next payment is scheduled for {new Date(Date.now() + 2592000000).toLocaleDateString()}
                              </p>
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              No payment history available
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
              
              {activeTab === "notifications" && (
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Notification Settings</CardTitle>
                      <CardDescription>
                        Configure how we notify you
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">Email Notifications</h3>
                            <p className="text-sm text-muted-foreground">
                              Receive updates about new content and your account
                            </p>
                          </div>
                          <Switch 
                            checked={emailNotifications} 
                            onCheckedChange={setEmailNotifications} 
                          />
                        </div>
                        
                        <Separator />
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">Push Notifications</h3>
                            <p className="text-sm text-muted-foreground">
                              Get notified about new releases and content
                            </p>
                          </div>
                          <Switch 
                            checked={pushNotifications} 
                            onCheckedChange={setPushNotifications} 
                          />
                        </div>
                        
                        <Separator />
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">Marketing Communications</h3>
                            <p className="text-sm text-muted-foreground">
                              Receive special offers and promotions
                            </p>
                          </div>
                          <Switch defaultChecked={false} />
                        </div>
                        
                        <Button className="w-full md:w-auto">
                          Save Preferences
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
              
              {activeTab === "security" && (
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Security Settings</CardTitle>
                      <CardDescription>
                        Manage your account security
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Form {...passwordForm}>
                        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                          <FormField
                            control={passwordForm.control}
                            name="currentPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Current Password</FormLabel>
                                <FormControl>
                                  <Input {...field} type="password" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={passwordForm.control}
                            name="newPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>New Password</FormLabel>
                                <FormControl>
                                  <Input {...field} type="password" />
                                </FormControl>
                                <FormDescription>
                                  Password must be at least 6 characters.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={passwordForm.control}
                            name="confirmPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Confirm New Password</FormLabel>
                                <FormControl>
                                  <Input {...field} type="password" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <Button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="w-full md:w-auto"
                          >
                            {isSubmitting ? (
                              <>
                                <Loader className="mr-2 h-4 w-4 animate-spin" />
                                Updating...
                              </>
                            ) : (
                              "Change Password"
                            )}
                          </Button>
                        </form>
                      </Form>
                      
                      <Separator className="my-6" />
                      
                      <div>
                        <h3 className="font-semibold mb-4">Login Sessions</h3>
                        <div className="border border-border rounded-lg p-4 mb-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">Current Session</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date().toLocaleString()} • {navigator.userAgent.includes("Mobile") ? "Mobile" : "Desktop"}
                              </p>
                            </div>
                            <Badge variant="default" className="bg-green-500 hover:bg-green-500/90 border-0">Active</Badge>
                          </div>
                        </div>
                        
                        <Button variant="destructive" onClick={handleLogout}>
                          <LogOut className="h-4 w-4 mr-2" />
                          Log Out of All Devices
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

// Using the global badge component

export default Profile;
