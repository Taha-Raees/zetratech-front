'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Trash2, 
  Archive, 
  Clock, 
  Search,
  RefreshCw,
  HardDrive,
  Database,
  Undo,
  AlertTriangle
} from 'lucide-react';
import { AdminBreadcrumbs } from '@/components/layout/AdminBreadcrumbs';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { adminApi } from '@/lib/api';
import { RecycleBinItem } from '@/lib/types';

interface SoftDeletedItem {
  id: string;
  type: 'product' | 'order' | 'customer' | 'user';
  name: string;
  deletedAt: Date;
  deletedBy?: string;
  originalData: any;
  canRestore: boolean;
  restoreDependencies?: string[];
}

export default function RecycleBinPage() {
  const { toast } = useToast();
  const [items, setItems] = useState<SoftDeletedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);

  const loadDeletedItems = async () => {
    try {
      setLoading(true);
      // Call the real API endpoint
      const result = await adminApi.getDeletedItems();
      
      if (result.success && result.data) {
        // Transform the API data into the format expected by the UI
        const transformedItems: SoftDeletedItem[] = result.data.map((item: RecycleBinItem) => ({
          id: item.id,
          type: item.type as 'product' | 'order' | 'customer' | 'user',
          name: item.name,
          deletedAt: new Date(item.deletedAt),
          deletedBy: item.deletedBy || 'System',
          originalData: {},
          canRestore: true
        }));
        
        setItems(transformedItems);
      } else {
        throw new Error(result.error || 'Failed to fetch deleted items');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load deleted items",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const restoreItem = async (id: string) => {
    try {
      setProcessing(true);
      const item = items.find(i => i.id === id);
      if (!item) return;

      // Call the real API endpoint
      const result = await adminApi.restoreItem(item.type, id);
      
      if (result.success) {
        toast({
          title: "Success",
          description: `${item.type} "${item.name}" has been restored`,
        });
        
        // Remove from list
        setItems(items.filter(i => i.id !== id));
        setSelectedItems(selectedItems.filter(itemId => itemId !== id));
      } else {
        throw new Error(result.error || 'Failed to restore item');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to restore item",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const permanentlyDeleteItem = async (id: string) => {
    try {
      setProcessing(true);
      const item = items.find(i => i.id === id);
      if (!item) return;

      // Call the real API endpoint
      const result = await adminApi.permanentlyDeleteItem(item.type, id);
      
      if (result.success) {
        toast({
          title: "Success",
          description: `${item.type} "${item.name}" has been permanently deleted`,
        });
        
        // Remove from list
        setItems(items.filter(i => i.id !== id));
        setSelectedItems(selectedItems.filter(itemId => itemId !== id));
      } else {
        throw new Error(result.error || 'Failed to permanently delete item');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to permanently delete item",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const restoreSelectedItems = async () => {
    try {
      setProcessing(true);
      const selectedItemsData = items.filter(i => selectedItems.includes(i.id));
      
      // For now, we'll restore items one by one since the API doesn't support bulk restore
      const results = await Promise.all(
        selectedItemsData.map(item => adminApi.restoreItem(item.type, item.id))
      );
      
      const successfulRestores = results.filter(result => result.success).length;
      
      if (successfulRestores > 0) {
        toast({
          title: "Success",
          description: `${successfulRestores} items have been restored`,
        });
        
        // Remove from list
        setItems(items.filter(i => !selectedItems.includes(i.id)));
        setSelectedItems([]);
      } else {
        throw new Error('Failed to restore selected items');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to restore selected items",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const permanentlyDeleteSelectedItems = async () => {
    try {
      setProcessing(true);
      const selectedItemsData = items.filter(i => selectedItems.includes(i.id));
      
      // For now, we'll delete items one by one since the API doesn't support bulk permanent delete
      const results = await Promise.all(
        selectedItemsData.map(item => adminApi.permanentlyDeleteItem(item.type, item.id))
      );
      
      const successfulDeletes = results.filter(result => result.success).length;
      
      if (successfulDeletes > 0) {
        toast({
          title: "Success",
          description: `${successfulDeletes} items have been permanently deleted`,
        });
        
        // Remove from list
        setItems(items.filter(i => !selectedItems.includes(i.id)));
        setSelectedItems([]);
      } else {
        throw new Error('Failed to permanently delete selected items');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to permanently delete selected items",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'product':
        return <Database className="h-4 w-4" />;
      case 'order':
        return <Archive className="h-4 w-4" />;
      case 'customer':
        return <HardDrive className="h-4 w-4" />;
      case 'user':
        return <HardDrive className="h-4 w-4" />;
      default:
        return <Database className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'product':
        return 'bg-blue-100 text-blue-800';
      case 'order':
        return 'bg-green-100 text-green-800';
      case 'customer':
        return 'bg-purple-100 text-purple-800';
      case 'user':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const allSelected = selectedItems.length === filteredItems.length && filteredItems.length > 0;
  const someSelected = selectedItems.length > 0;

  const toggleAll = () => {
    if (allSelected) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredItems.map(item => item.id));
    }
  };

  const toggleItem = (id: string) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(itemId => itemId !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  useEffect(() => {
    loadDeletedItems();
  }, []);

  return (
    <div className="space-y-6">
      <AdminBreadcrumbs />
      <Card className="rounded-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Recycle Bin
          </CardTitle>
          <CardDescription>
            Manage soft deleted items and restore or permanently delete them
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex flex-col sm:flex-row gap-2 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search deleted items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={loadDeletedItems} disabled={loading} variant="outline">
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
            
            <div className="flex gap-2">
              {someSelected && (
                <>
                  <Button
                    variant="outline"
                    onClick={restoreSelectedItems}
                    disabled={processing}
                    className="flex items-center gap-2"
                  >
                    <Undo className="h-4 w-4" />
                    Restore ({selectedItems.length})
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={permanentlyDeleteSelectedItems}
                    disabled={processing}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Permanently
                  </Button>
                </>
              )}
            </div>
          </div>

          {loading ? (
            <div className="border rounded-md">
              <div className="bg-muted px-4 py-3 flex items-center gap-4 border-b">
                <div className="flex items-center">
                  <div className="h-4 w-4 bg-muted rounded animate-pulse"></div>
                </div>
                <div className="flex-1 grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground">
                  <div className="col-span-4 h-4 bg-muted rounded animate-pulse"></div>
                  <div className="col-span-2 h-4 bg-muted rounded animate-pulse"></div>
                  <div className="col-span-3 h-4 bg-muted rounded animate-pulse"></div>
                  <div className="col-span-3 h-4 bg-muted rounded animate-pulse"></div>
                </div>
                <div className="w-32 text-right text-sm font-medium text-muted-foreground h-4 bg-muted rounded animate-pulse"></div>
              </div>
              
              <div className="divide-y">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="px-4 py-3 flex items-center gap-4 hover:bg-muted/50">
                    <div className="flex items-center">
                      <div className="h-4 w-4 bg-muted rounded animate-pulse"></div>
                    </div>
                    <div className="flex-1 grid grid-cols-12 gap-4">
                      <div className="col-span-4">
                        <div className="h-4 bg-muted rounded w-32 mb-1 animate-pulse"></div>
                        <div className="h-3 bg-muted rounded w-24 animate-pulse"></div>
                      </div>
                      <div className="col-span-2">
                        <div className="h-6 bg-muted rounded w-16 animate-pulse"></div>
                      </div>
                      <div className="col-span-3">
                        <div className="h-4 bg-muted rounded w-20 animate-pulse"></div>
                      </div>
                      <div className="col-span-3">
                        <div className="h-4 bg-muted rounded w-24 animate-pulse"></div>
                      </div>
                    </div>
                    <div className="w-32 flex justify-end gap-1">
                      <div className="h-8 w-8 bg-muted rounded animate-pulse"></div>
                      <div className="h-8 w-8 bg-muted rounded animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="border rounded-md">
              <div className="bg-muted px-4 py-3 flex items-center gap-4 border-b">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                </div>
                <div className="flex-1 grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground">
                  <div className="col-span-4">Item</div>
                  <div className="col-span-2">Type</div>
                  <div className="col-span-3">Deleted By</div>
                  <div className="col-span-3">Deleted At</div>
                </div>
                <div className="w-32 text-right text-sm font-medium text-muted-foreground">
                  Actions
                </div>
              </div>
              
              {filteredItems.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Trash2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No deleted items found</p>
                  <p className="text-sm">Items moved to the recycle bin will appear here</p>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredItems.map((item) => (
                    <div key={item.id} className="px-4 py-3 flex items-center gap-4 hover:bg-muted/50">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={() => toggleItem(item.id)}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                      </div>
                      <div className="flex-1 grid grid-cols-12 gap-4">
                        <div className="col-span-4">
                          <div className="font-medium">{item.name}</div>
                          {item.originalData && (
                            <div className="text-sm text-muted-foreground">
                              {Object.entries(item.originalData).map(([key, value]) => (
                                <span key={key} className="inline-block mr-2">
                                  {key}: {String(value)}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="col-span-2">
                          <Badge className={`${getTypeColor(item.type)} flex items-center gap-1`}>
                            {getTypeIcon(item.type)}
                            {item.type}
                          </Badge>
                        </div>
                        <div className="col-span-3 text-sm">
                          {item.deletedBy || 'System'}
                        </div>
                        <div className="col-span-3 text-sm text-muted-foreground">
                          {format(item.deletedAt, 'MMM dd, yyyy HH:mm')}
                        </div>
                      </div>
                      <div className="w-32 flex justify-end gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => restoreItem(item.id)}
                          disabled={processing || !item.canRestore}
                          className="h-8 w-8 p-0"
                          title={item.canRestore ? "Restore" : "Cannot restore due to dependencies"}
                        >
                          {item.canRestore ? (
                            <Undo className="h-4 w-4" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => permanentlyDeleteItem(item.id)}
                          disabled={processing}
                          className="h-8 w-8 p-0"
                          title="Permanently Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {items.length > 0 && (
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-sm text-muted-foreground">
              <div>
                Showing {filteredItems.length} of {items.length} deleted items
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Items are automatically purged after 30 days
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
              <div className="flex items-center gap-2 font-medium text-blue-800">
                <Undo className="h-4 w-4" />
                Restore Items
              </div>
              <div className="text-blue-700 mt-1">
                Bring back deleted items to their original state
              </div>
            </div>
            
            <div className="p-3 bg-yellow-50 rounded-md border border-yellow-200">
              <div className="flex items-center gap-2 font-medium text-yellow-800">
                <AlertTriangle className="h-4 w-4" />
                Dependencies
              </div>
              <div className="text-yellow-700 mt-1">
                Some items cannot be restored due to missing dependencies
              </div>
            </div>
            
            <div className="p-3 bg-red-50 rounded-md border border-red-200">
              <div className="flex items-center gap-2 font-medium text-red-800">
                <Trash2 className="h-4 w-4" />
                Permanent Deletion
              </div>
              <div className="text-red-700 mt-1">
                Permanently deleted items cannot be recovered
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
