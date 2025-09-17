'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Plus,
  Search,
  User,
  Shield,
  Eye,
  Edit,
  Trash2,
  Building
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { adminApi } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { User as UserType } from '@/lib/types';

interface MobileUsersListProps {
  onViewUser?: (userId: string) => void;
  onEditUser?: (userId: string) => void;
  onCreateUser?: () => void;
}

export function MobileUsersList({
  onViewUser,
  onEditUser,
  onCreateUser
}: MobileUsersListProps) {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch users from API
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      console.log('📡 Mobile - Fetching users from API...');
      setLoading(true);

      const result = await adminApi.getUsers();
      console.log('📡 Mobile API response:', result);

      if (result.success && result.data) {
        console.log('✅ Mobile - Users fetched successfully:', result.data);
        setUsers(result.data);
      } else {
        console.warn('⚠️ Mobile - API call successful but returned no data:', result);
        toast({
          title: "API Response Issue",
          description: result.error || "API returned success but no user data",
          variant: "destructive",
        });
        setUsers([]);
      }
    } catch (error: any) {
      console.error('❌ Mobile - Error fetching users:', error);
      toast({
        title: "Database Connection Error",
        description: `Cannot load users from database: ${error.message}`,
        variant: "destructive",
      });
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const result = await adminApi.deleteUser(userId);

      if (result.success) {
        toast({
          title: 'User Deleted',
          description: 'User has been deleted successfully.',
        });
        fetchUsers(); // Refresh users list
      } else {
        throw new Error(result.error || 'Failed to delete user');
      }
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete user.',
        variant: 'destructive',
      });
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Badge variant="destructive" className="text-xs">
                 <Shield className="h-3 w-3 mr-1" />
                 Admin
               </Badge>;
      case 'OWNER':
        return <Badge variant="default" className="text-xs">Store Owner</Badge>;
      case 'MANAGER':
        return <Badge variant="secondary" className="text-xs">Manager</Badge>;
      case 'STAFF':
        return <Badge variant="outline" className="text-xs">Staff</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">Unknown</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        {/* Welcome Header */}
        <div className="text-center py-2">
          <Skeleton className="h-8 w-24 mx-auto mb-2" />
          <Skeleton className="h-4 w-40 mx-auto" />
        </div>

        {/* Search skeleton */}
        <Skeleton className="h-10 w-full" />

        {/* Create user button skeleton */}
        <Skeleton className="h-10 w-full" />

        {/* Users list skeleton */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">System Users</CardTitle>
            <CardDescription>Manage admin and store users</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 p-3 border rounded-lg">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <div className="flex space-x-1">
                  <Skeleton className="h-8 w-8 rounded" />
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {/* Welcome Header */}
      <div className="text-center py-2">
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage system administrators</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Create New User Button */}
      <Button
        onClick={onCreateUser}
        className="w-full"
        size="lg"
      >
        <Plus className="h-4 w-4 mr-2" />
        Create New User
      </Button>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">System Users ({filteredUsers.length})</CardTitle>
          <CardDescription>Tap on a user to manage them</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <div key={user.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <User className="h-5 w-5 text-primary" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{user.name || 'Unnamed'}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {user.email} • {user.store?.name || 'No store'}
                  </div>
                  <div className="mt-1">
                    {getRoleBadge(user.role)}
                  </div>
                </div>

                <div className="flex space-x-1 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewUser?.(user.id)}
                    className="h-8 w-8 p-0"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditUser?.(user.id)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteUser(user.id)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No users found</h3>
              <p className="text-sm mb-4">
                {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating your first admin user.'}
              </p>
              <Button onClick={onCreateUser}>
                <Plus className="h-4 w-4 mr-2" />
                Create New User
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
