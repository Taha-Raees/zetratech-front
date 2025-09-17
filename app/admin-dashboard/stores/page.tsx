'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Device detection and mobile components
import { useDeviceAdaptive } from '@/hooks/use-device-adaptive';
import { useAuth } from '@/contexts/AuthContext';
import { MobileStoresManager } from '@/components/stores/MobileStoresManager';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Building, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Eye,
  CreditCard
} from 'lucide-react';
import { AdminBreadcrumbs } from '@/components/layout/AdminBreadcrumbs';
import { useToast } from '@/hooks/use-toast';
import { adminApi } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';

import { Store, SubscriptionPackage } from '@/lib/types';
import { StoreSubscriptionManager } from '@/components/admin/StoreSubscriptionManager';


export default function AdminStoresPage() {
  const { toast } = useToast();
  const { shouldUseMobileView } = useDeviceAdaptive();

  // Orientation-aware adaptive rendering:
  // - Mobile & portrait tablet: Mobile experience
  // - Landscape tablet & desktop: Desktop experience
  // Note: Layout is handled by admin dashboard layout.tsx, no wrapper needed here
  if (shouldUseMobileView) {
    return (
      <MobileStoresManager
        initialView="list"
        onStoreSelected={(storeId) => {
          console.log('Store selected:', storeId);
          // For now, could implement document.location.href if needed
          // window.location.href = `/admin-dashboard/stores/${storeId}`;
        }}
        onEditStore={(storeId) => {
          console.log('Edit store:', storeId);
          // For now, could implement document.location.href if needed
          // window.location.href = `/admin-dashboard/stores/${storeId}/edit`;
        }}
      />
    );
  }

  // Desktop behavior - existing implementation with dialog-based modals
  return <DesktopStoresPage />;
}

// Original desktop implementation as separate component
function DesktopStoresPage() {
  const { toast } = useToast();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubscriptionDialogOpen, setIsSubscriptionDialogOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [managingStore, setManagingStore] = useState<Store | null>(null);
  const [activeTab, setActiveTab] = useState<'stores' | 'create'>('stores');

  // Fetch stores from API
  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      setLoading(true);
      setError('');
      // Call the real API endpoint
      const result = await adminApi.getStores();
      
      if (result.success && result.data) {
        setStores(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch stores');
      }
    } catch (error: any) {
      console.error('Error fetching stores:', error);
      setError(error.message || 'Failed to fetch stores');
      setStores([]);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch stores",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditStore = (store: Store) => {
    setEditingStore(store);
    setIsDialogOpen(true);
  };

  const handleDeleteStore = async (id: string) => {
    if (!confirm('Are you sure you want to delete this store? This action cannot be undone.')) {
      return;
    }

    try {
      // Call the real API endpoint
      const result = await adminApi.deleteStore(id);
      
      if (result.success) {
        toast({
          title: "Store Deleted",
          description: "Store has been deleted successfully.",
        });
        
        // Refresh stores
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

  const filteredStores = stores.filter(store => {
    const matchesSearch = store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (store.owner?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
                         (store.owner?.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
                         (store.createdByAdmin?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
                         (store.createdByAdmin?.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    return matchesSearch;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getBusinessTypeBadge = (type: string) => {
    switch (type) {
      case 'GROCERY': return 'default';
      case 'ELECTRONICS': return 'secondary';
      case 'CLOTHING': return 'outline';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <AdminBreadcrumbs />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Store Management</h1>
            <p className="text-gray-600 mt-2">Manage customer stores and subscriptions</p>
          </div>
          <Button disabled>
            <Plus className="h-4 w-4 mr-2" />
            Create New Store
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 border-b">
          <Button variant="default" className="flex items-center space-x-2" disabled>
            <Building className="h-4 w-4" />
            <span>Stores Overview</span>
          </Button>
          <Button variant="ghost" className="flex items-center space-x-2" disabled>
            <Plus className="h-4 w-4" />
            <span>Create New</span>
          </Button>
        </div>

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle>Search Stores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Skeleton className="h-10 w-full pl-10" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stores Table */}
        <Card>
          <CardHeader>
            <CardTitle>Stores (<Skeleton className="h-4 w-8 inline-block" />)</CardTitle>
            <CardDescription>View and manage customer stores</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead><Skeleton className="h-4 w-20" /></TableHead>
                    <TableHead><Skeleton className="h-4 w-20" /></TableHead>
                    <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                    <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                    <TableHead><Skeleton className="h-4 w-20" /></TableHead>
                    <TableHead><Skeleton className="h-4 w-20" /></TableHead>
                    <TableHead className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            <Skeleton className="h-4 w-32" />
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            <Skeleton className="h-3 w-24" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            <Skeleton className="h-4 w-24" />
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            <Skeleton className="h-3 w-32" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-20 rounded-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-16 rounded-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            <Skeleton className="h-4 w-24" />
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            <Skeleton className="h-3 w-32" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="outline" size="sm" disabled>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" disabled>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" disabled>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminBreadcrumbs />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Store Management</h1>
          <p className="text-gray-600 mt-2">Manage customer stores and subscriptions</p>
        </div>
        <Button onClick={() => {
          setEditingStore(null);
          setIsDialogOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Create New Store
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 border-b">
        <Button
          variant={activeTab === 'stores' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('stores')}
          className="flex items-center space-x-2"
        >
          <Building className="h-4 w-4" />
          <span>Stores Overview</span>
        </Button>
        <Button
          variant={activeTab === 'create' ? 'default' : 'ghost'}
          onClick={() => {
            setEditingStore(null);
            setIsDialogOpen(true);
          }}
          className="flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Create New</span>
        </Button>
      </div>

      {activeTab === 'stores' && (
        <>
          {/* Search */}
          <Card>
            <CardHeader>
              <CardTitle>Search Stores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search stores, owners, creators, or emails..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stores Table */}
          <Card>
            <CardHeader>
              <CardTitle>Stores ({filteredStores.length})</CardTitle>
              <CardDescription>View and manage customer stores</CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {filteredStores.length === 0 ? (
                <div className="text-center py-8">
                  <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No stores found</h3>
                  <p className="text-gray-600">Get started by creating a new store.</p>
                  <Button 
                    className="mt-4" 
                    onClick={() => {
                      setEditingStore(null);
                      setIsDialogOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Store
                  </Button>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Store Name</TableHead>
                        <TableHead>Owner</TableHead>
                        <TableHead>Business Type</TableHead>
                        <TableHead>Subscription</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Created By</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStores.map((store) => {
                        return (
                          <TableRow key={store.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{store.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {store.email || 'No email'}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{store.owner?.name || 'No owner'}</div>
                                <div className="text-sm text-muted-foreground">
                                  {store.owner?.email || 'No email'}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={getBusinessTypeBadge(store.businessType)}>
                                {store.businessType}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={store.subscriptionStatus === 'active' ? 'default' : 'secondary'}
                              >
                                {store.subscriptionStatus}
                              </Badge>
                            </TableCell>
                            <TableCell>{formatDate(store.createdAt)}</TableCell>
                            <TableCell>
                              {store.createdByAdmin ? (
                                <div>
                                  <div className="font-medium">{store.createdByAdmin.name}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {store.createdByAdmin.email}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-muted-foreground">Unknown</div>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditStore(store)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setManagingStore(store);
                                    setIsSubscriptionDialogOpen(true);
                                  }}
                                >
                                  <CreditCard className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteStore(store.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Create/Edit Store Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) {
          setActiveTab('stores');
          setEditingStore(null);
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingStore ? 'Edit Store' : 'Create New Store'}
            </DialogTitle>
            <DialogDescription>
              {editingStore ? 'Update store information' : 'Fill in the details to create a new store'}
            </DialogDescription>
          </DialogHeader>
          <StoreForm 
            store={editingStore} 
            onSuccess={() => {
              setIsDialogOpen(false);
              setActiveTab('stores');
              fetchStores();
            }} 
          />
        </DialogContent>
      </Dialog>

      {/* Subscription Management Dialog */}
      <Dialog open={isSubscriptionDialogOpen} onOpenChange={(open) => {
        setIsSubscriptionDialogOpen(open);
        if (!open) {
          setManagingStore(null);
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Manage Subscription
            </DialogTitle>
            <DialogDescription>
              Assign subscription package and manage store status
            </DialogDescription>
          </DialogHeader>
          {managingStore && (
            <StoreSubscriptionManager 
              store={managingStore} 
              onSubscriptionUpdate={(updatedStore) => {
                // Update the store in the local state
                setStores(prev => prev.map(store => 
                  store.id === updatedStore.id ? updatedStore : store
                ));
                // Also update managingStore if it's the same store
                if (managingStore.id === updatedStore.id) {
                  setManagingStore(updatedStore);
                }
                // Close the dialog
                setIsSubscriptionDialogOpen(false);
                setManagingStore(null);
              }} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Store Form Component
function StoreForm({ store, onSuccess }: { store: Store | null; onSuccess: () => void }) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    storeName: store?.name || '',
    businessType: store?.businessType || 'GENERAL',
    ownerName: store?.owner?.name || '',
    ownerEmail: store?.owner?.email || '',
    ownerPhone: '',
    password: '',
    street: store?.street || '',
    city: store?.city || '',
    state: store?.state || '',
    postalCode: store?.postalCode || '',
    country: store?.country || 'Pakistan',
    phone: store?.phone || '',
    email: store?.email || '',
    website: store?.website || '',
    currency: 'PKR',
    taxRate: '0'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (store) {
        // Update existing store
        const result = await adminApi.updateStore(store.id, {
          name: formData.storeName,
          businessType: formData.businessType,
          street: formData.street,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country,
          phone: formData.phone,
          email: formData.email,
          website: formData.website
        });
        
        if (result.success) {
          toast({
            title: "Store Updated",
            description: "Store information has been updated successfully.",
          });
        } else {
          throw new Error(result.error || 'Failed to update store');
        }
      } else {
        // Create new store
        const result = await adminApi.createStore({
          storeName: formData.storeName,
          businessType: formData.businessType,
          ownerName: formData.ownerName,
          ownerEmail: formData.ownerEmail,
          ownerPhone: formData.ownerPhone,
          password: formData.password,
          street: formData.street,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country,
          phone: formData.phone,
          email: formData.email,
          website: formData.website,
          currency: formData.currency,
          taxRate: parseFloat(formData.taxRate) || 0
        });
        
        if (result.success) {
          toast({
            title: "Store Created",
            description: "New store has been created successfully.",
          });
        } else {
          throw new Error(result.error || 'Failed to create store');
        }
      }
      
      onSuccess();
    } catch (error: any) {
      setError(error.message || 'Error saving store information');
      toast({
        title: "Error",
        description: error.message || "Failed to save store information.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Store Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Store Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="storeName">Store Name *</Label>
            <Input
              id="storeName"
              name="storeName"
              value={formData.storeName}
              onChange={handleInputChange}
              placeholder="e.g., Ahmed General Store"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="businessType">Business Type *</Label>
            <Select onValueChange={(value) => handleSelectChange('businessType', value)} value={formData.businessType}>
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
        </div>
      </div>

      {/* Owner Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Owner Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="ownerName">Owner Name *</Label>
            <Input
              id="ownerName"
              name="ownerName"
              value={formData.ownerName}
              onChange={handleInputChange}
              placeholder="e.g., Ahmed Ali"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ownerEmail">Owner Email *</Label>
            <Input
              id="ownerEmail"
              name="ownerEmail"
              type="email"
              value={formData.ownerEmail}
              onChange={handleInputChange}
              placeholder="e.g., ahmed@store.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ownerPhone">Owner Phone</Label>
            <Input
              id="ownerPhone"
              name="ownerPhone"
              value={formData.ownerPhone}
              onChange={handleInputChange}
              placeholder="e.g., +92-300-1234567"
            />
          </div>
          {!store && (
            <div className="space-y-2">
              <Label htmlFor="password">Login Password *</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Store login password"
                required
              />
            </div>
          )}
        </div>
      </div>

      {/* Address Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Address Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="street">Street Address</Label>
            <Input
              id="street"
              name="street"
              value={formData.street}
              onChange={handleInputChange}
              placeholder="e.g., 123 Main Street"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              placeholder="e.g., Karachi"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">State/Province</Label>
            <Input
              id="state"
              name="state"
              value={formData.state}
              onChange={handleInputChange}
              placeholder="e.g., Sindh"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="postalCode">Postal Code</Label>
            <Input
              id="postalCode"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleInputChange}
              placeholder="e.g., 74000"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              placeholder="Pakistan"
            />
          </div>
        </div>
      </div>

      {/* Contact & Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Contact & Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Store Phone</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Store contact number"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Store Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Store contact email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Website (Optional)</Label>
            <Input
              id="website"
              name="website"
              value={formData.website}
              onChange={handleInputChange}
              placeholder="www.example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Input
              id="currency"
              name="currency"
              value={formData.currency}
              onChange={handleInputChange}
              placeholder="e.g., PKR"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="taxRate">Tax Rate (%)</Label>
            <Input
              id="taxRate"
              name="taxRate"
              type="number"
              value={formData.taxRate}
              onChange={handleInputChange}
              placeholder="e.g., 17"
            />
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : store ? 'Update Store' : 'Create Store'}
        </Button>
      </div>
    </form>
  );
}
