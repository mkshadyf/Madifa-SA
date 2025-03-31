import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { setAppHeight, enableSafeAreas } from "./lib/viewport";
import { AuthProvider } from "./contexts/AuthContext";
import { DataSourceProvider } from "./contexts/DataSourceContext";
import { PerformanceProvider } from "./contexts/PerformanceContext";
import { WatchProgressProvider } from "./contexts/WatchProgressContext";

// Auth components
import { ProtectedRoute, AdminRoute } from "@/components/auth/ProtectedRoute";

// PWA components
import { InstallPrompt } from "@/components/app/InstallPrompt";
import { OfflineIndicator } from "@/components/app/OfflineIndicator";
import PerformanceSettings from "@/components/app/PerformanceSettings";
import MobileNav from "@/components/layout/MobileNav";
import AdminLayout from "@/components/layout/AdminLayout";

// Ads component
import { AdSenseScript } from "@/components/ads/AdSenseScript";

// Regular Pages
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import MovieDetails from "@/pages/MovieDetails";
import Browse from "@/pages/Browse";
import MyList from "@/pages/MyList";
import Profile from "@/pages/Profile";
import Subscription from "@/pages/Subscription";
import Downloads from "@/pages/Downloads";
import AccessiblePlayerDemo from "@/pages/AccessiblePlayerDemo";
import AuthCallback from "@/pages/AuthCallback";
import NotFound from "@/pages/not-found";
import AdDemo from "@/pages/AdDemo";

// Admin Pages
import AdminDashboard from "@/pages/admin/Dashboard";
import VimeoManagement from "@/pages/admin/VimeoManagement";
import Categories from "@/pages/admin/Categories";
import Users from "@/pages/admin/Users";
import Content from "@/pages/admin/Content";
import Subscriptions from "@/pages/admin/Subscriptions";
import Upload from "@/pages/admin/Upload";
import Analytics from "@/pages/admin/Analytics";
import Payments from "@/pages/admin/Payments";
import Settings from "@/pages/admin/Settings";
import Help from "@/pages/admin/Help";

// Extract Router into a separate component for better organization

function Router() {
  return (
    <Switch>
      {/* Public Routes - Accessible to all users */}
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/movie/:id" component={MovieDetails} />
      <Route path="/browse" component={Browse} />
      <Route path="/category/:id" component={Browse} />
      <Route path="/accessible-player/:id" component={AccessiblePlayerDemo} />
      <Route path="/auth/callback" component={AuthCallback} />
      <Route path="/ad-demo" component={AdDemo} />
      
      {/* Protected Routes - Require Authentication */}
      <Route path="/my-list">
        <ProtectedRoute>
          <MyList />
        </ProtectedRoute>
      </Route>
      <Route path="/profile">
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      </Route>
      <Route path="/subscription">
        <ProtectedRoute>
          <Subscription />
        </ProtectedRoute>
      </Route>
      <Route path="/downloads">
        <ProtectedRoute>
          <Downloads />
        </ProtectedRoute>
      </Route>
      
      {/* Admin Routes - Require Admin Authentication */}
      <Route path="/admin">
        <AdminRoute>
          <AdminLayout>
            <AdminDashboard />
          </AdminLayout>
        </AdminRoute>
      </Route>
      <Route path="/admin/content">
        <AdminRoute>
          <AdminLayout>
            <Content />
          </AdminLayout>
        </AdminRoute>
      </Route>
      <Route path="/admin/users">
        <AdminRoute>
          <AdminLayout>
            <Users />
          </AdminLayout>
        </AdminRoute>
      </Route>
      <Route path="/admin/vimeo">
        <AdminRoute>
          <AdminLayout>
            <VimeoManagement />
          </AdminLayout>
        </AdminRoute>
      </Route>
      <Route path="/admin/categories">
        <AdminRoute>
          <AdminLayout>
            <Categories />
          </AdminLayout>
        </AdminRoute>
      </Route>
      <Route path="/admin/upload">
        <AdminRoute>
          <AdminLayout>
            <Upload />
          </AdminLayout>
        </AdminRoute>
      </Route>
      <Route path="/admin/subscriptions">
        <AdminRoute>
          <AdminLayout>
            <Subscriptions />
          </AdminLayout>
        </AdminRoute>
      </Route>
      <Route path="/admin/analytics">
        <AdminRoute>
          <AdminLayout>
            <Analytics />
          </AdminLayout>
        </AdminRoute>
      </Route>
      <Route path="/admin/payments">
        <AdminRoute>
          <AdminLayout>
            <Payments />
          </AdminLayout>
        </AdminRoute>
      </Route>
      <Route path="/admin/settings">
        <AdminRoute>
          <AdminLayout>
            <Settings />
          </AdminLayout>
        </AdminRoute>
      </Route>
      <Route path="/admin/help">
        <AdminRoute>
          <AdminLayout>
            <Help />
          </AdminLayout>
        </AdminRoute>
      </Route>
      
      {/* 404 Route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [showPerformanceSettings, setShowPerformanceSettings] = useState(false);
  
  // Fix for mobile viewport height issues
  useEffect(() => {
    // Set dynamic viewport height
    const cleanup = setAppHeight();
    
    // Enable safe areas for notched devices
    enableSafeAreas();
    
    return cleanup;
  }, []);
  

  
  return (
    <QueryClientProvider client={queryClient}>
      {/* We need to place WatchProgressProvider outside AuthProvider to resolve the circular dependency */}
      <WatchProgressProvider>
        <AuthProvider>
          <DataSourceProvider>
            <PerformanceProvider>
              {/* Initialize AdSense */}
              <AdSenseScript />
              
              {/* Main App Router */}
              <Router />
              
              {/* PWA Components */}
              <InstallPrompt />
              <OfflineIndicator />
              
              {/* Performance Settings Modal */}
              <PerformanceSettings 
                isOpen={showPerformanceSettings} 
                onClose={() => setShowPerformanceSettings(false)}
              />
              
              {/* Mobile Navigation */}
              <MobileNav />
              
              {/* Add padding bottom for mobile to avoid content being hidden behind the nav bar */}
              <div className="md:hidden h-16 safe-area-bottom"></div>
            </PerformanceProvider>
          </DataSourceProvider>
        </AuthProvider>
      </WatchProgressProvider>
    </QueryClientProvider>
  );
}

export default App;
