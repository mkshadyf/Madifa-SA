import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Film, Users, List, Tag, Activity, Settings, RefreshCw, Shield, Video } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface DashboardStats {
  users: {
    total: number;
    premium: number;
    free: number;
    premiumPercentage: number;
  };
  content: {
    total: number;
    premium: number;
    free: number;
    premiumPercentage: number;
  };
  categories: {
    total: number;
  };
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        // Fetch statistics from your API
        const response = await apiRequest('GET', '/api/admin/stats');
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch admin stats:', error);
        // Set empty stats with proper structure
        setStats({
          users: {
            total: 0,
            premium: 0,
            free: 0,
            premiumPercentage: 0
          },
          content: {
            total: 0,
            premium: 0,
            free: 0,
            premiumPercentage: 0
          },
          categories: {
            total: 0
          }
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

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

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Quick Stats Cards */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {isLoading ? (
                <RefreshCw className="w-6 h-6 animate-spin inline" />
              ) : (
                stats?.users.total || 0
              )}
            </p>
          </CardContent>
          <CardFooter className="pt-0">
            <Button asChild variant="link" className="px-0">
              <Link to="/admin/users">Manage Users</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Film className="w-5 h-5 mr-2" />
              Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {isLoading ? (
                <RefreshCw className="w-6 h-6 animate-spin inline" />
              ) : (
                stats?.content.total || 0
              )}
            </p>
            {!isLoading && stats && (
              <div className="text-sm text-muted-foreground mt-1">
                {stats.content.premium} Premium / {stats.content.free} Free
              </div>
            )}
          </CardContent>
          <CardFooter className="pt-0">
            <Button asChild variant="link" className="px-0">
              <Link to="/admin/content">Manage Content</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Tag className="w-5 h-5 mr-2" />
              Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {isLoading ? (
                <RefreshCw className="w-6 h-6 animate-spin inline" />
              ) : (
                stats?.categories.total || 0
              )}
            </p>
          </CardContent>
          <CardFooter className="pt-0">
            <Button asChild variant="link" className="px-0">
              <Link to="/admin/categories">Manage Categories</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="md:col-span-3">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <Button asChild variant="outline" className="h-auto py-4 justify-start">
                  <Link to="/admin/vimeo">
                    <Video className="mr-2 h-5 w-5" />
                    <div className="text-left">
                      <div className="font-semibold">Vimeo Management</div>
                      <div className="text-xs text-muted-foreground">Manage Vimeo videos</div>
                    </div>
                  </Link>
                </Button>

                <Button asChild variant="outline" className="h-auto py-4 justify-start">
                  <Link to="/admin/users">
                    <Users className="mr-2 h-5 w-5" />
                    <div className="text-left">
                      <div className="font-semibold">User Management</div>
                      <div className="text-xs text-muted-foreground">Manage user accounts</div>
                    </div>
                  </Link>
                </Button>

                <Button asChild variant="outline" className="h-auto py-4 justify-start">
                  <Link to="/admin/content">
                    <Film className="mr-2 h-5 w-5" />
                    <div className="text-left">
                      <div className="font-semibold">Content Management</div>
                      <div className="text-xs text-muted-foreground">Manage movies and videos</div>
                    </div>
                  </Link>
                </Button>

                <Button asChild variant="outline" className="h-auto py-4 justify-start">
                  <Link to="/admin/categories">
                    <Tag className="mr-2 h-5 w-5" />
                    <div className="text-left">
                      <div className="font-semibold">Categories</div>
                      <div className="text-xs text-muted-foreground">Manage content categories</div>
                    </div>
                  </Link>
                </Button>

                <Button asChild variant="outline" className="h-auto py-4 justify-start">
                  <Link to="/admin/subscriptions">
                    <Shield className="mr-2 h-5 w-5" />
                    <div className="text-left">
                      <div className="font-semibold">Subscriptions</div>
                      <div className="text-xs text-muted-foreground">Manage user subscriptions</div>
                    </div>
                  </Link>
                </Button>

                <Button asChild variant="outline" className="h-auto py-4 justify-start">
                  <Link to="/admin/analytics">
                    <Activity className="mr-2 h-5 w-5" />
                    <div className="text-left">
                      <div className="font-semibold">Analytics</div>
                      <div className="text-xs text-muted-foreground">View platform analytics</div>
                    </div>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                  <div className="text-sm">
                    <p className="font-medium">New content added</p>
                    <p className="text-muted-foreground text-xs">Just now</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                  <div className="text-sm">
                    <p className="font-medium">New user registered</p>
                    <p className="text-muted-foreground text-xs">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></div>
                  <div className="text-sm">
                    <p className="font-medium">Subscription payment</p>
                    <p className="text-muted-foreground text-xs">5 hours ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}