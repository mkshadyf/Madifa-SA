import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";

/**
 * This component handles OAuth callbacks from Supabase authentication.
 * It acts as the redirect page after OAuth sign in.
 */
export default function AuthCallback() {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState("Processing authentication...");

  useEffect(() => {
    // Handle the auth callback - our AuthContext already monitors for auth state changes
    // The redirect to home will happen automatically after a short delay
    const timer = setTimeout(() => {
      setStatus("Authentication successful, redirecting to home page...");
      setLocation("/");
    }, 2000);

    return () => clearTimeout(timer);
  }, [setLocation]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <h1 className="text-2xl font-semibold mb-2">Authentication in progress</h1>
      <p className="text-muted-foreground">{status}</p>
    </div>
  );
}