'use client';

import React, { useState, useEffect } from 'react';
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
import { Store } from '@/lib/types';

interface MobileStoresEditFormProps {
  storeId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function MobileStoresEditForm({
  storeId,
  onSuccess,
  onCancel
}: MobileStoresEditFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [store, setStore] = useState<Store | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    businessType: 'GENERAL',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Pakistan',
    phone: '',
    email: '',
    website: ''
  });

  useEffect(() => {
    fetchStore();
  }, [storeId]);

  const fetchStore = async () => {
    try {
      console.log('📡 Mobile - Fetching store for edit:', storeId);
      setFetching(true);

      const result = await adminApi.getStoreById(storeId);

      if (result.success && result.data) {
        setStore(result.data);
        setFormData({
          name: result.data.name,
          businessType: result.data.businessType,
          street: result.data.street || '',
          city: result.data.city || '',
          state: result.data.state || '',
          postalCode: result.data.postalCode || '',
          country: result.data.country || 'Pakistan',
          phone: result.data.phone || '',
          email: result.data.email || '',
          website: result.data.website || ''
        });
      } else {
        throw new Error(result.error || 'Failed to fetch store');
      }
    } catch (error: any) {
      console.error('❌ Mobile - Error fetching store for edit:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load store details.',
        variant: 'destructive',
      });
      if (onCancel) onCancel();
    } finally {
      setFetching(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('📡 Mobile - Updating store:', storeId, formData);

      const updateData = {
        name: formData.name,
        businessType: formData.businessType,
        street: formData.street,
        city: formData.city,
        state: formData.state,
        postalCode: formData.postalCode,
        country: formData.country,
        phone: formData.phone,
        email: formData.email,
        website: formData.website
      };

      const result = await adminApi.updateStore(storeId, updateData);

      if (result.success) {
        toast({
          title: 'Store Updated',
          description: 'Store has been updated successfully.',
        });
        onSuccess?.();
      } else {
        throw new Error(result.error || 'Failed to update store');
      }
    } catch (error: any) {
      console.error('❌ Mobile - Error updating store:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update store.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetching || !store) {
    return (
      <div className="space-y-4 p-4">
        <div className="flex items-center justify-center py-4">
          <Skeleton className="h-16 w-16 rounded-full" />
        </div>
        <Card>
          <CardHeader>
            <CardContent className="p-6 space-y-4">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </CardContent>
          </CardHeader>
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
            <CardDescription>Update store basic details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Store Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
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

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Contact Information</CardTitle>
            <CardDescription>Update contact details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+92-300-1234567"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
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
            <CardDescription>Update physical location</CardDescription>
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
            {loading ? 'Updating Store...' : 'Update Store'}
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
