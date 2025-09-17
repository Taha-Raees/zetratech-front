'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { adminApi } from '@/lib/api';
import { Store, SubscriptionPackage } from '@/lib/types';
import { CreditCard, CheckCircle, XCircle } from 'lucide-react';

interface StoreSubscriptionManagerProps {
  store: Store;
  onSubscriptionUpdate: (updatedStore: Store) => void;
}

export function StoreSubscriptionManager({ store, onSubscriptionUpdate }: StoreSubscriptionManagerProps) {
  const { toast } = useToast();
  const [packages, setPackages] = useState<SubscriptionPackage[]>([]);
  const [selectedPackageId, setSelectedPackageId] = useState<string>(store.subscriptionPackage?.id || '');
  const [loading, setLoading] = useState(false);
  const [packagesLoading, setPackagesLoading] = useState(true);

  useEffect(() => {
    fetchActivePackages();
  }, []);

  const fetchActivePackages = async () => {
    try {
      setPackagesLoading(true);
      const result = await adminApi.getActiveSubscriptionPackages();
      if (result.success && result.data) {
        setPackages(result.data);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load subscription packages",
        variant: "destructive",
      });
    } finally {
      setPackagesLoading(false);
    }
  };

  const handleAssignSubscription = async () => {
    if (!selectedPackageId) {
      toast({
        title: "Error",
        description: "Please select a subscription package",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const result = await adminApi.assignSubscription(store.id, selectedPackageId);
      
      if (result.success && result.data) {
        onSubscriptionUpdate(result.data);
        toast({
          title: "Success",
          description: "Subscription assigned successfully",
        });
      } else {
        throw new Error(result.error || 'Failed to assign subscription');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to assign subscription",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (status: 'active' | 'suspended') => {
    try {
      setLoading(true);
      const result = await adminApi.updateStoreStatus(store.id, status);
      
      if (result.success && result.data) {
        onSubscriptionUpdate(result.data);
        toast({
          title: "Success",
          description: `Store status updated to ${status}`,
        });
      } else {
        throw new Error(result.error || 'Failed to update store status');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update store status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'PKR') => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const currentPackage = packages.find(pkg => pkg.id === selectedPackageId) || store.subscriptionPackage;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Subscription Management
          </CardTitle>
          <CardDescription>
            Manage store subscription package and status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Subscription Status */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-medium">Current Status</h3>
              <p className="text-sm text-muted-foreground">
                {store.subscriptionPackage 
                  ? `${store.subscriptionPackage.name} package` 
                  : 'No subscription assigned'}
              </p>
            </div>
            <Badge variant={store.subscriptionStatus === 'active' ? 'default' : 'secondary'}>
              {store.subscriptionStatus}
            </Badge>
          </div>

          {/* Status Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <Label>Store Status</Label>
              <p className="text-sm text-muted-foreground">
                {store.subscriptionStatus === 'active' 
                  ? 'Store is currently active' 
                  : 'Store is currently suspended'}
              </p>
            </div>
            <Switch
              checked={store.subscriptionStatus === 'active'}
              onCheckedChange={(checked) => 
                handleStatusToggle(checked ? 'active' : 'suspended')
              }
              disabled={loading}
            />
          </div>

          {/* Assign Subscription */}
          <div className="space-y-4">
            <h3 className="font-medium">Assign Subscription Package</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subscription-package">Subscription Package</Label>
                <Select 
                  value={selectedPackageId} 
                  onValueChange={setSelectedPackageId}
                  disabled={packagesLoading || loading}
                >
                  <SelectTrigger id="subscription-package">
                    <SelectValue placeholder="Select a package" />
                  </SelectTrigger>
                  <SelectContent>
                    {packages.map((pkg) => (
                      <SelectItem key={pkg.id} value={pkg.id}>
                        {pkg.name} ({formatCurrency(pkg.price, pkg.currency)}/mo)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={handleAssignSubscription}
                  disabled={loading || !selectedPackageId || selectedPackageId === store.subscriptionPackage?.id}
                >
                  {loading ? 'Assigning...' : 'Assign Subscription'}
                </Button>
              </div>
            </div>
          </div>

          {/* Package Details */}
          {currentPackage && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {currentPackage.name}
                  {currentPackage.isActive ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                </CardTitle>
                <CardDescription>
                  {currentPackage.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-2xl font-bold text-primary">
                    {formatCurrency(currentPackage.price, currentPackage.currency)}
                    <span className="text-base font-normal text-muted-foreground">/month</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Max Stores</p>
                      <p className="font-medium">
                        {currentPackage.maxStores === -1 ? 'Unlimited' : currentPackage.maxStores}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Max Products</p>
                      <p className="font-medium">{currentPackage.maxProducts.toLocaleString()}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Max Users</p>
                      <p className="font-medium">{currentPackage.maxUsers}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Features:</h4>
                    <ul className="text-sm space-y-1">
                      {currentPackage.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
