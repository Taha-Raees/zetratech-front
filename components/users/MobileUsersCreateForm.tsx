'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { adminApi } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';

interface MobileUsersCreateFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function MobileUsersCreateForm({
  onSuccess,
  onCancel
}: MobileUsersCreateFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'STAFF' as 'ADMIN' | 'OWNER' | 'MANAGER' | 'STAFF',
    storeId: '',
    isActive: true
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'role'
        ? value as 'ADMIN' | 'OWNER' | 'MANAGER' | 'STAFF'
        : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Full name is required.',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.email.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Email address is required.',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.password.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Password is required.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      console.log('📡 Mobile - Creating new user:', formData);

      const result = await adminApi.createUser(formData);

      if (result.success) {
        toast({
          title: 'User Created',
          description: 'New user has been created successfully.',
        });
        onSuccess?.();
      } else {
        throw new Error(result.error || 'Failed to create user');
      }
    } catch (error: any) {
      console.error('❌ Mobile - Error creating user:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create user.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Loading state for form skeleton
  if (loading && !formData.name) {
    return (
      <div className="space-y-4 p-4">
        <div className="flex items-center justify-center py-4">
          <Skeleton className="h-16 w-16 rounded-full" />
        </div>
        <Card>
          <CardContent className="p-6 space-y-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center justify-center py-4">
        <div className="bg-primary/10 p-4 rounded-full">
          <User className="h-8 w-8 text-primary" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* User Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">User Information</CardTitle>
            <CardDescription>Create a new system user</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., John Smith"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="john@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Secure password"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select user role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span>Administrator</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="OWNER">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Store Owner</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="MANAGER">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Store Manager</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="STAFF">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                      <span>Staff Member</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="storeId">Assign to Store (Optional)</Label>
              <Input
                id="storeId"
                value={formData.storeId}
                onChange={(e) => handleInputChange('storeId', e.target.value)}
                placeholder="Enter store ID if applicable"
              />
            </div>
          </CardContent>
        </Card>

        {/* Role Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Role Permissions</CardTitle>
            <CardDescription>What this user can access</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {formData.role === 'ADMIN' && (
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium">Administrator Access</p>
                    <p className="text-sm text-muted-foreground">
                      Full access to all admin features, users, settings, and system configuration
                    </p>
                  </div>
                </div>
              )}

              {formData.role === 'OWNER' && (
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium">Store Owner Access</p>
                    <p className="text-sm text-muted-foreground">
                      Manage their assigned store's inventory, orders, and analytics
                    </p>
                  </div>
                </div>
              )}

              {formData.role === 'MANAGER' && (
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium">Manager Access</p>
                    <p className="text-sm text-muted-foreground">
                      Manage store operations and staff under their supervision
                    </p>
                  </div>
                </div>
              )}

              {formData.role === 'STAFF' && (
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-gray-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium">Staff Access</p>
                    <p className="text-sm text-muted-foreground">
                      Process orders and manage inventory items they have access to
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={loading}
          >
            {loading ? 'Creating User...' : 'Create User Account'}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            size="lg"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
