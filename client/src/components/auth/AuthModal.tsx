import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { useAuth } from "@/contexts/AuthContext";
import { useWatchProgress } from "@/contexts/WatchProgressContext";
import { X, CheckIcon, Loader2, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { useLocation } from "wouter";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: "login" | "register" | "upgrade";
  returnToContent?: boolean;
}

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

const registerSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  fullName: z.string().optional(),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string().min(6, { message: "Password must be at least 6 characters" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

const AuthModal = ({ isOpen, onClose, initialView = "login", returnToContent = false }: AuthModalProps) => {
  const [activeTab, setActiveTab] = useState<string>(initialView);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { login, register, loginWithGoogle } = useAuth();
  const { pendingPosition, clearPendingPosition } = useWatchProgress();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  
  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      fullName: "",
      password: "",
      confirmPassword: "",
    },
  });
  
  const onLoginSubmit = async (values: LoginFormValues) => {
    try {
      // We don't need to manually set isSubmitting as it's handled by react-hook-form
      await login(values.email, values.password);
      
      toast({
        title: "Login successful",
        description: "Welcome back to Madifa!",
        className: "bg-green-50 border-green-500 text-green-900"
      });
      
      // Add small delay to show success message
      setTimeout(() => {
        // Check if we need to redirect back to content after login
        if (pendingPosition) {
          // Close modal first
          onClose();
          // Then navigate to the content
          setLocation(pendingPosition.url);
          // Clear the pending position since we've handled it
          clearPendingPosition();
        } else {
          onClose();
        }
      }, 1500);
    } catch (error) {
      console.error('Login error:', error);
      
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Something went wrong with authentication. Please try again.",
        variant: "destructive",
      });
      
      // Reset the form state to avoid any issues with isSubmitting
      loginForm.reset(values);
    }
  };
  
  const onRegisterSubmit = async (values: RegisterFormValues) => {
    try {
      // We don't need to manually set isSubmitting as it's handled by react-hook-form
      const { confirmPassword, ...userData } = values;
      await register(userData);
      
      toast({
        title: "Registration successful",
        description: "Welcome to Madifa!",
        className: "bg-green-50 border-green-500 text-green-900"
      });
      
      // Add small delay to show success message
      setTimeout(() => {
        // Check if we need to redirect back to content after registration
        if (pendingPosition) {
          // Close modal first
          onClose();
          // Then navigate to the content
          setLocation(pendingPosition.url);
          // Clear the pending position since we've handled it
          clearPendingPosition();
        } else {
          onClose();
        }
      }, 1500);
    } catch (error) {
      console.error('Registration error:', error);
      
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Account creation failed. Please check your information and try again.",
        variant: "destructive",
      });
      
      // Reset the form state to avoid any issues with isSubmitting
      registerForm.reset(values);
    }
  };

  // Handle Google authentication with proper error handling and loading state
  const handleGoogleAuth = async () => {
    setIsGoogleLoading(true);
    
    toast({
      title: "Google Authentication",
      description: "Connecting to Google...",
    });
    
    try {
      // Use the loginWithGoogle method from AuthContext
      await loginWithGoogle();
      // Note: this code might not execute immediately as the user will be redirected to Google
      // The auth state change listener in AuthContext will handle the redirect back
      
      // When the user returns after Google auth, check if we need to redirect back to content
      // This is handled by the auth state change listener in AuthContext
      // which will check pendingPosition and redirect accordingly
    } catch (error) {
      console.error('Google auth error:', error);
      toast({
        title: "Authentication failed",
        description: error instanceof Error ? error.message : "Could not connect to Google. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <Dialog modal={true} open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-w-[calc(100vw-2rem)] w-full overflow-auto" aria-describedby="auth-dialog-description">
        {/* We're using the built-in close button from DialogPrimitive */}
        <DialogHeader className="flex justify-between items-center">
          <DialogTitle className="text-2xl font-bold">
            {activeTab === "login" ? "Sign In" : activeTab === "register" ? "Create Account" : "Upgrade to Premium"}
          </DialogTitle>
        </DialogHeader>
        <DialogDescription id="auth-dialog-description">
          {activeTab === "login" ? "Enter your credentials to sign in to your account" : activeTab === "register" ? "Create a new account" : "Upgrade your account to premium"}
        </DialogDescription>
        
        <Tabs defaultValue={initialView} value={activeTab} onValueChange={setActiveTab} className="w-full">
          {initialView === "upgrade" ? (
            // No tabs for upgrade view - this is only shown for authenticated users
            <div></div>
          ) : (
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="register">Sign Up</TabsTrigger>
            </TabsList>
          )}
          
          <TabsContent value="login">
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                <FormField
                  control={loginForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="your@email.com"
                          {...field}
                          className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showLoginPassword ? "text" : "password"}
                            placeholder="********"
                            {...field}
                            className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowLoginPassword(prev => !prev)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 focus:outline-none"
                            aria-label={showLoginPassword ? "Hide password" : "Show password"}
                          >
                            {showLoginPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <div className="flex justify-between mt-1">
                        <div className="flex items-center space-x-1.5">
                          <Checkbox 
                            id="remember-me" 
                            checked={rememberMe} 
                            onCheckedChange={(checked) => setRememberMe(checked === true)}
                            className="h-2.5 w-2.5 border-gray-400 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          />
                          <label
                            htmlFor="remember-me"
                            className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700 dark:text-gray-300 cursor-pointer"
                          >
                            Remember me
                          </label>
                        </div>
                        <Button variant="link" className="p-0 h-auto text-xs text-primary">
                          Forgot password?
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <motion.div 
                  whileTap={{ scale: 0.97 }}
                  whileHover={{ scale: 1.01 }}
                >
                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary/90 font-medium shadow-sm transition-all duration-300 ease-in-out transform hover:shadow-md focus:ring-2 focus:ring-primary/50 focus:ring-offset-2" 
                    disabled={loginForm.formState.isSubmitting}
                  >
                    {loginForm.formState.isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </motion.div>
              </form>
            </Form>
            
            <div className="flex items-center my-4">
              <div className="flex-grow border-t border-gray-700"></div>
              <span className="mx-4 text-muted-foreground text-sm">Or continue with</span>
              <div className="flex-grow border-t border-gray-700"></div>
            </div>
            
            <div className="flex justify-center">
              <motion.div 
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.01 }}
                className="w-full max-w-xs"
              >
                <Button 
                  variant="outline" 
                  className="border-gray-700 flex items-center gap-2 w-full transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-800 shadow-sm hover:shadow-md focus:ring-2 focus:ring-gray-400/50 focus:ring-offset-2"
                  disabled={isGoogleLoading}
                  onClick={handleGoogleAuth}
                >
                  {isGoogleLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                      </svg>
                      Continue with Google
                    </>
                  )}
                </Button>
              </motion.div>
            </div>
          </TabsContent>
          
          <TabsContent value="register">
            <Form {...registerForm}>
              <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                <FormField
                  control={registerForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="username"
                          {...field}
                          className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={registerForm.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Your Name"
                          {...field}
                          className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={registerForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="your@email.com"
                          {...field}
                          className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={registerForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showRegisterPassword ? "text" : "password"}
                            placeholder="********"
                            {...field}
                            className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowRegisterPassword(prev => !prev)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 focus:outline-none"
                            aria-label={showRegisterPassword ? "Hide password" : "Show password"}
                          >
                            {showRegisterPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={registerForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="********"
                            {...field}
                            className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(prev => !prev)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 focus:outline-none"
                            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <motion.div 
                  whileTap={{ scale: 0.97 }}
                  whileHover={{ scale: 1.01 }}
                >
                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary/90 font-medium shadow-sm transition-all duration-300 ease-in-out transform hover:shadow-md focus:ring-2 focus:ring-primary/50 focus:ring-offset-2"
                    disabled={registerForm.formState.isSubmitting}
                  >
                    {registerForm.formState.isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </motion.div>
              </form>
            </Form>
            
            <div className="flex items-center my-4">
              <div className="flex-grow border-t border-gray-700"></div>
              <span className="mx-4 text-muted-foreground text-sm">Or continue with</span>
              <div className="flex-grow border-t border-gray-700"></div>
            </div>
            
            <div className="flex justify-center">
              <motion.div 
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.01 }}
                className="w-full max-w-xs"
              >
                <Button 
                  variant="outline" 
                  className="border-gray-700 flex items-center gap-2 w-full transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-800 shadow-sm hover:shadow-md focus:ring-2 focus:ring-gray-400/50 focus:ring-offset-2"
                  disabled={isGoogleLoading}
                  onClick={handleGoogleAuth}
                >
                  {isGoogleLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                      </svg>
                      Continue with Google
                    </>
                  )}
                </Button>
              </motion.div>
            </div>
          </TabsContent>
          
          <TabsContent value="upgrade">
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-bold mb-2">Unlock Premium Content</h3>
                <p className="text-muted-foreground mb-6">
                  Upgrade to Premium to access all content, download videos, and enjoy an ad-free experience.
                </p>
              </div>
              
              <div className="bg-card rounded-lg p-6 border border-primary">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-bold">Premium Subscription</h4>
                  <span className="bg-primary text-white text-xs px-2 py-1 rounded-md">R59/month</span>
                </div>
                
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <CheckIcon className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                    <span>Access to all premium movies and series</span>
                  </li>
                  <li className="flex items-start">
                    <CheckIcon className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                    <span>Download videos for offline viewing</span>
                  </li>
                  <li className="flex items-start">
                    <CheckIcon className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                    <span>Ad-free viewing experience</span>
                  </li>
                  <li className="flex items-start">
                    <CheckIcon className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                    <span>HD video quality on all devices</span>
                  </li>
                  <li className="flex items-start">
                    <CheckIcon className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                    <span>Cancel anytime</span>
                  </li>
                </ul>
                
                <motion.div 
                  whileTap={{ scale: 0.97 }}
                  whileHover={{ scale: 1.01 }}
                >
                  <Button 
                    onClick={() => {
                      // Navigate to subscription page
                      window.location.href = "/subscription";
                      onClose();
                    }}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium shadow-sm transition-all duration-300 ease-in-out transform hover:shadow-md focus:ring-2 focus:ring-orange-600/50 focus:ring-offset-2"
                  >
                    Start Premium Subscription
                  </Button>
                </motion.div>
              </div>
              
              <p className="text-center text-sm text-muted-foreground">
                Need more information? Visit our <a href="/pricing" className="text-primary">pricing page</a>.
              </p>
            </div>
          </TabsContent>
        </Tabs>
        
        <p className="text-center text-muted-foreground text-sm mt-6">
          By continuing, you agree to our{" "}
          <a href="#" className="text-primary hover:underline">
            Terms of Service
          </a>{" "}
          and acknowledge our{" "}
          <a href="#" className="text-primary hover:underline">
            Privacy Policy
          </a>
          .
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;