import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiRequest } from "@/lib/queryClient";
import { User, InsertUser } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: Omit<InsertUser, "confirmPassword">) => Promise<void>;
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
  
  // Check if user is logged in on initial load
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
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
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // First try Supabase login
      const { data: supabaseData, error: supabaseError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (supabaseError) {
        // Fallback to our custom auth
        const res = await apiRequest("/api/auth/login", "POST", { email, password });
        const data = await res.json();
        
        // Store token and set user
        localStorage.setItem("auth_token", data.token);
        setUser(data.user);
        
        return data;
      }
      
      // Supabase login successful - get user from our backend
      if (supabaseData.session) {
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
          throw error;
        }
      }
      
      throw new Error("Login failed");
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
      
      // First try Supabase signup
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
      
      if (supabaseError) {
        // Fallback to our custom auth
        const res = await apiRequest("/api/auth/register", "POST", userData);
        const data = await res.json();
        
        // Store token and set user
        localStorage.setItem("auth_token", data.token);
        setUser(data.user);
        
        return data;
      }
      
      // Supabase registration successful - create user in our backend
      if (supabaseData.user) {
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
          throw error;
        }
      }
      
      throw new Error("Registration failed");
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
  
  const updateUser = async (userData: Partial<User>) => {
    try {
      setIsLoading(true);
      
      // Check for Supabase session first
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Update user metadata in Supabase if necessary
        if (userData.email || userData.fullName) {
          const updateData: any = {};
          if (userData.email) {
            await supabase.auth.updateUser({ email: userData.email });
          }
          
          if (userData.fullName) {
            await supabase.auth.updateUser({
              data: { fullName: userData.fullName }
            });
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
      } else {
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
      }
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
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
