'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Building,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Building2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { adminApi } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Store } from '@/lib/types';

interface MobileStoresListProps {
  onViewStore?: (storeId: string) => void;
  onEditStore?: (storeId: string) => void;
  onCreateStore?: () => void;
}

export function MobileStoresList({
  onViewStore,
  onEditStore,
  onCreateStore
}: MobileStoresListProps) {
  const { toast } = useToast();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch stores from API
  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      console.log('🔄 Mobile - Attempting to fetch stores from API...');
      setLoading(true);

      const result = await adminApi.getStores();
      console.log('📡 Mobile API response:', result);

      if (result.success && result.data) {
        console.log('✅ Mobile - Stores fetched successfully:', result.data);
        setStores(result.data);
      } else {
        console.warn('⚠️ Mobile - API call successful but returned no data:', result);
        toast({
          title: "API Response Issue",
          description: result.error || "API returned success but no store data",
          variant: "destructive",
        });
        setStores([]);
      }
    } catch (error: any) {
      console.error('❌ Mobile - Error fetching stores:', error);
      console.error('❌ Mobile - Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });

      toast({
        title: "Database Connection Error",
        description: `Cannot connect to database: ${error.message}`,
        variant: "destructive",
      });

      setStores([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredStores = stores.filter(store => {
    const matchesSearch = store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (store.owner?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
                         (store.owner?.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    return matchesSearch;
  });

  const handleDeleteStore = async (id: string) => {
    if (!confirm('Are you sure you want to delete this store? This action cannot be undone.')) {
      return;
    }

    try {
      const result = await adminApi.deleteStore(id);

      if (result.success) {
        toast({
          title: "Store Deleted",
          description: "Store has been deleted successfully.",
        });
        fetchStores();
      } else {
        throw new Error(result.error || 'Failed to delete store');
      }
    } catch (error: any) {
      console.error('Error deleting store:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete store",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        {/* Welcome Header skeleton */}
        <div className="text-center py-2">
          <Skeleton className="h-8 w-24 mx-auto mb-2" />
          <Skeleton className="h-4 w-32 mx-auto" />
        </div>

        {/* Search skeleton */}
        <Skeleton className="h-10 w-full" />

        {/* Add store button skeleton */}
        <Skeleton className="h-10 w-full" />

        {/* Stores list skeleton */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Store List</CardTitle>
            <CardDescription>Tap on a store to manage it</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 p-3 border rounded-lg">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-3 w-32" />
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
        <h1 className="text-2xl font-bold text-gray-900">Store Management</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your customer stores</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search stores or owners..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Add New Store Button */}
      <Button
        onClick={onCreateStore}
        className="w-full"
        size="lg"
      >
        <Plus className="h-4 w-4 mr-2" />
        Create New Store
      </Button>

      {/* Stores List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Stores ({filteredStores.length})</CardTitle>
          <CardDescription>Tap on a store to manage it</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {filteredStores.length > 0 ? (
            filteredStores.map((store) => (
              <div key={store.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{store.name}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {store.owner?.name || 'No owner'} • {store.owner?.email || 'No email'}
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge
                      variant={store.businessType === 'GROCERY' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {store.businessType}
                    </Badge>
                    <Badge
                      variant={store.subscriptionStatus === 'active' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {store.subscriptionStatus}
                    </Badge>
                  </div>
                </div>

                <div className="flex space-x-1 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewStore?.(store.id)}
                    className="h-8 w-8 p-0"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditStore?.(store.id)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm" onClick={() => handleDeleteStore(store.id)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No stores found</h3>
              <p className="text-sm mb-4">
                {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating your first store.'}
              </p>
              <Button onClick={onCreateStore}>
                <Plus className="h-4 w-4 mr-2" />
                Create New Store
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
