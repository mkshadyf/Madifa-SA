import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Film, Users, Tag, Activity, Settings, Shield, Home, Video, BarChart, 
  Menu, ChevronRight, LogOut, Bell, HelpCircle, X, ChevronLeft, 
  FilmIcon, DollarSign, BookOpen, Upload
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user } = useAuth();
  const [location] = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);

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

  // Group sidebar links by category
  const navigationGroups = [
    {
      title: "Core",
      links: [
        { 
          path: '/admin', 
          icon: <Home className="h-4 w-4" />, 
          label: 'Dashboard',
          description: 'Overview of platform metrics'
        },
        { 
          path: '/admin/content', 
          icon: <Film className="h-4 w-4" />, 
          label: 'Content',
          description: 'Manage videos and movies'
        },
        { 
          path: '/admin/users', 
          icon: <Users className="h-4 w-4" />, 
          label: 'Users',
          description: 'Manage user accounts'
        }
      ]
    },
    {
      title: "Content",
      links: [
        { 
          path: '/admin/vimeo', 
          icon: <Video className="h-4 w-4" />, 
          label: 'Vimeo',
          description: 'Manage Vimeo integration'
        },
        { 
          path: '/admin/categories', 
          icon: <Tag className="h-4 w-4" />, 
          label: 'Categories',
          description: 'Organize content with categories'
        },
        { 
          path: '/admin/upload', 
          icon: <Upload className="h-4 w-4" />, 
          label: 'Upload',
          description: 'Upload new content'
        }
      ]
    },
    {
      title: "Business",
      links: [
        { 
          path: '/admin/subscriptions', 
          icon: <Shield className="h-4 w-4" />, 
          label: 'Subscriptions',
          description: 'Manage user subscriptions'
        },
        { 
          path: '/admin/analytics', 
          icon: <BarChart className="h-4 w-4" />, 
          label: 'Analytics',
          description: 'Platform performance metrics'
        },
        { 
          path: '/admin/payments', 
          icon: <DollarSign className="h-4 w-4" />, 
          label: 'Payments',
          description: 'Process payments and refunds'
        }
      ]
    }
  ];

  // Sidebar component
  const Sidebar = ({ collapsed = false, mobile = false }) => (
    <div 
      className={cn(
        "h-full flex flex-col",
        collapsed ? "w-16" : "w-64",
        mobile ? "w-full" : ""
      )}
    >
      {/* Logo area */}
      <div className={cn(
        "flex items-center px-4 py-5",
        collapsed ? "justify-center" : "justify-between"
      )}>
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-bold">Admin Panel</h2>
          </div>
        )}
        {collapsed && <Shield className="h-6 w-6 text-primary" />}
        
        {!mobile && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0"
            onClick={() => setSidebarCollapsed(!collapsed)}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        )}
        
        {mobile && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0"
            onClick={() => setMobileSheetOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <div className="mt-2 flex-1 overflow-y-auto px-3">
        {navigationGroups.map((group, idx) => (
          <div key={idx} className="mb-6">
            {!collapsed && (
              <div className="mb-2 px-2 text-xs font-semibold text-muted-foreground">
                {group.title}
              </div>
            )}
            
            <div className="space-y-1">
              {group.links.map((link, linkIdx) => (
                <Button
                  key={linkIdx}
                  variant={isActive(link.path) ? 'default' : 'ghost'}
                  className={cn(
                    "w-full justify-start",
                    collapsed ? "px-2" : "",
                    isActive(link.path) ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground" : ""
                  )}
                  asChild
                >
                  <Link 
                    href={link.path}
                    onClick={() => mobile && setMobileSheetOpen(false)}
                  >
                    <div className={cn(
                      "flex items-center",
                      collapsed ? "justify-center" : ""
                    )}>
                      <span className={cn(collapsed ? "mr-0" : "mr-2")}>{link.icon}</span>
                      {!collapsed && (
                        <span>{link.label}</span>
                      )}
                    </div>
                  </Link>
                </Button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom section */}
      <div className={cn(
        "mt-auto border-t pt-4 px-3 pb-6 space-y-2",
        collapsed ? "items-center" : ""
      )}>
        {!collapsed && (
          <div className="px-2 mb-2">
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src="/avatar-placeholder.png" alt={user?.username || 'Admin'} />
                <AvatarFallback>
                  {user?.username?.substring(0, 2).toUpperCase() || 'AD'}
                </AvatarFallback>
              </Avatar>
              <div className="leading-none">
                <div className="font-medium">{user?.fullName || user?.username}</div>
                <div className="text-xs text-muted-foreground mt-1">Administrator</div>
              </div>
            </div>
          </div>
        )}

        <Button 
          variant="ghost" 
          className={cn(
            "w-full justify-start", 
            collapsed ? "px-0 justify-center" : ""
          )}
          asChild
        >
          <Link href="/admin/settings">
            <Settings className={cn("h-4 w-4", collapsed ? "" : "mr-2")} />
            {!collapsed && <span>Settings</span>}
          </Link>
        </Button>

        <Button 
          variant="ghost" 
          className={cn(
            "w-full justify-start", 
            collapsed ? "px-0 justify-center" : ""
          )}
          asChild
        >
          <Link href="/admin/help">
            <HelpCircle className={cn("h-4 w-4", collapsed ? "" : "mr-2")} />
            {!collapsed && <span>Help & Support</span>}
          </Link>
        </Button>

        <Button 
          variant={collapsed ? "ghost" : "outline"} 
          className={cn(
            "w-full justify-start", 
            collapsed ? "px-0 justify-center" : ""
          )}
          asChild
        >
          <Link href="/">
            <LogOut className={cn("h-4 w-4", collapsed ? "" : "mr-2")} />
            {!collapsed && <span>Back to Site</span>}
          </Link>
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <div className={cn(
        "hidden md:block border-r",
        sidebarCollapsed ? "w-16" : "w-64"
      )}>
        <Sidebar collapsed={sidebarCollapsed} />
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile header */}
        <div className="sticky top-0 z-30 md:hidden bg-background border-b shadow-sm">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="mr-2">
                    <Menu className="h-4 w-4" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-64">
                  <Sidebar mobile={true} />
                </SheetContent>
              </Sheet>
              
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <h2 className="font-semibold">Madifa Admin</h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button size="icon" variant="ghost" className="relative">
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center">3</Badge>
              </Button>
              
              <Avatar className="h-8 w-8">
                <AvatarImage src="/avatar-placeholder.png" alt={user?.username || 'Admin'} />
                <AvatarFallback>{user?.username?.substring(0, 2).toUpperCase() || 'A'}</AvatarFallback>
              </Avatar>
            </div>
          </div>
          
          {/* Mobile tab navigation */}
          <div className="flex overflow-x-auto p-2 border-t">
            <Button 
              variant={isActive('/admin') ? 'default' : 'ghost'} 
              size="sm"
              className="whitespace-nowrap rounded-full"
              asChild
            >
              <Link href="/admin">Dashboard</Link>
            </Button>
            <Button 
              variant={isActive('/admin/content') ? 'default' : 'ghost'} 
              size="sm"
              className="whitespace-nowrap rounded-full"
              asChild
            >
              <Link href="/admin/content">Content</Link>
            </Button>
            <Button 
              variant={isActive('/admin/users') ? 'default' : 'ghost'} 
              size="sm"
              className="whitespace-nowrap rounded-full"
              asChild
            >
              <Link href="/admin/users">Users</Link>
            </Button>
            <Button 
              variant={isActive('/admin/vimeo') ? 'default' : 'ghost'} 
              size="sm"
              className="whitespace-nowrap rounded-full"
              asChild
            >
              <Link href="/admin/vimeo">Vimeo</Link>
            </Button>
            <Button 
              variant={isActive('/admin/analytics') ? 'default' : 'ghost'} 
              size="sm"
              className="whitespace-nowrap rounded-full"
              asChild
            >
              <Link href="/admin/analytics">Analytics</Link>
            </Button>
          </div>
        </div>

        {/* Page content */}
        <div className="p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}