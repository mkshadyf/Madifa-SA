import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Film, Users, List, Tag, Activity, Settings, RefreshCw, Shield, Video, 
  Bell, Clock, TrendingUp, Zap, Eye, Upload, PlusCircle, Calendar, DollarSign,
  Clock3, AlertTriangle, CheckCircle2, Search, UserPlus, Heart, Edit
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface DashboardStats {
  users: {
    total: number;
    premium: number;
    free: number;
    premiumPercentage: number;
    newToday?: number;
    newThisWeek?: number;
    activeToday?: number;
  };
  content: {
    total: number;
    premium: number;
    free: number;
    premiumPercentage: number;
    views?: {
      today: number;
      thisWeek: number;
      thisMonth: number;
    };
    popular?: {
      id: number;
      title: string;
      views: number;
      thumbnail?: string;
    }[];
  };
  categories: {
    total: number;
    popular?: {
      name: string;
      count: number;
    }[];
  };
  revenue?: {
    thisMonth: number;
    lastMonth: number;
    growth: number;
  };
  recentActivity?: {
    id: number;
    type: 'content' | 'user' | 'subscription' | 'view';
    message: string;
    time: string;
    relativeTime: string;
  }[];
}

interface Notification {
  id: number;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  time: string;
  read: boolean;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      message: "New user registration requires approval",
      type: "info",
      time: "Just now",
      read: false
    },
    {
      id: 2,
      message: "Content upload completed successfully",
      type: "success",
      time: "10 minutes ago",
      read: false
    },
    {
      id: 3,
      message: "Payment system requires attention",
      type: "warning",
      time: "1 hour ago",
      read: false
    }
  ]);
  const [showAllNotifications, setShowAllNotifications] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        // Fetch statistics from your API
        const response = await apiRequest('GET', '/api/admin/stats');
        const data = await response.json();
        
        // Enhance with additional data for demo purposes
        const enhancedData = {
          ...data,
          users: {
            ...data?.users || {
              total: 0,
              premium: 0,
              free: 0,
              premiumPercentage: 0
            },
            newToday: 3,
            newThisWeek: 12,
            activeToday: 24
          },
          content: {
            ...data?.content || {
              total: 0,
              premium: 0,
              free: 0,
              premiumPercentage: 0
            },
            views: {
              today: 156,
              thisWeek: 1243,
              thisMonth: 5621
            },
            popular: [
              { id: 1, title: "Mantolwana 2", views: 423, thumbnail: "/path/to/thumbnail1.jpg" },
              { id: 2, title: "The Royal Assegai", views: 317, thumbnail: "/path/to/thumbnail2.jpg" },
              { id: 3, title: "Terrance on my Neck", views: 289, thumbnail: "/path/to/thumbnail3.jpg" }
            ]
          },
          categories: {
            ...data?.categories || { total: 0 },
            popular: [
              { name: "Comedy", count: 12 },
              { name: "Drama", count: 8 },
              { name: "Action", count: 5 }
            ]
          },
          revenue: {
            thisMonth: 12450,
            lastMonth: 10200,
            growth: 22.06
          },
          recentActivity: [
            { id: 1, type: 'user', message: 'New user registered: John Doe', time: '2023-03-29T10:23:00Z', relativeTime: 'Just now' },
            { id: 2, type: 'content', message: 'New content added: "Mantolwana 5 - Trailer"', time: '2023-03-29T09:15:00Z', relativeTime: '2 hours ago' },
            { id: 3, type: 'subscription', message: 'Subscription payment received: R59.00', time: '2023-03-29T08:30:00Z', relativeTime: '5 hours ago' },
            { id: 4, type: 'view', message: 'Content view milestone: "The Royal Assegai" reached 1000 views', time: '2023-03-28T16:45:00Z', relativeTime: '1 day ago' },
            { id: 5, type: 'user', message: 'Premium upgrade: Sarah Johnson', time: '2023-03-28T11:20:00Z', relativeTime: '1 day ago' },
            { id: 6, type: 'content', message: 'Content updated: "Embizeni"', time: '2023-03-27T14:10:00Z', relativeTime: '2 days ago' }
          ]
        };
        
        setStats(enhancedData);
      } catch (error) {
        console.error('Failed to fetch admin stats:', error);
        // Set empty stats with proper structure
        setStats({
          users: {
            total: 0,
            premium: 0,
            free: 0,
            premiumPercentage: 0,
            newToday: 0,
            newThisWeek: 0,
            activeToday: 0
          },
          content: {
            total: 0,
            premium: 0,
            free: 0,
            premiumPercentage: 0,
            views: {
              today: 0,
              thisWeek: 0,
              thisMonth: 0
            },
            popular: []
          },
          categories: {
            total: 0,
            popular: []
          },
          revenue: {
            thisMonth: 0,
            lastMonth: 0,
            growth: 0
          },
          recentActivity: []
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Format currency (ZAR)
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
    }).format(amount);
  };

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

  // Helper to get activity icon based on type
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user':
        return <UserPlus className="h-4 w-4 text-blue-500" />;
      case 'content':
        return <Upload className="h-4 w-4 text-green-500" />;
      case 'subscription':
        return <DollarSign className="h-4 w-4 text-yellow-500" />;
      case 'view':
        return <Eye className="h-4 w-4 text-purple-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  // Helper to get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'info':
        return <Bell className="h-4 w-4 text-blue-500" />;
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  // Mark a notification as read
  const markAsRead = (id: number) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Count unread notifications
  const unreadCount = notifications.filter(notification => !notification.read).length;

  return (
    <div className="container mx-auto py-4 px-2 md:px-4 lg:px-6">
      {/* Header with welcome message and notification bell */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.fullName || user?.username}!</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 self-end sm:self-auto">
          <div className="relative">
            <Button 
              variant="outline" 
              size="icon" 
              className="relative h-9 w-9"
              onClick={() => setShowAllNotifications(!showAllNotifications)}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Button>
            
            {/* Notifications dropdown */}
            {showAllNotifications && (
              <Card className="absolute right-0 top-12 z-50 w-[280px] sm:w-80 shadow-lg">
                <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-medium">Notifications</CardTitle>
                  {notifications.length > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-auto py-1 px-2 text-xs"
                      onClick={clearAllNotifications}
                    >
                      Clear all
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="p-0 max-h-[320px] overflow-auto">
                  {notifications.length === 0 ? (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                      <Bell className="h-10 w-10 mx-auto mb-2 text-muted-foreground opacity-50" />
                      <p>No notifications</p>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {notifications.map((notification) => (
                        <div 
                          key={notification.id}
                          className={`px-4 py-3 hover:bg-muted/50 flex items-start gap-3 cursor-pointer ${notification.read ? 'opacity-70' : 'bg-muted/20'}`}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <div className="mt-0.5">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm">{notification.message}</p>
                            <p className="text-xs text-muted-foreground mt-1 flex items-center">
                              <Clock3 className="h-3 w-3 mr-1" />
                              {notification.time}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
          <Button asChild variant="outline" className="h-9">
            <Link to="/admin/settings">
              <Settings className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Settings</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="space-y-6">
        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* User Stats Card */}
          <Card className="overflow-hidden border border-muted/60 shadow-sm transition-all hover:border-primary/20 hover:shadow-md">
            <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold">
                  {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : stats?.users.total || 0}
                </span>
                <Badge variant="outline" className="text-xs bg-green-100 text-green-800 hover:bg-green-100">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{stats?.users.newThisWeek || 0} this week
                </Badge>
              </div>
              
              {!isLoading && stats && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span>Premium users</span>
                    <span className="font-semibold">{Math.round(stats.users.premiumPercentage)}%</span>
                  </div>
                  <Progress value={stats.users.premiumPercentage} className="h-1" />
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>{stats.users.premium} Premium</span>
                    <span>{stats.users.free} Free</span>
                  </div>
                </div>
              )}

              <Button asChild variant="link" className="px-0 mt-3 text-xs">
                <Link to="/admin/users">Manage Users</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Content Stats Card */}
          <Card className="overflow-hidden border border-muted/60 shadow-sm transition-all hover:border-primary/20 hover:shadow-md">
            <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium">Total Content</CardTitle>
              <Film className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold">
                  {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : stats?.content.total || 0}
                </span>
                <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800 hover:bg-blue-100">
                  <Eye className="h-3 w-3 mr-1" />
                  {stats?.content.views?.today || 0} views today
                </Badge>
              </div>
              
              {!isLoading && stats && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span>Premium content</span>
                    <span className="font-semibold">{Math.round(stats.content.premiumPercentage)}%</span>
                  </div>
                  <Progress value={stats.content.premiumPercentage} className="h-1" />
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>{stats.content.premium} Premium</span>
                    <span>{stats.content.free} Free</span>
                  </div>
                </div>
              )}

              <Button asChild variant="link" className="px-0 mt-3 text-xs">
                <Link to="/admin/content">Manage Content</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Categories Card */}
          <Card className="overflow-hidden border border-muted/60 shadow-sm transition-all hover:border-primary/20 hover:shadow-md">
            <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <Tag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-2xl font-bold">
                {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : stats?.categories.total || 0}
              </div>
              
              {!isLoading && stats?.categories.popular && (
                <div className="mt-3 space-y-2">
                  <div className="text-xs font-medium">Popular Categories:</div>
                  {stats.categories.popular.slice(0, 2).map((category, index) => (
                    <div key={index} className="flex justify-between items-center text-xs">
                      <span>{category.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {category.count} items
                      </Badge>
                    </div>
                  ))}
                </div>
              )}

              <Button asChild variant="link" className="px-0 mt-3 text-xs">
                <Link to="/admin/categories">Manage Categories</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Revenue Card */}
          <Card className="overflow-hidden border border-muted/60 shadow-sm transition-all hover:border-primary/20 hover:shadow-md">
            <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold">
                  {isLoading ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    formatCurrency(stats?.revenue?.thisMonth || 0)
                  )}
                </span>
                {!isLoading && stats?.revenue && stats.revenue.growth > 0 && (
                  <Badge variant="outline" className="text-xs bg-green-100 text-green-800 hover:bg-green-100">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +{stats.revenue.growth.toFixed(1)}%
                  </Badge>
                )}
              </div>
              
              {!isLoading && stats?.revenue && (
                <div className="text-xs text-muted-foreground mt-2">
                  Last month: {formatCurrency(stats.revenue.lastMonth)}
                </div>
              )}

              <Button asChild variant="link" className="px-0 mt-3 text-xs">
                <Link to="/admin/subscriptions">Manage Subscriptions</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Middle Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <Card className="lg:col-span-2 border border-muted/60 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <Button asChild variant="outline" className="h-auto py-4 justify-start transition-all hover:border-primary hover:bg-primary/5">
                  <Link to="/admin/vimeo">
                    <Video className="mr-2 h-5 w-5 text-primary" />
                    <div className="text-left">
                      <div className="font-semibold">Vimeo Management</div>
                      <div className="text-xs text-muted-foreground">Manage Vimeo videos</div>
                    </div>
                  </Link>
                </Button>

                <Button asChild variant="outline" className="h-auto py-4 justify-start transition-all hover:border-primary hover:bg-primary/5">
                  <Link to="/admin/users">
                    <Users className="mr-2 h-5 w-5 text-primary" />
                    <div className="text-left">
                      <div className="font-semibold">User Management</div>
                      <div className="text-xs text-muted-foreground">Manage user accounts</div>
                    </div>
                  </Link>
                </Button>

                <Button asChild variant="outline" className="h-auto py-4 justify-start transition-all hover:border-primary hover:bg-primary/5">
                  <Link to="/admin/content">
                    <Film className="mr-2 h-5 w-5 text-primary" />
                    <div className="text-left">
                      <div className="font-semibold">Content Management</div>
                      <div className="text-xs text-muted-foreground">Manage movies and videos</div>
                    </div>
                  </Link>
                </Button>

                <Button asChild variant="outline" className="h-auto py-4 justify-start transition-all hover:border-primary hover:bg-primary/5">
                  <Link to="/admin/categories">
                    <Tag className="mr-2 h-5 w-5 text-primary" />
                    <div className="text-left">
                      <div className="font-semibold">Categories</div>
                      <div className="text-xs text-muted-foreground">Manage content categories</div>
                    </div>
                  </Link>
                </Button>

                <Button asChild variant="outline" className="h-auto py-4 justify-start transition-all hover:border-primary hover:bg-primary/5">
                  <Link to="/admin/subscriptions">
                    <Shield className="mr-2 h-5 w-5 text-primary" />
                    <div className="text-left">
                      <div className="font-semibold">Subscriptions</div>
                      <div className="text-xs text-muted-foreground">Manage user subscriptions</div>
                    </div>
                  </Link>
                </Button>

                <Button asChild variant="outline" className="h-auto py-4 justify-start transition-all hover:border-primary hover:bg-primary/5">
                  <Link to="/admin/analytics">
                    <Activity className="mr-2 h-5 w-5 text-primary" />
                    <div className="text-left">
                      <div className="font-semibold">Analytics</div>
                      <div className="text-xs text-muted-foreground">View platform analytics</div>
                    </div>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity Feed */}
          <Card className="border border-muted/60 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle>Recent Activity</CardTitle>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="max-h-[300px] overflow-auto">
              {isLoading ? (
                <div className="flex items-center justify-center h-40">
                  <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : stats?.recentActivity && stats.recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {stats.recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className="mt-0.5">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm">{activity.message}</p>
                        <p className="text-xs text-muted-foreground flex items-center">
                          <Clock3 className="h-3 w-3 mr-1" />
                          {activity.relativeTime}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  <Activity className="h-10 w-10 mx-auto mb-2 opacity-20" />
                  <p>No recent activity</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="pt-2 pb-3 border-t">
              <Button variant="outline" size="sm" className="w-full text-xs">
                View All Activity
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Popular Content */}
        <Card className="border border-muted/60 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle>Popular Content</CardTitle>
            <CardDescription>Most viewed videos this month</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-24">
                <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : stats?.content.popular && stats.content.popular.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {stats.content.popular.map((item, index) => (
                  <Card key={index} className="overflow-hidden border-muted">
                    <div className="aspect-video bg-muted relative">
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <Film className="h-8 w-8 text-white opacity-70" />
                      </div>
                      <div className="absolute bottom-2 right-2">
                        <Badge className="bg-black/60 hover:bg-black/70 text-white border-none text-xs">
                          <Eye className="h-3 w-3 mr-1" />
                          {item.views} views
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-3">
                      <h3 className="font-medium line-clamp-1">{item.title}</h3>
                      <div className="flex items-center justify-between mt-2">
                        <Button size="sm" variant="outline" className="h-7 text-xs">
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 text-xs">
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                <Film className="h-10 w-10 mx-auto mb-2 opacity-20" />
                <p>No popular content to show</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="pt-2 pb-3 border-t">
            <Button asChild variant="outline" size="sm" className="w-full text-xs">
              <Link to="/admin/content?sort=popular">View All Popular Content</Link>
            </Button>
          </CardFooter>
        </Card>

      </div>
    </div>
  );
}