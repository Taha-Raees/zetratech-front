'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Building,
  Edit,
  Trash2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Calendar,
  User,
  Package,
  CreditCard
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { adminApi } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Store } from '@/lib/types';

interface MobileStoresDetailViewProps {
  storeId: string;
  onEditRequest?: (storeId: string) => void;
  onDeleteRequest?: (storeId: string) => void;
  onSubscriptionRequest?: (storeId: string) => void;
  onBack?: () => void;
}

export function MobileStoresDetailView({
  storeId,
  onEditRequest,
  onDeleteRequest,
  onSubscriptionRequest,
  onBack
}: MobileStoresDetailViewProps) {
  const { toast } = useToast();
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStore();
  }, [storeId]);

  const fetchStore = async () => {
    try {
      console.log('📡 Mobile - Fetching store details for:', storeId);
      setLoading(true);

      const result = await adminApi.getStoreById(storeId);
      console.log('📡 Mobile API response:', result);

      if (result.success && result.data) {
        setStore(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch store');
      }
    } catch (error: any) {
      console.error('❌ Mobile - Error fetching store:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load store details.',
        variant: 'destructive',
      });
      if (onBack) onBack();
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStore = async () => {
    if (!confirm('Are you sure you want to delete this store? This action cannot be undone.')) {
      return;
    }

    try {
      const result = await adminApi.deleteStore(storeId);

      if (result.success) {
        toast({
          title: 'Store Deleted',
          description: 'Store has been deleted successfully.',
        });
        if (onBack) onBack();
      } else {
        throw new Error(result.error || 'Failed to delete store');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete store.',
        variant: 'destructive',
      });
    }
  };

  if (loading || !store) {
    return (
      <div className="space-y-4 p-4">
        <div className="flex items-center justify-center py-8">
          <Skeleton className="h-16 w-16 rounded-full" />
        </div>
        <Card>
          <CardContent className="p-6 space-y-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {/* Store Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Building className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold truncate">{store.name}</h1>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant={store.businessType === 'GROCERY' ? 'default' : 'secondary'}>
                  {store.businessType}
                </Badge>
                <Badge variant={store.subscriptionStatus === 'active' ? 'default' : 'secondary'}>
                  {store.subscriptionStatus}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Store Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Store Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-3">
            <User className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <div>
              <p className="font-medium">Owner</p>
              <p className="text-sm text-muted-foreground">
                {store.owner?.name || 'No owner assigned'}
              </p>
            </div>
          </div>

          <Separator />

          <div className="flex items-center space-x-3">
            <Package className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <div>
              <p className="font-medium">Subscription</p>
              <p className="text-sm text-muted-foreground">
                {store.subscriptionPlan || 'No subscription'}
              </p>
            </div>
          </div>

          <Separator />

          <div className="flex items-center space-x-3">
            <Calendar className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <div>
              <p className="font-medium">Created</p>
              <p className="text-sm text-muted-foreground">
                {new Date(store.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {store.phone && (
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="font-medium">Phone</p>
                <p className="text-sm text-muted-foreground">{store.phone}</p>
              </div>
            </div>
          )}

          {store.email && (
            <>
              <Separator />
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{store.email}</p>
                </div>
              </div>
            </>
          )}

          {store.website && (
            <>
              <Separator />
              <div className="flex items-center space-x-3">
                <Globe className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="font-medium">Website</p>
                  <p className="text-sm text-muted-foreground">
                    <a
                      href={store.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {store.website}
                    </a>
                  </p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Address Information */}
      {(store.street || store.city || store.state) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Address</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start space-x-3">
              <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm">
                  {[store.street, store.city, store.state].filter(Boolean).join(', ')}
                </p>
                {store.postalCode && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Postal Code: {store.postalCode}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button
          onClick={() => onSubscriptionRequest?.(storeId)}
          variant="outline"
          className="w-full"
          size="lg"
        >
          <CreditCard className="h-4 w-4 mr-2" />
          Manage Subscription
        </Button>
        <Button
          onClick={() => onEditRequest?.(storeId)}
          className="w-full"
          size="lg"
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit Store
        </Button>
        <Button
          variant="destructive"
          onClick={handleDeleteStore}
          className="w-full"
          size="lg"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Store
        </Button>
      </div>
    </div>
  );
}
