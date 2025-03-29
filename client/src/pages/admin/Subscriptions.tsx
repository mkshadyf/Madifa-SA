import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, Trash2, Pencil, Plus, Search, Filter, CreditCard, 
  UserPlus, Timer, BarChart, CheckCircle2, XCircle
} from 'lucide-react';
import { format } from 'date-fns';

// Mock interfaces (replace with actual types)
interface User {
  id: number;
  username: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  isPremium: boolean;
  isAdmin: boolean;
  createdAt: string;
}

interface Subscription {
  id: number;
  userId: number;
  user?: User;
  planId: number;
  planName: string;
  status: 'active' | 'canceled' | 'expired' | 'pending';
  startDate: string;
  endDate: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  autoRenew: boolean;
  createdAt: string;
}

interface Plan {
  id: number;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  features: string[];
  isActive: boolean;
  createdAt: string;
}

// Subscription table row component
const SubscriptionTableRow = ({
  subscription,
  onEdit,
  onCancel
}: {
  subscription: Subscription;
  onEdit: (id: number) => void;
  onCancel: (id: number) => void;
}) => {
  // Parse dates
  const startDate = new Date(subscription.startDate);
  const endDate = new Date(subscription.endDate);
  const isExpired = new Date() > endDate;

  return (
    <TableRow>
      <TableCell className="font-medium">
        <div className="flex items-center space-x-3">
          <div className="flex-1 min-w-0">
            <div className="font-medium">{subscription.user?.fullName || subscription.user?.username || "Unknown User"}</div>
            <div className="text-xs text-muted-foreground">{subscription.user?.email}</div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge 
          variant={
            subscription.status === "active" ? "default" :
            subscription.status === "pending" ? "outline" :
            subscription.status === "canceled" ? "secondary" : "destructive"
          }
        >
          {subscription.status}
        </Badge>
      </TableCell>
      <TableCell>{subscription.planName}</TableCell>
      <TableCell>
        <div className="text-right">{subscription.amount} {subscription.currency}</div>
      </TableCell>
      <TableCell>{format(startDate, 'dd MMM yyyy')}</TableCell>
      <TableCell>{format(endDate, 'dd MMM yyyy')}</TableCell>
      <TableCell>
        <Badge variant={subscription.autoRenew ? "outline" : "secondary"} className="capitalize">
          {subscription.autoRenew ? 'Auto-renews' : 'One-time'}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={() => onEdit(subscription.id)}>
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onCancel(subscription.id)}
            disabled={subscription.status !== 'active'}
          >
            <XCircle className="h-4 w-4" />
            <span className="sr-only">Cancel</span>
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

// Plan card component
const PlanCard = ({
  plan,
  onEdit,
  onToggleActive
}: {
  plan: Plan;
  onEdit: (id: number) => void;
  onToggleActive: (id: number, isActive: boolean) => void;
}) => {
  return (
    <Card className={plan.isActive ? "" : "opacity-70"}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{plan.name}</CardTitle>
          <Badge variant={plan.isActive ? "default" : "secondary"}>
            {plan.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
        <CardDescription>{plan.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold mb-4">
          {plan.price} {plan.currency}
          <span className="text-sm font-normal text-muted-foreground ml-1">
            / {plan.interval}
          </span>
        </div>
        
        <div className="space-y-2">
          {plan.features.map((feature, index) => (
            <div key={index} className="flex items-center">
              <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
              <span className="text-sm">{feature}</span>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => onEdit(plan.id)}>
          Edit
        </Button>
        <Button 
          variant={plan.isActive ? "secondary" : "default"}
          onClick={() => onToggleActive(plan.id, !plan.isActive)}
        >
          {plan.isActive ? "Deactivate" : "Activate"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default function Subscriptions() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('subscriptions');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editSubscriptionId, setEditSubscriptionId] = useState<number | null>(null);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [subscriptionToCancel, setSubscriptionToCancel] = useState<number | null>(null);

  // Fetch subscriptions
  const { 
    data: subscriptions, 
    isLoading: subscriptionsLoading,
    isError: subscriptionsError
  } = useQuery<Subscription[]>({
    queryKey: ['/api/admin/subscriptions'],
    retry: 1,
  });

  // Fetch plans
  const {
    data: plans,
    isLoading: plansLoading,
    isError: plansError
  } = useQuery<Plan[]>({
    queryKey: ['/api/admin/plans'],
    retry: 1,
  });

  // Cancel subscription mutation
  const cancelMutation = useMutation({
    mutationFn: async (subscriptionId: number) => {
      const response = await fetch(`/api/admin/subscriptions/${subscriptionId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to cancel subscription');
      }
      
      return subscriptionId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/subscriptions'] });
      toast({
        title: 'Subscription canceled',
        description: 'The subscription has been successfully canceled.',
      });
      setCancelConfirmOpen(false);
    },
    onError: (error) => {
      console.error('Error canceling subscription:', error);
      toast({
        title: 'Error',
        description: 'Failed to cancel subscription. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Toggle plan active status mutation
  const togglePlanActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number, isActive: boolean }) => {
      const response = await fetch(`/api/admin/plans/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update plan');
      }
      
      return { id, isActive };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/plans'] });
      toast({
        title: 'Plan updated',
        description: 'The plan has been successfully updated.',
      });
    },
    onError: (error) => {
      console.error('Error updating plan:', error);
      toast({
        title: 'Error',
        description: 'Failed to update plan. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleEditSubscription = (id: number) => {
    setEditSubscriptionId(id);
    // Open edit dialog/modal
  };

  const handleCancelSubscription = (id: number) => {
    setSubscriptionToCancel(id);
    setCancelConfirmOpen(true);
  };

  const confirmCancelSubscription = () => {
    if (subscriptionToCancel !== null) {
      cancelMutation.mutate(subscriptionToCancel);
    }
  };

  const handleEditPlan = (id: number) => {
    // Open edit plan dialog/modal
  };

  const handleTogglePlanActive = (id: number, isActive: boolean) => {
    togglePlanActiveMutation.mutate({ id, isActive });
  };

  // Filter subscriptions based on status and search term
  const filteredSubscriptions = subscriptions?.filter(subscription => {
    const matchesStatus = statusFilter === 'all' || subscription.status === statusFilter;
    const matchesSearch = !searchTerm || 
      (subscription.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscription.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscription.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Subscription Management</h1>
        <p className="text-muted-foreground">
          Manage subscription plans and user subscriptions
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="plans">Subscription Plans</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Subscriptions Tab */}
        <TabsContent value="subscriptions" className="space-y-6">
          <Card>
            <CardHeader className="py-4 px-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle>Subscription List</CardTitle>
                  <CardDescription>
                    {filteredSubscriptions?.length || 0} subscriptions total
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Subscription
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-6">
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search subscriptions..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Status:</span>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="canceled">Canceled</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {subscriptionsLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Spinner size="lg" />
                </div>
              ) : subscriptionsError ? (
                <div className="py-12 text-center">
                  <XCircle className="mx-auto h-8 w-8 text-destructive mb-4" />
                  <h3 className="text-lg font-semibold">Error loading subscriptions</h3>
                  <p className="text-muted-foreground mt-2 mb-4">
                    Failed to load subscription data
                  </p>
                  <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/admin/subscriptions'] })}>
                    Try Again
                  </Button>
                </div>
              ) : (
                <>
                  {filteredSubscriptions && filteredSubscriptions.length > 0 ? (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Plan</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Start Date</TableHead>
                            <TableHead>End Date</TableHead>
                            <TableHead>Renewal</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredSubscriptions.map((subscription) => (
                            <SubscriptionTableRow
                              key={subscription.id}
                              subscription={subscription}
                              onEdit={handleEditSubscription}
                              onCancel={handleCancelSubscription}
                            />
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="py-12 text-center">
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
                        <CreditCard className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold">No subscriptions found</h3>
                      <p className="text-muted-foreground mt-2 mb-4">
                        {searchTerm || statusFilter !== 'all'
                          ? "Try adjusting your filters"
                          : "No subscription data available"}
                      </p>
                      <Button>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Create New Subscription
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Plans Tab */}
        <TabsContent value="plans" className="space-y-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Subscription Plans</h2>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create New Plan
            </Button>
          </div>

          {plansLoading ? (
            <div className="flex justify-center items-center py-12">
              <Spinner size="lg" />
            </div>
          ) : plansError ? (
            <Card>
              <CardContent className="py-12 text-center">
                <XCircle className="mx-auto h-8 w-8 text-destructive mb-4" />
                <h3 className="text-lg font-semibold">Error loading plans</h3>
                <p className="text-muted-foreground mt-2 mb-4">
                  Failed to load subscription plans
                </p>
                <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/admin/plans'] })}>
                  Try Again
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {plans && plans.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {plans.map((plan) => (
                    <PlanCard
                      key={plan.id}
                      plan={plan}
                      onEdit={handleEditPlan}
                      onToggleActive={handleTogglePlanActive}
                    />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
                      <Shield className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold">No subscription plans found</h3>
                    <p className="text-muted-foreground mt-2 mb-4">
                      You haven't created any subscription plans yet
                    </p>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Create First Plan
                    </Button>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Active Subscriptions</CardDescription>
                <CardTitle className="text-3xl">247</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">
                  <span className="text-green-500 font-medium">↑ 12%</span> from last month
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Monthly Recurring Revenue</CardDescription>
                <CardTitle className="text-3xl">$5,240</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">
                  <span className="text-green-500 font-medium">↑ 8%</span> from last month
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>New Subscribers (30d)</CardDescription>
                <CardTitle className="text-3xl">38</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">
                  <span className="text-red-500 font-medium">↓ 4%</span> from previous 30 days
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Churn Rate (30d)</CardDescription>
                <CardTitle className="text-3xl">2.4%</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">
                  <span className="text-green-500 font-medium">↓ 0.5%</span> from previous 30 days
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Subscription Growth</CardTitle>
              <CardDescription>
                Active subscriptions over the last 12 months
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center">
                <div className="text-center">
                  <BarChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold">Subscription Analytics</h3>
                  <p className="text-muted-foreground mt-2 mb-4">
                    Real charts and analytics will be displayed here with actual data
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={cancelConfirmOpen} onOpenChange={setCancelConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Subscription</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this subscription? The user will lose access at the end of their billing period.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelConfirmOpen(false)}>
              No, Keep Subscription
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmCancelSubscription}
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending ? <Spinner className="mr-2" /> : null}
              Yes, Cancel Subscription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}