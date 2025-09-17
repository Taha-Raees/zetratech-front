'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Building } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { adminApi } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';

interface MobileStoresCreateFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function MobileStoresCreateForm({
  onSuccess,
  onCancel
}: MobileStoresCreateFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    storeName: '',
    businessType: 'GENERAL',
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    password: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Pakistan',
    phone: '',
    email: '',
    website: '',
    currency: 'PKR',
    taxRate: '17'
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await adminApi.createStore(formData);

      if (result.success) {
        toast({
          title: 'Store Created',
          description: 'New store has been created successfully.',
        });
        onSuccess?.();
      } else {
        throw new Error(result.error || 'Failed to create store');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create store.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Loading state for form skeleton
  if (loading && !formData.storeName) {
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
          <Building className="h-8 w-8 text-primary" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Store Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Store Information</CardTitle>
            <CardDescription>Basic details about the store</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="storeName">Store Name *</Label>
              <Input
                id="storeName"
                value={formData.storeName}
                onChange={(e) => handleInputChange('storeName', e.target.value)}
                placeholder="e.g., Ahmed General Store"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessType">Business Type</Label>
              <Select value={formData.businessType} onValueChange={(value) => handleInputChange('businessType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select business type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GENERAL">General Store</SelectItem>
                  <SelectItem value="ELECTRONICS">Electronics</SelectItem>
                  <SelectItem value="CLOTHING">Clothing/Fashion</SelectItem>
                  <SelectItem value="GROCERY">Grocery</SelectItem>
                  <SelectItem value="RESTAURANT">Restaurant</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Owner Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Owner Information</CardTitle>
            <CardDescription>Store owner's details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ownerName">Owner Name *</Label>
                <Input
                  id="ownerName"
                  value={formData.ownerName}
                  onChange={(e) => handleInputChange('ownerName', e.target.value)}
                  placeholder="Full name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ownerEmail">Owner Email *</Label>
                <Input
                  id="ownerEmail"
                  type="email"
                  value={formData.ownerEmail}
                  onChange={(e) => handleInputChange('ownerEmail', e.target.value)}
                  placeholder="owner@example.com"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ownerPhone">Owner Phone</Label>
                <Input
                  id="ownerPhone"
                  value={formData.ownerPhone}
                  onChange={(e) => handleInputChange('ownerPhone', e.target.value)}
                  placeholder="+92-300-1234567"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Login Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Store login password"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Contact Information</CardTitle>
            <CardDescription>Store contact details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Store Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Store contact number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Store Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="contact@store.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website (Optional)</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="https://www.store.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* Address Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Address Information</CardTitle>
            <CardDescription>Store physical location</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="street">Street Address</Label>
              <Textarea
                id="street"
                value={formData.street}
                onChange={(e) => handleInputChange('street', e.target.value)}
                placeholder="e.g., 123 Main Street, Commercial Area"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="e.g., Karachi"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">Province</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  placeholder="e.g., Sindh"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input
                id="postalCode"
                value={formData.postalCode}
                onChange={(e) => handleInputChange('postalCode', e.target.value)}
                placeholder="e.g., 74000"
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
            {loading ? 'Creating Store...' : 'Create Store'}
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
