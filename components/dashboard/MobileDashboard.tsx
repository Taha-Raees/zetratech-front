'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Building,
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Store
} from 'lucide-react';
import { MetricCard } from '@/components/ui/metric-card';
import { useToast } from '@/hooks/use-toast';
import { adminApi } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';

export function MobileDashboard() {
  const { toast } = useToast();
  const [stats, setStats] = useState({
    totalStores: 0,
    totalActiveSubscriptions: 0,
    totalRevenue: 0,
    totalUsers: 0,
    recentStores: [] as any[]
  });

  const [loading, setLoading] = useState(true);

  // Fetch dashboard data from API
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch admin dashboard data
      const dashboardResult = await adminApi.getDashboardData();

      if (dashboardResult.success && dashboardResult.data) {
        const data = dashboardResult.data;
        setStats({
          totalStores: data.totalStores || 0,
          totalActiveSubscriptions: data.totalActiveSubscriptions || 0,
          totalRevenue: data.totalRevenue || 0,
          totalUsers: data.totalUsers || 0,
          recentStores: data.recentStores || []
        });
      }
    } catch (error: any) {
      console.error('❌ Mobile - Error fetching dashboard data:', error);
      console.error('❌ Mobile - Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });

      toast({
        title: "Database Connection Error",
        description: `Cannot load dashboard from database: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        {/* Key Metrics skeleton */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <MetricCard
              title=""
              value={<Skeleton className="h-6 w-8" />}
              icon={Building}
              description=""
            />
            <MetricCard
              title=""
              value={<Skeleton className="h-6 w-8" />}
              icon={Package}
              description=""
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <MetricCard
              title=""
              value={<Skeleton className="h-6 w-8" />}
              icon={Users}
              description=""
            />
            <MetricCard
              title=""
              value={<Skeleton className="h-6 w-8" />}
              icon={DollarSign}
              description=""
            />
          </div>
        </div>

        {/* Recent Stores skeleton */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Recent Stores</CardTitle>
            <CardDescription>Newly created stores</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 p-3 border rounded-lg">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                  <Store className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="font-medium">
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Badge variant="outline">
                  <Skeleton className="h-4 w-12" />
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* System Status skeleton */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">System Status</CardTitle>
            <CardDescription>Current system health</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-12 rounded-full ml-auto" />
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
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Welcome to your admin panel</p>
      </div>

      {/* Key Metrics - Mobile optimized grid */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <MetricCard
            title="Total Stores"
            value={stats.totalStores.toString()}
            icon={Building}
            description="Active stores"
          />
          <MetricCard
            title="Active Packages"
            value={stats.totalActiveSubscriptions.toString()}
            icon={Package}
            description="Paid subscriptions"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <MetricCard
            title="System Users"
            value={stats.totalUsers.toString()}
            icon={Users}
            description="Admin users"
          />
          <MetricCard
            title="Monthly Revenue"
            value={formatCurrency(stats.totalRevenue)}
            icon={DollarSign}
            description="This month"
          />
        </div>
      </div>

      {/* Recent Stores - Mobile Friendly List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Recent Stores</CardTitle>
          <CardDescription>Newly created stores</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {stats.recentStores.length > 0 ? (
            stats.recentStores.slice(0, 3).map((store: any) => (
              <div key={store.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Store className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{store.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {store.owner?.name || 'No owner'} • {new Date(store.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <Badge variant={store.subscriptionStatus === 'active' ? 'default' : 'secondary'}>
                  {store.subscriptionStatus}
                </Badge>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Store className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No recent stores</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* System Status - Mobile Friendly */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">System Status</CardTitle>
          <CardDescription>Current system health</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
            <span className="text-sm">Database</span>
            <Badge variant="secondary" className="ml-auto">
              Online
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
            <span className="text-sm">API Server</span>
            <Badge variant="secondary" className="ml-auto">
              Online
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-yellow-500 flex-shrink-0" />
            <span className="text-sm">Backup</span>
            <Badge variant="outline" className="ml-auto">
              Pending
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
