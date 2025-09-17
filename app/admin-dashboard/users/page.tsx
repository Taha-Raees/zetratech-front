'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Device detection and mobile components
import { useDeviceAdaptive } from '@/hooks/use-device-adaptive';
import { useAuth } from '@/contexts/AuthContext';
import { MobileUsersManager } from '@/components/users/MobileUsersManager';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Eye,
  Key
} from 'lucide-react';
import { AdminBreadcrumbs } from '@/components/layout/AdminBreadcrumbs';
import { useToast } from '@/hooks/use-toast';
import { adminApi } from '@/lib/api';
import { User } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

interface UserData extends User {
  lastLogin?: string;
}

export default function UsersManagementPage() {
  const { toast } = useToast();
  const { shouldUseMobileView } = useDeviceAdaptive();

  // Orientation-aware adaptive rendering:
  // - Mobile & portrait tablet: Mobile experience
  // - Landscape tablet & desktop: Desktop experience
  // Note: Layout is handled by admin dashboard layout.tsx, no wrapper needed here
  if (shouldUseMobileView) {
    return (
      <MobileUsersManager
        initialView="list"
        onUserSelected={(userId) => {
          console.log('User selected:', userId);
        }}
        onEditUser={(userId) => {
          console.log('Edit user:', userId);
        }}
      />
    );
  }

  // Desktop behavior - existing implementation with dialog-based modals
  return <DesktopUsersPage />;
}

// Original desktop implementation as separate component
function DesktopUsersPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

  // Fetch users from API
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Call the real API endpoint
      const result = await adminApi.getUsers();
      
      if (result.success && result.data) {
        setUsers(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch users');
      }
    } catch (error: any) {
      console.error('Error fetching users:', error);
      setError(error.message || 'Failed to fetch users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user: UserData) => {
    setEditingUser(user);
    setIsDialogOpen(true);
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      // Call the real API endpoint
      const result = await adminApi.deleteUser(id);
      
      if (result.success) {
        toast({
          title: "Success",
          description: "User deleted successfully",
        });
        
        // Refresh users
        fetchUsers();
      } else {
        throw new Error(result.error || 'Failed to delete user');
      }
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  const handlePasswordReset = (user: UserData) => {
    setSelectedUser(user);
    setShowPasswordReset(true);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'default'; // Blue badge for admins
      case 'OWNER': return 'destructive'; // Red badge for owners
      case 'MANAGER': return 'outline'; // Outline badge for managers
      case 'STAFF': return 'secondary'; // Gray badge for staff
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <AdminBreadcrumbs />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">Manage all users in the system</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingUser(null);
              setIsDialogOpen(true);
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add New User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingUser ? 'Edit User' : 'Create New User'}</DialogTitle>
              <DialogDescription>
                {editingUser ? 'Update user information' : 'Fill in the details to create a new user'}
              </DialogDescription>
            </DialogHeader>
            <UserForm 
              user={editingUser} 
              onSuccess={() => {
                setIsDialogOpen(false);
                fetchUsers();
              }} 
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Password Reset Dialog */}
      <Dialog open={showPasswordReset} onOpenChange={setShowPasswordReset}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Reset password for {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>
          <PasswordResetForm 
            user={selectedUser} 
            onSuccess={() => {
              setShowPasswordReset(false);
              setSelectedUser(null);
              fetchUsers();
            }} 
          />
        </DialogContent>
      </Dialog>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="OWNER">Owner</SelectItem>
                  <SelectItem value="MANAGER">Manager</SelectItem>
                  <SelectItem value="STAFF">Cashier</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
          <CardDescription>View and manage all system users</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loading ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead><Skeleton className="h-4 w-16" /></TableHead>
                    <TableHead><Skeleton className="h-4 w-16" /></TableHead>
                    <TableHead><Skeleton className="h-4 w-20" /></TableHead>
                    <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                    <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                    <TableHead className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            <Skeleton className="h-4 w-32" />
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            <Skeleton className="h-3 w-40" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-16 rounded-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-16" />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="outline" size="sm" disabled>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" disabled>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" disabled>
                            <Key className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" disabled>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-600">Get started by creating a new user.</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Store</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{user.name || 'N/A'}</div>
                              <div className="text-sm text-gray-600">{user.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getRoleBadgeVariant(user.role)}>{user.role}</Badge>
                          </TableCell>
                          <TableCell>
                            {user.store ? user.store.name : 'N/A'}
                          </TableCell>
                          <TableCell>{formatDate(user.createdAt)}</TableCell>
                          <TableCell>
                            {user.lastLogin ? formatDate(user.lastLogin) : 'Never'}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditUser(user)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePasswordReset(user)}
                              >
                                <Key className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteUser(user.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// User Form Component
function UserForm({ user, onSuccess }: { user: UserData | null; onSuccess: () => void }) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || 'ADMIN',
    password: '',
    storeId: user?.storeId || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (user) {
        // Update existing user
        const userData = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          storeId: formData.storeId || undefined,
        };

        const result = await adminApi.updateUser(user.id, userData);
        
        if (result.success) {
          toast({
            title: "Success",
            description: "User updated successfully",
          });
          onSuccess();
        } else {
          throw new Error(result.error || 'Failed to update user');
        }
      } else {
        // Create new user
        if (!formData.password) {
          throw new Error('Password is required for new users');
        }

        const userData = {
          email: formData.email,
          password: formData.password,
          name: formData.name,
          role: formData.role,
          storeId: formData.storeId || undefined,
          isActive: true
        };

        const result = await adminApi.createUser(userData);
        
        if (result.success) {
          toast({
            title: "Success",
            description: "User created successfully",
          });
          onSuccess();
        } else {
          throw new Error(result.error || 'Failed to create user');
        }
      }
    } catch (err: any) {
      console.error('Error saving user:', err);
      setError(err.message || 'Error saving user');
      toast({
        title: "Error",
        description: err.message || "Failed to save user",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name *</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="e.g., John Doe"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="e.g., john@example.com"
          required
        />
      </div>

      {!user && (
        <div className="space-y-2">
          <Label htmlFor="password">Password *</Label>
          <Input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Enter a strong password"
            required={!user}
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="role">Role *</Label>
        <Select onValueChange={(value) => handleSelectChange('role', value)} value={formData.role}>
          <SelectTrigger>
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ADMIN">System Administrator</SelectItem>
            <SelectItem value="OWNER">Store Owner</SelectItem>
            <SelectItem value="MANAGER">Store Manager</SelectItem>
            <SelectItem value="STAFF">Store Cashier</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="storeId">Store ID (Optional)</Label>
        <Input
          id="storeId"
          name="storeId"
          value={formData.storeId}
          onChange={handleInputChange}
          placeholder="Enter store ID"
        />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : user ? 'Update User' : 'Create User'}
        </Button>
      </div>
    </form>
  );
}

// Password Reset Form Component
function PasswordResetForm({ user, onSuccess }: { user: UserData | null; onSuccess: () => void }) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Note: This would require implementing a password reset endpoint in the API
      // For now, we'll show a placeholder implementation
      toast({
        title: "Not Implemented",
        description: "Password reset functionality would be implemented here",
        variant: "destructive",
      });
      
      // In a real implementation, you would call:
      // const result = await adminApi.resetUserPassword(user?.id, formData.newPassword);
      
      onSuccess();
    } catch (err: any) {
      console.error('Error resetting password:', err);
      setError(err.message || 'Error resetting password');
      toast({
        title: "Error",
        description: err.message || "Failed to reset password",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="newPassword">New Password *</Label>
        <Input
          id="newPassword"
          name="newPassword"
          type="password"
          value={formData.newPassword}
          onChange={handleInputChange}
          placeholder="Enter new password"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password *</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          placeholder="Confirm new password"
          required
        />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Resetting...' : 'Reset Password'}
        </Button>
      </div>
    </form>
  );
}
