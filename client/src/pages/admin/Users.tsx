import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { apiRequest } from '@/lib/queryClient';
import { Plus, Users as UsersIcon, Edit, Calendar, RefreshCw, User, ShieldCheck, UserCheck, UserCog } from 'lucide-react';

interface UserType {
  id: number;
  username: string;
  email: string;
  fullName?: string;
  isAdmin?: boolean;
  isPremium?: boolean;
  avatarUrl?: string;
  createdAt?: string;
}

interface UserFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  isAdmin: boolean;
  isPremium: boolean;
}

// Generate avatar URL based on name
const generateAvatarUrl = (name: string) => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
};

export default function Users() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [showAddDialog, setShowAddDialog] = useState<boolean>(false);
  const [showEditDialog, setShowEditDialog] = useState<boolean>(false);
  const [showCreateAdminDialog, setShowCreateAdminDialog] = useState<boolean>(false);
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    isAdmin: false,
    isPremium: false,
  });

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setFormData(prev => ({ ...prev, [name]: newValue }));
  };

  // Toggle switch handlers
  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const data = await apiRequest('/api/admin/users');
        setUsers(data);
      } catch (error) {
        console.error('Failed to fetch users:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch users.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [toast]);

  // Handle user creation
  const handleCreateUser = async () => {
    if (!formData.username || !formData.email || !formData.password) {
      toast({
        title: 'Missing Fields',
        description: 'Username, email, and password are required.',
        variant: 'destructive',
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'Password Mismatch',
        description: 'Password and confirm password must match.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const newUser = await apiRequest('/api/admin/create-admin', 'POST', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        isAdmin: true,
        isPremium: formData.isPremium,
      });
      
      setUsers(prev => [...prev, newUser.user]);
      
      toast({
        title: 'Admin Created',
        description: `Admin account "${formData.username}" has been created.`,
      });
      
      // Reset form and close dialog
      setFormData({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        isAdmin: false,
        isPremium: false,
      });
      setShowCreateAdminDialog(false);
    } catch (error) {
      console.error('Create failed:', error);
      toast({
        title: 'Create Failed',
        description: error instanceof Error ? error.message : 'Failed to create admin account.',
        variant: 'destructive',
      });
    }
  };

  // Handle user update
  const handleUpdateUser = async () => {
    if (!formData.username || !formData.email || !selectedUserId) {
      toast({
        title: 'Missing Fields',
        description: 'Username and email are required.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Remove password fields if they're empty
      const updateData = { ...formData } as any;
      if (!updateData.password) {
        updateData.password = undefined;
        updateData.confirmPassword = undefined;
      } else if (updateData.password !== updateData.confirmPassword) {
        toast({
          title: 'Password Mismatch',
          description: 'Password and confirm password must match.',
          variant: 'destructive',
        });
        return;
      }

      updateData.confirmPassword = undefined; // Remove confirmPassword as it's not part of the API
      
      const updatedUser = await apiRequest(`/api/admin/users/${selectedUserId}`, 'PUT', updateData);
      
      setUsers(prev => 
        prev.map(usr => usr.id === selectedUserId ? updatedUser : usr)
      );
      
      toast({
        title: 'User Updated',
        description: `User "${formData.username}" has been updated.`,
      });
      
      // Reset form and close dialog
      setFormData({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        isAdmin: false,
        isPremium: false,
      });
      setSelectedUserId(null);
      setShowEditDialog(false);
    } catch (error) {
      console.error('Update failed:', error);
      toast({
        title: 'Update Failed',
        description: error instanceof Error ? error.message : 'Failed to update user.',
        variant: 'destructive',
      });
    }
  };

  // Set up for editing a user
  const handleEditSetup = (user: UserType) => {
    setSelectedUserId(user.id);
    setFormData({
      username: user.username,
      email: user.email,
      password: '',
      confirmPassword: '',
      fullName: user.fullName || '',
      isAdmin: user.isAdmin || false,
      isPremium: user.isPremium || false,
    });
    setShowEditDialog(true);
  };

  // Format date from ISO string
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // If not authenticated or not an admin, show error
  if (!isLoading && (!user || !user.isAdmin)) {
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
      <h1 className="text-3xl font-bold mb-6">User Management</h1>
      
      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Users</CardTitle>
            <CardDescription>
              Manage user accounts for the platform
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => setShowCreateAdminDialog(true)}>
              <ShieldCheck className="mr-2 h-4 w-4" />
              Create Admin
            </Button>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <span className="animate-spin mr-2">
                <RefreshCw size={20} />
              </span>
              Loading users...
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 space-y-3">
              <UsersIcon className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-semibold">No users found</h3>
              <p className="text-sm text-muted-foreground">
                Get started by adding your first user.
              </p>
              <div className="flex justify-center space-x-2">
                <Button onClick={() => setShowCreateAdminDialog(true)}>
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Create Admin
                </Button>
                <Button onClick={() => setShowAddDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add User
                </Button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="user-table">
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-full overflow-hidden bg-muted">
                            <img
                              src={user.avatarUrl || generateAvatarUrl(user.fullName || user.username)}
                              alt={user.username}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-medium">{user.fullName || user.username}</p>
                            <p className="text-xs text-muted-foreground">{user.username}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <div className="flex flex-col space-y-1">
                          {user.isAdmin && (
                            <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200">
                              <ShieldCheck className="h-3 w-3 mr-1" />
                              Admin
                            </Badge>
                          )}
                          {user.isPremium && (
                            <Badge variant="outline" className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100 border-indigo-200">
                              <UserCheck className="h-3 w-3 mr-1" />
                              Premium
                            </Badge>
                          )}
                          {!user.isPremium && !user.isAdmin && (
                            <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100 border-gray-200">
                              <User className="h-3 w-3 mr-1" />
                              Standard
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                          <span className="text-sm">{formatDate(user.createdAt)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditSetup(user)}
                        >
                          <Edit size={16} className="mr-1" />
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Admin Dialog */}
      <Dialog open={showCreateAdminDialog} onOpenChange={setShowCreateAdminDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Admin Account</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Email address"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name (Optional)</Label>
              <Input
                id="fullName"
                name="fullName"
                placeholder="Full name"
                value={formData.fullName}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="isPremium"
                checked={formData.isPremium}
                onCheckedChange={(checked) => handleSwitchChange('isPremium', checked)}
              />
              <Label htmlFor="isPremium">Premium Account</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateAdminDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateUser}>
              <ShieldCheck className="mr-2 h-4 w-4" />
              Create Admin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="username-edit">Username</Label>
              <Input
                id="username-edit"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email-edit">Email</Label>
              <Input
                id="email-edit"
                name="email"
                type="email"
                placeholder="Email address"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fullName-edit">Full Name (Optional)</Label>
              <Input
                id="fullName-edit"
                name="fullName"
                placeholder="Full name"
                value={formData.fullName}
                onChange={handleInputChange}
              />
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <Label htmlFor="password-edit">New Password (leave blank to keep unchanged)</Label>
              <Input
                id="password-edit"
                name="password"
                type="password"
                placeholder="New password"
                value={formData.password}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword-edit">Confirm New Password</Label>
              <Input
                id="confirmPassword-edit"
                name="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="isAdmin-edit"
                checked={formData.isAdmin}
                onCheckedChange={(checked) => handleSwitchChange('isAdmin', checked)}
              />
              <Label htmlFor="isAdmin-edit">Admin Account</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="isPremium-edit"
                checked={formData.isPremium}
                onCheckedChange={(checked) => handleSwitchChange('isPremium', checked)}
              />
              <Label htmlFor="isPremium-edit">Premium Account</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button>
            <Button onClick={handleUpdateUser}>
              <UserCog className="mr-2 h-4 w-4" />
              Update User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}