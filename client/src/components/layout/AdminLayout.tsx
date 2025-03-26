import { ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Film, Users, Tag, Activity, Settings, Shield, Home, Video, BarChart } from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user } = useAuth();
  const [location] = useLocation();

  // If not an admin, show access denied
  if (!user?.isAdmin) {
    return (
      <Card className="w-full max-w-3xl mx-auto mt-8">
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>
            You need administrator privileges to access this page.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <div className="hidden md:block w-64 border-r p-6 space-y-6">
        <div className="flex items-center gap-2 mb-8">
          <Shield className="h-6 w-6" />
          <h2 className="text-xl font-bold">Admin Panel</h2>
        </div>

        <div className="space-y-1">
          <Button
            variant={isActive('/admin') ? 'default' : 'ghost'}
            className="w-full justify-start"
            asChild
          >
            <Link href="/admin">
              <Home className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
          </Button>
          
          <Button
            variant={isActive('/admin/vimeo') ? 'default' : 'ghost'}
            className="w-full justify-start"
            asChild
          >
            <Link href="/admin/vimeo">
              <Video className="mr-2 h-4 w-4" />
              Vimeo Management
            </Link>
          </Button>

          <Button
            variant={isActive('/admin/content') ? 'default' : 'ghost'}
            className="w-full justify-start"
            asChild
          >
            <Link href="/admin/content">
              <Film className="mr-2 h-4 w-4" />
              Content
            </Link>
          </Button>

          <Button
            variant={isActive('/admin/users') ? 'default' : 'ghost'}
            className="w-full justify-start"
            asChild
          >
            <Link href="/admin/users">
              <Users className="mr-2 h-4 w-4" />
              Users
            </Link>
          </Button>

          <Button
            variant={isActive('/admin/categories') ? 'default' : 'ghost'}
            className="w-full justify-start"
            asChild
          >
            <Link href="/admin/categories">
              <Tag className="mr-2 h-4 w-4" />
              Categories
            </Link>
          </Button>

          <Button
            variant={isActive('/admin/subscriptions') ? 'default' : 'ghost'}
            className="w-full justify-start"
            asChild
          >
            <Link href="/admin/subscriptions">
              <Shield className="mr-2 h-4 w-4" />
              Subscriptions
            </Link>
          </Button>

          <Button
            variant={isActive('/admin/analytics') ? 'default' : 'ghost'}
            className="w-full justify-start"
            asChild
          >
            <Link href="/admin/analytics">
              <BarChart className="mr-2 h-4 w-4" />
              Analytics
            </Link>
          </Button>
        </div>

        <Separator className="my-6" />

        <div className="space-y-1">
          <Button
            variant={isActive('/admin/settings') ? 'default' : 'ghost'}
            className="w-full justify-start"
            asChild
          >
            <Link href="/admin/settings">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </Button>
        </div>

        <div className="absolute bottom-6 w-52">
          <Button variant="outline" className="w-full" asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Back to site
            </Link>
          </Button>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 p-6 overflow-y-auto">
        {/* Mobile navigation bar */}
        <div className="md:hidden flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <h2 className="text-lg font-bold">Admin Panel</h2>
          </div>

          <div className="flex space-x-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/">
                <Home className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Mobile navigation */}
        <div className="md:hidden flex overflow-x-auto py-2 mb-4 gap-2">
          <Button 
            variant={isActive('/admin') ? 'default' : 'outline'} 
            size="sm"
            asChild
          >
            <Link href="/admin">Dashboard</Link>
          </Button>
          <Button 
            variant={isActive('/admin/vimeo') ? 'default' : 'outline'} 
            size="sm"
            asChild
          >
            <Link href="/admin/vimeo">Vimeo</Link>
          </Button>
          <Button 
            variant={isActive('/admin/content') ? 'default' : 'outline'} 
            size="sm"
            asChild
          >
            <Link href="/admin/content">Content</Link>
          </Button>
          <Button 
            variant={isActive('/admin/users') ? 'default' : 'outline'} 
            size="sm"
            asChild
          >
            <Link href="/admin/users">Users</Link>
          </Button>
          <Button 
            variant={isActive('/admin/categories') ? 'default' : 'outline'} 
            size="sm"
            asChild
          >
            <Link href="/admin/categories">Categories</Link>
          </Button>
        </div>

        {/* Page content */}
        {children}
      </main>
    </div>
  );
}