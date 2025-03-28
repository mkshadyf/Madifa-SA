import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { signInWithGoogle } from "@/lib/firebase";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Loader } from "lucide-react";

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

type RegisterFormValues = z.infer<typeof registerSchema>;

const Register = () => {
  const [, navigate] = useLocation();
  const { register } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      fullName: "",
      password: "",
      confirmPassword: "",
    },
  });
  
  const onSubmit = async (values: RegisterFormValues) => {
    try {
      setIsLoading(true);
      const { confirmPassword, ...userData } = values;
      await register(userData);
      toast({
        title: "Registration successful",
        description: "Welcome to Madifa! Your account has been created.",
      });
      navigate("/");
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Registration failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGoogleSignIn = async () => {
    try {
      // Sign in with Google using Firebase
      const googleUser = await signInWithGoogle();
      
      if (!googleUser) {
        throw new Error("Google authentication failed");
      }
      
      // Generate a username from email or display name
      const username = googleUser.displayName?.replace(/\s+/g, '_').toLowerCase() || 
                        googleUser.email?.split('@')[0] || 
                        `user_${Date.now()}`;
      
      // Sync with our backend
      const response = await fetch("/api/auth/sync-google-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firebaseUid: googleUser.uid,
          email: googleUser.email,
          username,
          fullName: googleUser.displayName,
          photoURL: googleUser.photoURL,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to sync Google account with Madifa");
      }
      
      const userData = await response.json();
      
      // Show success message
      toast({
        title: "Registration successful",
        description: "Welcome to Madifa!",
      });
      
      return userData;
    } catch (error) {
      console.error("Google sign-in error:", error);
      throw error;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow flex items-center justify-center py-16 px-4">
        <Card className="w-full max-w-md shadow-lg border-gray-700">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Create an Account</CardTitle>
            <CardDescription>Sign up to access premium content and features</CardDescription>
          </CardHeader>
          
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
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
                  control={form.control}
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
                  control={form.control}
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
                  control={form.control}
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
                  control={form.control}
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
                
                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>
            </Form>
            
            <div className="flex items-center my-4">
              <div className="flex-grow border-t border-gray-700"></div>
              <span className="mx-4 text-muted-foreground text-sm">Or continue with</span>
              <div className="flex-grow border-t border-gray-700"></div>
            </div>
            
            <div className="flex justify-center">
              <Button 
                variant="outline" 
                className="border-gray-700 flex items-center gap-2 w-full"
                onClick={async () => {
                  try {
                    setIsLoading(true);
                    await handleGoogleSignIn();
                    navigate("/");
                  } catch (error) {
                    console.error("Google registration error:", error);
                    toast({
                      title: "Registration failed",
                      description: error instanceof Error ? error.message : "Failed to register with Google. Please try again.",
                      variant: "destructive",
                    });
                  } finally {
                    setIsLoading(false);
                  }
                }}
                disabled={isLoading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5">
                  <path d="M12.0002 2C17.5242 2 22.0002 6.476 22.0002 12C22.0002 17.524 17.5242 22 12.0002 22C6.47724 22 2.00024 17.524 2.00024 12C2.00024 6.476 6.47724 2 12.0002 2ZM13.7142 11.2857V9.14286H10.2858C10.2858 9.14286 10.2858 10.2857 10.2858 11.4286C10.2858 12.5714 10.9887 13.4286 12.0002 13.4286C13.0115 13.4286 13.7142 12.5714 13.7142 11.2857ZM14.5713 11.2857C14.5713 13 13.3926 14.2857 12.0002 14.2857C10.6076 14.2857 9.42899 13 9.42899 11.2857V8.28571H14.5713V11.2857ZM8.28585 6.28571H15.7145V7.42857H8.28585V6.28571Z" fill="currentColor"></path>
                </svg>
                {isLoading ? 'Processing...' : 'Continue with Google'}
              </Button>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-center border-t border-gray-700 pt-4">
            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Button variant="link" className="p-0 h-auto text-primary" onClick={() => navigate("/login")}>
                Sign in
              </Button>
            </div>
          </CardFooter>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
};

export default Register;
