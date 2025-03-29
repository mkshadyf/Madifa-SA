import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  BarChart,
  LineChart,
  PieChart,
  Calendar,
  Download,
  RefreshCw,
  Users,
  Eye,
  Play,
  Clock,
  TrendingUp,
  TrendingDown,
  Filter,
  FilmIcon,
  Smartphone,
  Tablet,
  Monitor
} from 'lucide-react';

// Mock interfaces
interface AnalyticsSummary {
  totalViews: number;
  avgWatchTime: number;
  completionRate: number;
  activeUsers: number;
  viewsPercentChange: number;
  watchTimePercentChange: number;
  completionRateChange: number;
  activeUsersChange: number;
}

interface PopularContent {
  id: number;
  title: string;
  contentType: string;
  views: number;
  avgWatchTime: number;
  completionRate: number;
  thumbnailUrl?: string;
}

interface UserActivity {
  date: string;
  activeUsers: number;
  newUsers: number;
  totalMinutesWatched: number;
}

interface DeviceStats {
  device: 'mobile' | 'tablet' | 'desktop' | 'tv' | 'other';
  sessions: number;
  percentage: number;
}

// Analytics Dashboard
export default function Analytics() {
  const [timeRange, setTimeRange] = useState('7d');
  
  // Fetch analytics summary
  const { 
    data: summary, 
    isLoading: summaryLoading 
  } = useQuery<AnalyticsSummary>({
    queryKey: ['/api/admin/analytics/summary', timeRange],
  });
  
  // Fetch popular content
  const { 
    data: popularContent, 
    isLoading: contentLoading 
  } = useQuery<PopularContent[]>({
    queryKey: ['/api/admin/analytics/popular-content', timeRange],
  });
  
  // Fetch user activity
  const { 
    data: userActivity, 
    isLoading: activityLoading 
  } = useQuery<UserActivity[]>({
    queryKey: ['/api/admin/analytics/user-activity', timeRange],
  });
  
  // Fetch device stats
  const { 
    data: deviceStats, 
    isLoading: deviceLoading 
  } = useQuery<DeviceStats[]>({
    queryKey: ['/api/admin/analytics/devices', timeRange],
  });
  
  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-500';
    if (change < 0) return 'text-red-500';
    return 'text-gray-500';
  };
  
  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4" />;
    if (change < 0) return <TrendingDown className="h-4 w-4" />;
    return null;
  };
  
  const getDeviceIcon = (device: string) => {
    switch (device) {
      case 'mobile':
        return <Smartphone className="h-4 w-4" />;
      case 'tablet':
        return <Tablet className="h-4 w-4" />;
      case 'desktop':
        return <Monitor className="h-4 w-4" />;
      default:
        return <FilmIcon className="h-4 w-4" />;
    }
  };

  return (
    <>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Insights and metrics about your streaming platform
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 3 Months</SelectItem>
              <SelectItem value="365d">Last 12 Months</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
          
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
      
      {/* Overview Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Views</CardDescription>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">
                {summaryLoading ? <Spinner size="sm" /> : summary?.totalViews.toLocaleString()}
              </CardTitle>
              {!summaryLoading && summary && (
                <Badge variant={summary.viewsPercentChange >= 0 ? "default" : "destructive"} className="text-xs">
                  <span className="flex items-center">
                    {getChangeIcon(summary.viewsPercentChange)}
                    <span className="ml-1">{Math.abs(summary.viewsPercentChange)}%</span>
                  </span>
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground flex items-center">
              <Eye className="h-3 w-3 mr-1" />
              <span>Compared to previous period</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avg. Watch Time</CardDescription>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">
                {summaryLoading ? <Spinner size="sm" /> : `${summary?.avgWatchTime} min`}
              </CardTitle>
              {!summaryLoading && summary && (
                <Badge variant={summary.watchTimePercentChange >= 0 ? "default" : "destructive"} className="text-xs">
                  <span className="flex items-center">
                    {getChangeIcon(summary.watchTimePercentChange)}
                    <span className="ml-1">{Math.abs(summary.watchTimePercentChange)}%</span>
                  </span>
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              <span>Per viewing session</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Completion Rate</CardDescription>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">
                {summaryLoading ? <Spinner size="sm" /> : `${summary?.completionRate}%`}
              </CardTitle>
              {!summaryLoading && summary && (
                <Badge variant={summary.completionRateChange >= 0 ? "default" : "destructive"} className="text-xs">
                  <span className="flex items-center">
                    {getChangeIcon(summary.completionRateChange)}
                    <span className="ml-1">{Math.abs(summary.completionRateChange)}%</span>
                  </span>
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground flex items-center">
              <Play className="h-3 w-3 mr-1" />
              <span>Videos watched to completion</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Users</CardDescription>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">
                {summaryLoading ? <Spinner size="sm" /> : summary?.activeUsers.toLocaleString()}
              </CardTitle>
              {!summaryLoading && summary && (
                <Badge variant={summary.activeUsersChange >= 0 ? "default" : "destructive"} className="text-xs">
                  <span className="flex items-center">
                    {getChangeIcon(summary.activeUsersChange)}
                    <span className="ml-1">{Math.abs(summary.activeUsersChange)}%</span>
                  </span>
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground flex items-center">
              <Users className="h-3 w-3 mr-1" />
              <span>Unique users in selected period</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Analytics Content */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
        {/* User Activity Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Audience Trends</CardTitle>
            <CardDescription>
              User activity and engagement metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            {activityLoading ? (
              <Spinner size="lg" />
            ) : (
              <div className="text-center">
                <LineChart className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold">Activity Trends</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  This chart will display actual user activity data over time
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Device Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Device Distribution</CardTitle>
            <CardDescription>
              Viewing sessions by device type
            </CardDescription>
          </CardHeader>
          <CardContent>
            {deviceLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <Spinner size="lg" />
              </div>
            ) : (
              <div>
                <div className="h-[200px] flex items-center justify-center mb-6">
                  <PieChart className="h-12 w-12 text-primary" />
                </div>
                
                <div className="space-y-4">
                  {deviceStats?.map((stat) => (
                    <div key={stat.device} className="flex items-center justify-between">
                      <div className="flex items-center">
                        {getDeviceIcon(stat.device)}
                        <span className="ml-2 capitalize">{stat.device}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm font-medium mr-2">
                          {stat.percentage}%
                        </span>
                        <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary"
                            style={{ width: `${stat.percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Popular Content Table */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Popular Content</CardTitle>
              <CardDescription>
                Most viewed content during the selected period
              </CardDescription>
            </div>
            <div className="flex items-center mt-2 sm:mt-0">
              <Select defaultValue="views">
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="views">Sort by Views</SelectItem>
                  <SelectItem value="watchTime">Sort by Watch Time</SelectItem>
                  <SelectItem value="completion">Sort by Completion</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {contentLoading ? (
            <div className="h-[200px] flex items-center justify-center">
              <Spinner size="lg" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Content</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Views</TableHead>
                  <TableHead className="text-right">Avg. Watch Time</TableHead>
                  <TableHead className="text-right">Completion Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {popularContent?.map((content) => (
                  <TableRow key={content.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-16 rounded bg-muted overflow-hidden">
                          {content.thumbnailUrl ? (
                            <img 
                              src={content.thumbnailUrl} 
                              alt={content.title} 
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <FilmIcon className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{content.title}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {content.contentType.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{content.views.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{content.avgWatchTime} min</TableCell>
                    <TableCell className="text-right">{content.completionRate}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {/* Audience Insights Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Audience Insights</CardTitle>
          <CardDescription>
            Detailed analytics on user behavior and demographics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="engagement" className="space-y-4">
            <TabsList className="grid grid-cols-3 md:w-[400px]">
              <TabsTrigger value="engagement">Engagement</TabsTrigger>
              <TabsTrigger value="geography">Geography</TabsTrigger>
              <TabsTrigger value="demographics">Demographics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="engagement" className="space-y-4">
              <div className="h-[300px] flex items-center justify-center">
                <BarChart className="h-12 w-12 text-primary mx-auto" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold">Engagement Metrics</h3>
                <p className="text-sm text-muted-foreground mt-2 mb-4">
                  This section will display detailed engagement analytics
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="geography" className="space-y-4">
              <div className="h-[300px] flex items-center justify-center">
                <div className="text-center">
                  <Calendar className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold">Geographic Distribution</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    This section will display user distribution by location
                  </p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="demographics" className="space-y-4">
              <div className="h-[300px] flex items-center justify-center">
                <div className="text-center">
                  <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold">User Demographics</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    This section will display user demographics information
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="border-t pt-4 flex justify-between">
          <div className="text-sm text-muted-foreground">
            Data refreshed every 24 hours
          </div>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        </CardFooter>
      </Card>
    </>
  );
}