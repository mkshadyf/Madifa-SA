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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DollarSign,
  CreditCard,
  FileText,
  Download,
  Search,
  Filter,
  ChevronDown,
  RefreshCw,
  ArrowUpDown,
  Calendar,
  ArrowUp,
  ArrowDown,
  Eye,
  X
} from 'lucide-react';
import { format } from 'date-fns';

// Transaction interfaces
interface Transaction {
  id: string;
  userId: number;
  username: string;
  email: string;
  amount: number;
  currency: string;
  status: 'successful' | 'failed' | 'pending' | 'refunded';
  paymentMethod: string;
  paymentId: string;
  description: string;
  createdAt: string;
}

interface RevenueStats {
  totalRevenue: number;
  subscriptionRevenue: number;
  oneTimeRevenue: number;
  currencySymbol: string;
  revenueChange: number;
  subscriptionsChange: number;
  refundRate: number;
}

// Transaction table row component
const TransactionRow = ({ transaction }: { transaction: Transaction }) => {
  const [detailsOpen, setDetailsOpen] = useState(false);
  
  // Format the date
  const date = new Date(transaction.createdAt);
  
  // Set status color
  const statusVariant = 
    transaction.status === 'successful' ? 'default' :
    transaction.status === 'failed' ? 'destructive' :
    transaction.status === 'pending' ? 'outline' : 'secondary';
  
  return (
    <>
      <TableRow>
        <TableCell className="font-medium">
          <div className="flex items-center">
            <span className="font-mono text-xs">{transaction.id.slice(0, 8)}</span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="ml-1 h-6 w-6 p-0" 
              onClick={() => setDetailsOpen(true)}
            >
              <Eye className="h-3 w-3" />
              <span className="sr-only">View transaction</span>
            </Button>
          </div>
        </TableCell>
        <TableCell>
          <div className="flex flex-col">
            <span className="font-medium">{transaction.username}</span>
            <span className="text-xs text-muted-foreground">{transaction.email}</span>
          </div>
        </TableCell>
        <TableCell className="text-right font-medium">
          {transaction.currency} {transaction.amount.toFixed(2)}
        </TableCell>
        <TableCell>
          <Badge variant={statusVariant} className="capitalize">
            {transaction.status}
          </Badge>
        </TableCell>
        <TableCell>{transaction.paymentMethod}</TableCell>
        <TableCell className="text-right">
          {format(date, 'dd MMM yyyy, HH:mm')}
        </TableCell>
      </TableRow>
      
      {/* Transaction Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>
              Complete information for transaction #{transaction.id}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="border-b pb-4">
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-medium">{transaction.currency} {transaction.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Status</span>
                <Badge variant={statusVariant} className="capitalize">
                  {transaction.status}
                </Badge>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Date</span>
                <span>{format(date, 'dd MMM yyyy, HH:mm:ss')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Method</span>
                <span>{transaction.paymentMethod}</span>
              </div>
            </div>
            
            <div className="border-b pb-4">
              <div className="mb-2">
                <h4 className="text-sm font-medium">User Information</h4>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Name</span>
                <span>{transaction.username}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email</span>
                <span>{transaction.email}</span>
              </div>
            </div>
            
            <div>
              <div className="mb-2">
                <h4 className="text-sm font-medium">Payment Information</h4>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Payment ID</span>
                <span className="font-mono text-xs">{transaction.paymentId}</span>
              </div>
              <div className="mb-2">
                <span className="text-muted-foreground">Description</span>
                <p className="mt-1">{transaction.description}</p>
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex sm:justify-between">
            <Button variant="outline" size="sm">
              <FileText className="mr-2 h-4 w-4" />
              Download Receipt
            </Button>
            
            {transaction.status === 'successful' && (
              <Button variant="destructive" size="sm">
                <RefreshCw className="mr-2 h-4 w-4" />
                Process Refund
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default function Payments() {
  const [dateRange, setDateRange] = useState('30d');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Fetch revenue stats
  const { 
    data: revenueStats,
    isLoading: statsLoading
  } = useQuery<RevenueStats>({
    queryKey: ['/api/admin/payments/revenue', dateRange],
  });
  
  // Fetch transactions
  const { 
    data: transactions,
    isLoading: transactionsLoading
  } = useQuery<Transaction[]>({
    queryKey: ['/api/admin/payments/transactions', dateRange, statusFilter, searchTerm],
  });
  
  // Filter transactions based on status and search term
  const filteredTransactions = transactions?.filter(transaction => {
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
    const matchesSearch = !searchTerm || 
      transaction.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Payments</h1>
        <p className="text-muted-foreground">
          Manage payments, refunds and view transaction history
        </p>
      </div>
      
      {/* Revenue Summary */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Revenue</CardDescription>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">
                {statsLoading ? (
                  <Spinner size="sm" />
                ) : (
                  <>
                    {revenueStats?.currencySymbol}{revenueStats?.totalRevenue.toLocaleString()}
                  </>
                )}
              </CardTitle>
              {!statsLoading && revenueStats && (
                <Badge variant={revenueStats.revenueChange >= 0 ? "default" : "secondary"}>
                  {revenueStats.revenueChange >= 0 ? (
                    <ArrowUp className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowDown className="h-3 w-3 mr-1" />
                  )}
                  {Math.abs(revenueStats.revenueChange)}%
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              Compared to previous {dateRange} period
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Subscription Revenue</CardDescription>
            <CardTitle className="text-2xl">
              {statsLoading ? (
                <Spinner size="sm" />
              ) : (
                <>
                  {revenueStats?.currencySymbol}{revenueStats?.subscriptionRevenue.toLocaleString()}
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              <span className={(revenueStats?.subscriptionsChange ?? 0) >= 0 ? "text-green-500" : "text-red-500"}>
                {(revenueStats?.subscriptionsChange ?? 0) >= 0 ? "↑" : "↓"} {Math.abs(revenueStats?.subscriptionsChange ?? 0)}%
              </span> from previous period
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Refund Rate</CardDescription>
            <CardTitle className="text-2xl">
              {statsLoading ? <Spinner size="sm" /> : `${revenueStats?.refundRate}%`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              Overall refund rate based on total transactions
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>
                {filteredTransactions?.length || 0} transactions
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Select defaultValue={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-[160px]">
                  <Calendar className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 3 months</SelectItem>
                  <SelectItem value="365d">Last 12 months</SelectItem>
                  <SelectItem value="all">All time</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Status:</span>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="successful">Successful</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {transactionsLoading ? (
            <div className="py-12 text-center">
              <Spinner size="lg" className="mx-auto mb-4" />
              <p className="text-muted-foreground">Loading transactions...</p>
            </div>
          ) : filteredTransactions && filteredTransactions.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead className="text-right">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TransactionRow key={transaction.id} transaction={transaction} />
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="py-12 text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
                <CreditCard className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No transactions found</h3>
              <p className="text-muted-foreground mt-2">
                {searchTerm || statusFilter !== 'all'
                  ? "Try adjusting your filters"
                  : "There are no transactions in the selected period"}
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row items-center justify-between border-t pt-6">
          <div className="text-sm text-muted-foreground mb-4 sm:mb-0">
            Showing {filteredTransactions?.length || 0} of {transactions?.length || 0} transactions
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled
            >
              Next
            </Button>
          </div>
        </CardFooter>
      </Card>
      
      {/* Payment Methods Section */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Payment Settings</h2>
        
        <Tabs defaultValue="methods" className="space-y-6">
          <TabsList>
            <TabsTrigger value="methods">Payment Methods</TabsTrigger>
            <TabsTrigger value="settings">Gateway Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="methods">
            <Card>
              <CardHeader>
                <CardTitle>Connected Payment Methods</CardTitle>
                <CardDescription>
                  Manage the payment methods available to your customers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <CreditCard className="h-8 w-8 text-primary" />
                      <div>
                        <h3 className="font-medium">PayFast</h3>
                        <p className="text-sm text-muted-foreground">
                          South African payment gateway
                        </p>
                      </div>
                    </div>
                    <Badge>Active</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <CreditCard className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <h3 className="font-medium">Stripe</h3>
                        <p className="text-sm text-muted-foreground">
                          Not configured
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Configure
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <CreditCard className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <h3 className="font-medium">PayPal</h3>
                        <p className="text-sm text-muted-foreground">
                          Not configured
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Configure
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button>
                  <DollarSign className="mr-2 h-4 w-4" />
                  Add Payment Method
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Payment Gateway Settings</CardTitle>
                <CardDescription>
                  Configure your payment gateway integrations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">PayFast Settings</h3>
                    <div className="grid gap-4 mb-4">
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">Merchant ID</label>
                        <Input type="text" value="••••••••" readOnly />
                      </div>
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">Merchant Key</label>
                        <Input type="text" value="••••••••••••••••" readOnly />
                      </div>
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">Passphrase</label>
                        <Input type="password" value="••••••••••••••••" readOnly />
                      </div>
                    </div>
                    <Button variant="outline">Update PayFast Settings</Button>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-medium mb-2">General Settings</h3>
                    <div className="flex items-center justify-between mb-4 p-3 border rounded">
                      <div>
                        <label className="font-medium">Test Mode</label>
                        <p className="text-sm text-muted-foreground">
                          Process payments through sandbox environment
                        </p>
                      </div>
                      <Select defaultValue="false">
                        <SelectTrigger className="w-[100px]">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">On</SelectItem>
                          <SelectItem value="false">Off</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <label className="font-medium">Default Currency</label>
                        <p className="text-sm text-muted-foreground">
                          Set the default currency for transactions
                        </p>
                      </div>
                      <Select defaultValue="ZAR">
                        <SelectTrigger className="w-[100px]">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ZAR">ZAR</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button>Save Settings</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}