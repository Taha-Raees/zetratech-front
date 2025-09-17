'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { adminApi } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';

interface MobilePackagesCreateFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function MobilePackagesCreateForm({
  onSuccess,
  onCancel
}: MobilePackagesCreateFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    currency: 'PKR',
    description: '',
    maxStores: 1,
    maxProducts: 100,
    maxUsers: 5,
    features: '',
    isActive: true,
    isDefault: false
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Package name is required.',
        variant: 'destructive',
      });
      return;
    }

    if (formData.price < 0) {
      toast({
        title: 'Validation Error',
        description: 'Price cannot be negative.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      console.log('📡 Mobile - Creating new package:', formData);

      const result = await adminApi.createSubscriptionPackage({
        ...formData,
        features: formData.features.split('\n').filter(f => f.trim() !== '')
      });

      if (result.success) {
        toast({
          title: 'Package Created',
          description: 'New subscription package has been created successfully.',
        });
        onSuccess?.();
      } else {
        throw new Error(result.error || 'Failed to create package');
      }
    } catch (error: any) {
      console.error('❌ Mobile - Error creating package:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create subscription package.',
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
            {[...Array(8)].map((_, i) => (
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
          <Package className="h-8 w-8 text-primary" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Package Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Package Information</CardTitle>
            <CardDescription>Basic details about your subscription package</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Package Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., Basic, Premium, Enterprise"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (Monthly) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                  placeholder="e.g., 500"
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PKR">PKR</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Description</CardTitle>
            <CardDescription>Package description for customers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="description">Package Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe this package..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Limits & Features */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Limits & Features</CardTitle>
            <CardDescription>Set limits and features for this package</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxStores">Max Stores</Label>
                <Input
                  id="maxStores"
                  type="number"
                  value={formData.maxStores}
                  onChange={(e) => handleInputChange('maxStores', parseInt(e.target.value) || 1)}
                  placeholder="e.g., 1 (-1 for unlimited)"
                  min="-1"
                />
                <p className="text-xs text-muted-foreground">-1 for unlimited stores</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxProducts">Max Products</Label>
                <Input
                  id="maxProducts"
                  type="number"
                  value={formData.maxProducts}
                  onChange={(e) => handleInputChange('maxProducts', parseInt(e.target.value) || 100)}
                  placeholder="e.g., 500"
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxUsers">Max Users</Label>
                <Input
                  id="maxUsers"
                  type="number"
                  value={formData.maxUsers}
                  onChange={(e) => handleInputChange('maxUsers', parseInt(e.target.value) || 5)}
                  placeholder="e.g., 3"
                  min="1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="features">Features (one per line)</Label>
              <Textarea
                id="features"
                value={formData.features}
                onChange={(e) => handleInputChange('features', e.target.value)}
                placeholder="Enter features, one per line&#10;• Up to 500 products&#10;• 3 user accounts&#10;• Advanced analytics"
                rows={6}
              />
            </div>
          </CardContent>
        </Card>

        {/* Package Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Package Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Active Status</Label>
                <p className="text-sm text-muted-foreground">Make this package available for purchase</p>
              </div>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => handleInputChange('isActive', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Default Package</Label>
                <p className="text-sm text-muted-foreground">This will be the default package for new stores</p>
              </div>
              <Switch
                checked={formData.isDefault}
                onCheckedChange={(checked) => handleInputChange('isDefault', checked)}
              />
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
            {loading ? 'Creating Package...' : 'Create Package'}
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
