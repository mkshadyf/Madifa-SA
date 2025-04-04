import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiRequest } from "@/lib/queryClient";
import { User, InsertUser } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useLocation } from "wouter";
import { useWatchProgress } from "./WatchProgressContext";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: Omit<InsertUser, "confirmPassword">) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  // We'll need to handle pending watch position in the auth state change listener
  
  // Check if user is logged in on initial load
  // Handle watch progress context
  const { pendingPosition, clearPendingPosition } = useWatchProgress();
  
  // Handle redirect to content after successful login
  useEffect(() => {
    if (user && pendingPosition) {
      // If the user is logged in and there's a pending position, redirect to the content
      const redirectUrl = pendingPosition.url || `/movie/${pendingPosition.contentId}`;
      
      // Small delay to ensure everything is synced
      setTimeout(() => {
        // Clear pending position before redirect
        clearPendingPosition();
        // Navigate to the content
        setLocation(redirectUrl);
      }, 300);
    }
  }, [user, pendingPosition, clearPendingPosition, setLocation]);
  
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // First try to get session from Supabase
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // Get user data from our backend using Supabase user ID
          const res = await fetch(`/api/auth/supabase-user/${session.user.id}`, {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          });
          
          if (res.ok) {
            const userData = await res.json();
            setUser(userData);
          } else {
            // Session exists in Supabase but not in our backend, try to create the user
            const createRes = await fetch("/api/auth/sync-supabase-user", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({
                supabaseId: session.user.id,
                email: session.user.email,
                username: session.user.email?.split('@')[0] || `user_${Date.now()}`,
              }),
            });
            
            if (createRes.ok) {
              const newUserData = await createRes.json();
              setUser(newUserData);
            }
          }
        } else {
          // Fallback to our token-based auth if no Supabase session
          const token = localStorage.getItem("auth_token");
          if (token) {
            const res = await fetch("/api/auth/me", {
              headers: {
                Authorization: `Bearer ${token}`,
              },
              credentials: "include",
            });
            
            if (res.ok) {
              const userData = await res.json();
              setUser(userData);
            } else {
              // Token is invalid, clear it
              localStorage.removeItem("auth_token");
            }
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuthStatus();
    
    // Set up auth state change listener
    let subscription = { unsubscribe: () => {} };
    
    try {
      // Check if we have Supabase credentials before setting up listener
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (supabaseUrl && supabaseAnonKey) {
        const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === 'SIGNED_IN' && session) {
            // User signed in with Supabase
            try {
              // Try to get user from our backend
              const res = await fetch(`/api/auth/supabase-user/${session.user.id}`, {
                headers: {
                  Authorization: `Bearer ${session.access_token}`,
                },
              });
              
              if (res.ok) {
                const userData = await res.json();
                setUser(userData);
              } else {
                // Create new user in our backend
                const createRes = await fetch("/api/auth/sync-supabase-user", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session.access_token}`,
                  },
                  body: JSON.stringify({
                    supabaseId: session.user.id,
                    email: session.user.email,
                    username: session.user.email?.split('@')[0] || `user_${Date.now()}`,
                  }),
                });
                
                if (createRes.ok) {
                  const newUserData = await createRes.json();
                  setUser(newUserData);
                }
              }
            } catch (error) {
              console.error("Error syncing user after sign in:", error);
            }
          } else if (event === 'SIGNED_OUT') {
            // User signed out from Supabase
            setUser(null);
            localStorage.removeItem("auth_token");
          }
        });
        
        if (data && data.subscription) {
          subscription = data.subscription;
        }
      } else {
        console.warn("Supabase auth state change listener not set up due to missing credentials");
      }
    } catch (error) {
      console.error("Failed to set up Supabase auth state change listener:", error);
    }
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // Check if Supabase credentials are available
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const hasSupabaseCredentials = supabaseUrl && supabaseAnonKey;
      
      // Try Supabase login if credentials are available
      if (hasSupabaseCredentials && 'signInWithPassword' in supabase.auth) {
        try {
          const { data: supabaseData, error: supabaseError } = await supabase.auth.signInWithPassword({
            email,
            password
          });
          
          if (!supabaseError && supabaseData?.session) {
            try {
              const res = await fetch(`/api/auth/supabase-user/${supabaseData.user.id}`, {
                headers: {
                  Authorization: `Bearer ${supabaseData.session.access_token}`,
                },
              });
              
              if (res.ok) {
                const userData = await res.json();
                setUser(userData);
                return userData;
              } else {
                // User exists in Supabase but not in our backend, create them
                const createRes = await fetch("/api/auth/sync-supabase-user", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${supabaseData.session.access_token}`,
                  },
                  body: JSON.stringify({
                    supabaseId: supabaseData.user.id,
                    email: supabaseData.user.email,
                    username: supabaseData.user.email?.split('@')[0] || `user_${Date.now()}`,
                  }),
                });
                
                if (createRes.ok) {
                  const newUserData = await createRes.json();
                  setUser(newUserData);
                  return newUserData;
                }
              }
            } catch (error) {
              console.error("Error syncing user after login:", error);
            }
          }
        } catch (error) {
          console.log("Supabase login attempt failed:", error);
        }
      }
      
      // Fallback to our custom auth
      try {
        const data = await apiRequest("/api/auth/login", "POST", { email, password });
        
        if (!data || !data.token || !data.user) {
          throw new Error("Invalid response from authentication server");
        }
        
        // Store token and set user
        localStorage.setItem("auth_token", data.token);
        setUser(data.user);
        
        return data;
      } catch (error) {
        console.error("Custom auth login failed:", error);
        if (error instanceof Error) {
          throw new Error(`Login failed: ${error.message}`);
        } else {
          throw new Error("Login failed: Invalid credentials or server error");
        }
      }
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const register = async (userData: Omit<InsertUser, "confirmPassword">) => {
    try {
      setIsLoading(true);
      
      // Check if Supabase credentials are available
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const hasSupabaseCredentials = supabaseUrl && supabaseAnonKey;
      
      // Try Supabase sign up if credentials are available
      if (hasSupabaseCredentials && 'signUp' in supabase.auth) {
        try {
          const { data: supabaseData, error: supabaseError } = await supabase.auth.signUp({
            email: userData.email,
            password: userData.password,
            options: {
              data: {
                fullName: userData.fullName || '',
                username: userData.username,
              }
            }
          });
          
          if (!supabaseError && supabaseData?.user) {
            try {
              const createRes = await fetch("/api/auth/sync-supabase-user", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${supabaseData.session?.access_token || ''}`,
                },
                body: JSON.stringify({
                  supabaseId: supabaseData.user.id,
                  email: userData.email,
                  username: userData.username,
                  fullName: userData.fullName,
                  password: userData.password, // Needed for our backend
                }),
              });
              
              if (createRes.ok) {
                const newUserData = await createRes.json();
                setUser(newUserData);
                return newUserData;
              }
            } catch (error) {
              console.error("Error creating user in backend after Supabase registration:", error);
            }
          }
        } catch (error) {
          console.log("Supabase registration attempt failed:", error);
        }
      }
      
      // Fallback to our custom auth
      try {
        const data = await apiRequest("/api/auth/register", "POST", userData);
        
        if (!data || !data.token || !data.user) {
          throw new Error("Invalid response from authentication server");
        }
        
        // Store token and set user
        localStorage.setItem("auth_token", data.token);
        setUser(data.user);
        
        return data;
      } catch (error) {
        console.error("Custom auth registration failed:", error);
        if (error instanceof Error) {
          throw new Error(`Registration failed: ${error.message}`);
        } else {
          throw new Error("Registration failed: Invalid data or server error");
        }
      }
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const logout = async () => {
    try {
      setIsLoading(true);
      
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Clear token and user state
      localStorage.removeItem("auth_token");
      setUser(null);
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      console.error("Logout failed:", error);
      toast({
        title: "Logout failed",
        description: "An error occurred during logout.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const loginWithGoogle = async () => {
    try {
      setIsLoading(true);
      
      // Check if Supabase credentials are available
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey) {
        toast({
          title: "Google login unavailable",
          description: "Supabase configuration is missing. Please contact the administrator.",
          variant: "destructive",
        });
        throw new Error("Supabase credentials not configured. Cannot sign in with Google.");
      }
      
      // Use Supabase's Google OAuth
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      // The user will be redirected to Google for authentication
      // On return, the Supabase auth state change listener will handle the session
      
      toast({
        title: "Redirecting to Google",
        description: "Please complete the Google authentication.",
      });
      
    } catch (error) {
      console.error("Google login failed:", error);
      toast({
        title: "Google login failed",
        description: error instanceof Error ? error.message : "Failed to login with Google",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateUser = async (userData: Partial<User>) => {
    try {
      setIsLoading(true);
      
      // Check if Supabase credentials are available
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const hasSupabaseCredentials = supabaseUrl && supabaseAnonKey;
      const hasUpdateUserMethod = 'updateUser' in supabase.auth;
      
      // First try to get session from Supabase if credentials are available
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // Try to update user metadata in Supabase if the method is available
          if (hasSupabaseCredentials && hasUpdateUserMethod && (userData.email || userData.fullName)) {
            try {
              if (userData.email) {
                await (supabase.auth as any).updateUser({ email: userData.email });
              }
              
              if (userData.fullName) {
                await (supabase.auth as any).updateUser({
                  data: { fullName: userData.fullName }
                });
              }
            } catch (error) {
              console.warn("Failed to update user in Supabase:", error);
              // Continue with the backend update even if Supabase update fails
            }
          }
          
          // Update user in our backend
          const res = await fetch("/api/auth/update", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify(userData),
          });
          
          if (!res.ok) {
            throw new Error("Failed to update user");
          }
          
          const updatedUser = await res.json();
          setUser(updatedUser);
          
          toast({
            title: "Profile updated",
            description: "Your profile has been successfully updated.",
          });
          
          return updatedUser;
        }
      } catch (error) {
        console.warn("Failed to get or update Supabase session:", error);
        // Continue with fallback authentication
      }
      
      // Fallback to token-based auth
      const token = localStorage.getItem("auth_token");
      
      if (!token) {
        throw new Error("Not authenticated");
      }
      
      const res = await fetch("/api/auth/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
        credentials: "include",
      });
      
      if (!res.ok) {
        throw new Error("Failed to update user");
      }
      
      const updatedUser = await res.json();
      setUser(updatedUser);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
      
      return updatedUser;
    } catch (error) {
      console.error("Update failed:", error);
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        loginWithGoogle,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
