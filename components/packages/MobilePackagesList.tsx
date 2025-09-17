'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Package,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  CreditCard
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { adminApi } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { SubscriptionPackage } from '@/lib/types';

interface MobilePackagesListProps {
  onViewPackage?: (packageId: string) => void;
  onEditPackage?: (packageId: string) => void;
  onCreatePackage?: () => void;
}

export function MobilePackagesList({
  onViewPackage,
  onEditPackage,
  onCreatePackage
}: MobilePackagesListProps) {
  const { toast } = useToast();
  const [packages, setPackages] = useState<SubscriptionPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch packages from API
  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      console.log('📡 Mobile - Fetching packages from API...');
      setLoading(true);

      const result = await adminApi.getSubscriptionPackages();
      console.log('📡 Mobile API response:', result);

      if (result.success && result.data) {
        console.log('✅ Mobile - Packages fetched successfully:', result.data);
        setPackages(result.data);
      } else {
        console.warn('⚠️ Mobile - API call successful but returned no data:', result);
        toast({
          title: "API Response Issue",
          description: result.error || "API returned success but no package data",
          variant: "destructive",
        });
        setPackages([]);
      }
    } catch (error: any) {
      console.error('❌ Mobile - Error fetching packages:', error);
      toast({
        title: "Database Connection Error",
        description: `Cannot load packages from database: ${error.message}`,
        variant: "destructive",
      });
      setPackages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePackage = async (packageId: string) => {
    if (!confirm('Are you sure you want to delete this package? This action cannot be undone.')) {
      return;
    }

    try {
      // Use adminApi.deleteSubscriptionPackage when available, fallback to generic API call
      const result = await adminApi.deleteSubscriptionPackage?.(packageId);

      if (result?.success) {
        toast({
          title: 'Package Deleted',
          description: 'Package has been deleted successfully.',
        });
        fetchPackages(); // Refresh packages list
      } else {
        throw new Error(result?.error || 'Failed to delete package');
      }
    } catch (error: any) {
      console.error('Error deleting package:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete package.',
        variant: 'destructive',
      });
    }
  };

  const filteredPackages = packages.filter(pkg => {
    const matchesSearch = pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (pkg.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    return matchesSearch;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        {/* Search skeleton */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Skeleton className="h-10 w-full pl-10" />
        </div>

        {/* Create new package button skeleton */}
        <Skeleton className="h-10 w-full" />

        {/* Packages list skeleton */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Subscription Packages</CardTitle>
            <CardDescription>Manage subscription plans</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 p-4 border rounded-lg">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                  <Package className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <Skeleton className="h-4 w-32 mb-1" />
                  <Skeleton className="h-3 w-48 mb-2" />
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-6 w-10 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Skeleton className="h-8 w-8 rounded" />
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
        <h1 className="text-2xl font-bold text-gray-900">Packages</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your subscription plans</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search packages..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Create New Package Button */}
      <Button
        onClick={onCreatePackage}
        className="w-full"
        size="lg"
      >
        <Plus className="h-4 w-4 mr-2" />
        Create New Package
      </Button>

      {/* Packages List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Subscription Packages ({filteredPackages.length})</CardTitle>
          <CardDescription>Tap on a package to manage it</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {filteredPackages.length > 0 ? (
            filteredPackages.map((pkg) => (
              <div key={pkg.id} className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Package className="h-5 w-5 text-primary" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-medium truncate">{pkg.name}</h3>
                    {!pkg.isActive && (
                      <Badge variant="secondary" className="text-xs">
                        Inactive
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate mb-2">
                    {pkg.description || 'No description'}
                  </p>
                  <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <CreditCard className="h-3 w-3" />
                      <span>{formatCurrency(pkg.price)}/mo</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span>Stores: {pkg.maxStores === -1 ? 'Unlimited' : pkg.maxStores}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span>Users: {pkg.maxUsers}</span>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-1 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewPackage?.(pkg.id)}
                    className="h-8 w-8 p-0"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditPackage?.(pkg.id)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeletePackage(pkg.id)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No packages found</h3>
              <p className="text-sm mb-4">
                {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating your first subscription package.'}
              </p>
              <Button onClick={onCreatePackage}>
                <Plus className="h-4 w-4 mr-2" />
                Create New Package
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
