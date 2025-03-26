import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { queryClient } from "./lib/queryClient";
import { AuthProvider } from "./contexts/AuthContext";
import { DataSourceProvider } from "./contexts/DataSourceContext";
import { PerformanceProvider } from "./contexts/PerformanceContext";

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
import NotFound from "@/pages/not-found";

// Admin Pages
import AdminDashboard from "@/pages/admin/Dashboard";
import VimeoManagement from "@/pages/admin/VimeoManagement";

// Admin route wrapper component
const AdminRoute = ({ component: Component, ...rest }: any) => {
  return (
    <AdminLayout>
      <Component {...rest} />
    </AdminLayout>
  );
};

// Extract Router into a separate component for better organization
function Router() {
  return (
    <Switch>
      {/* Main Routes */}
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/movie/:id" component={MovieDetails} />
      <Route path="/browse" component={Browse} />
      <Route path="/category/:id" component={Browse} />
      <Route path="/my-list" component={MyList} />
      <Route path="/profile" component={Profile} />
      <Route path="/subscription" component={Subscription} />
      <Route path="/downloads" component={Downloads} />
      <Route path="/accessible-player/:id" component={AccessiblePlayerDemo} />
      
      {/* Admin Routes */}
      <Route path="/admin">
        {(params) => <AdminRoute component={AdminDashboard} {...params} />}
      </Route>
      <Route path="/admin/vimeo">
        {(params) => <AdminRoute component={VimeoManagement} {...params} />}
      </Route>
      
      {/* 404 Route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [showPerformanceSettings, setShowPerformanceSettings] = useState(false);
  
  // Make performance settings available to MobileNav
  const handleOpenPerformanceSettings = () => {
    setShowPerformanceSettings(true);
  };
  
  return (
    <QueryClientProvider client={queryClient}>
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
            <MobileNav onOpenPerformanceSettings={handleOpenPerformanceSettings} />
            
            {/* Add padding bottom for mobile to avoid content being hidden behind the nav bar */}
            <div className="md:hidden h-16"></div>
          </PerformanceProvider>
        </DataSourceProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
