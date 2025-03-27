import { ReactNode } from "react";
import { useLocation, Redirect } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
}

/**
 * ProtectedRoute component ensures that only authenticated users can access the wrapped routes
 * If adminOnly is true, it will also check if the user is an admin
 */
export function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Checking authorization...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if user is not authenticated
  if (!user) {
    return <Redirect to="/login" />;
  }

  // If adminOnly flag is true, check if user is an admin
  if (adminOnly && !user.isAdmin) {
    return <Redirect to="/" />;
  }

  // User is authenticated, render the children
  return <>{children}</>;
}

/**
 * AdminRoute component is a specialized ProtectedRoute that only allows admin users
 */
export function AdminRoute({ children }: { children: ReactNode }) {
  return <ProtectedRoute adminOnly>{children}</ProtectedRoute>;
}