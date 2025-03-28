import { useState } from "react";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/contexts/AuthContext";
import { X, CheckIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: "login" | "register" | "upgrade";
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

const AuthModal = ({ isOpen, onClose, initialView = "login" }: AuthModalProps) => {
  const [activeTab, setActiveTab] = useState<string>(initialView);
  const { login, register } = useAuth();
  const { toast } = useToast();
  
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
      await login(values.email, values.password);
      toast({
        title: "Login successful",
        description: "Welcome back to Madifa!",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    }
  };
  
  const onRegisterSubmit = async (values: RegisterFormValues) => {
    try {
      const { confirmPassword, ...userData } = values;
      await register(userData);
      toast({
        title: "Registration successful",
        description: "Welcome to Madifa!",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-background border-gray-700 sm:max-w-md">
        <DialogHeader className="flex justify-between items-center">
          <DialogTitle className="text-2xl font-bold">
            {activeTab === "login" ? "Sign In" : activeTab === "register" ? "Create Account" : "Upgrade to Premium"}
          </DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="absolute right-4 top-4">
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
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
                          className="bg-background border-gray-700"
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
                        <Input
                          type="password"
                          placeholder="********"
                          {...field}
                          className="bg-background border-gray-700"
                        />
                      </FormControl>
                      <div className="flex justify-end mt-1">
                        <Button variant="link" className="p-0 h-auto text-xs text-primary">
                          Forgot password?
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                  Sign In
                </Button>
              </form>
            </Form>
            
            <div className="flex items-center my-4">
              <div className="flex-grow border-t border-gray-700"></div>
              <span className="mx-4 text-muted-foreground text-sm">Or continue with</span>
              <div className="flex-grow border-t border-gray-700"></div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="border-gray-700">
                Google
              </Button>
              <Button variant="outline" className="border-gray-700">
                Facebook
              </Button>
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
                          className="bg-background border-gray-700"
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
                          className="bg-background border-gray-700"
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
                          className="bg-background border-gray-700"
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
                        <Input
                          type="password"
                          placeholder="********"
                          {...field}
                          className="bg-background border-gray-700"
                        />
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
                        <Input
                          type="password"
                          placeholder="********"
                          {...field}
                          className="bg-background border-gray-700"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                  Create Account
                </Button>
              </form>
            </Form>
            
            <div className="flex items-center my-4">
              <div className="flex-grow border-t border-gray-700"></div>
              <span className="mx-4 text-muted-foreground text-sm">Or continue with</span>
              <div className="flex-grow border-t border-gray-700"></div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="border-gray-700">
                Google
              </Button>
              <Button variant="outline" className="border-gray-700">
                Facebook
              </Button>
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
                
                <Button 
                  onClick={() => {
                    // Navigate to subscription page
                    window.location.href = "/subscription";
                    onClose();
                  }}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                >
                  Start Premium Subscription
                </Button>
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
