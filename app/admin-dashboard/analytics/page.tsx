'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  Building, 
  Users, 
  Package, 
  DollarSign, 
  Calendar,
  Filter,
  CreditCard,
  Activity,
  Store
} from 'lucide-react';
import { MetricCard } from '@/components/ui/metric-card';
import { AdminBreadcrumbs } from '@/components/layout/AdminBreadcrumbs';


interface AnalyticsData {
  totalStores: number;
  totalActiveSubscriptions: number;
  totalRevenue: number;
  monthlyRevenue: {
    month: string;
    revenue: number;
    newStores: number;
    renewals: number;
  }[];
  packageDistribution: {
    package: string;
    count: number;
    revenue: number;
  }[];
  topStores: {
    name: string;
    revenue: number;
    locations: number;
    package: string;
  }[];
  subscriptionTrends: {
    date: string;
    active: number;
    expiring: number;
    expired: number;
  }[];
}

export default function RevenueAnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedPackage, setSelectedPackage] = useState('all');

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

  // Fetch analytics data from API
  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange, selectedPackage]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch analytics data from the new endpoint
      const analyticsResponse = await fetch(`${API_BASE_URL}/admin/analytics/dashboard`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (analyticsResponse.ok) {
        const result = await analyticsResponse.json();
        const data = result.data;
        
        setAnalyticsData({
          totalStores: data.totalStores,
          totalActiveSubscriptions: data.totalActiveSubscriptions,
          totalRevenue: data.totalRevenue,
          monthlyRevenue: data.monthlyRevenue,
          packageDistribution: data.subscriptionDistribution,
          topStores: data.topStores,
          subscriptionTrends: data.subscriptionTrends
        });
      } else {
        throw new Error('Failed to fetch analytics data');
      }
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError('Failed to load analytics data');
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

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];


  if (error) {
    return (
      <div className="space-y-6">
        <AdminBreadcrumbs />
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (loading || !analyticsData) {
    return (
      <div className="space-y-6">
        <AdminBreadcrumbs />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Revenue Analytics</h1>
            <p className="text-gray-600 mt-2">System-wide performance metrics and subscription insights</p>
          </div>
          <div className="flex gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedPackage} onValueChange={setSelectedPackage}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All packages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All packages</SelectItem>
                <SelectItem value="Basic">Basic</SelectItem>
                <SelectItem value="Premium">Premium</SelectItem>
                <SelectItem value="Enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Key Revenue Metrics skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Stores"
            value={<div className="h-6 bg-muted rounded w-24 mb-1 animate-pulse"></div>}
            icon={Building}
            description="Active customer accounts"
          />
          <MetricCard
            title="Active Subscriptions"
            value={<div className="h-6 bg-muted rounded w-24 mb-1 animate-pulse"></div>}
            icon={CreditCard}
            description="Paying customers"
          />
          <MetricCard
            title="Store Locations"
            value={<div className="h-6 bg-muted rounded w-24 mb-1 animate-pulse"></div>}
            icon={Store}
            description="Store locations"
          />
          <MetricCard
            title="Total Revenue"
            value={<div className="h-6 bg-muted rounded w-24 mb-1 animate-pulse"></div>}
            icon={DollarSign}
            description="Monthly recurring revenue"
          />
        </div>

        {/* Charts skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="h-6 bg-muted rounded w-48 mb-2 animate-pulse"></div>
              <div className="h-4 bg-muted rounded w-64 animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-80 bg-muted rounded w-full animate-pulse"></div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div className="h-6 bg-muted rounded w-48 mb-2 animate-pulse"></div>
              <div className="h-4 bg-muted rounded w-64 animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-80 bg-muted rounded w-full animate-pulse"></div>
            </CardContent>
          </Card>
        </div>

        {/* Additional charts skeleton */}
        <Card>
          <CardHeader>
            <div className="h-6 bg-muted rounded w-48 mb-2 animate-pulse"></div>
            <div className="h-4 bg-muted rounded w-64 animate-pulse"></div>
          </CardHeader>
          <CardContent>
            <div className="h-80 bg-muted rounded w-full animate-pulse"></div>
          </CardContent>
        </Card>

        {/* Table skeleton */}
        <Card>
          <CardHeader>
            <div className="h-6 bg-muted rounded w-48 mb-2 animate-pulse"></div>
            <div className="h-4 bg-muted rounded w-64 animate-pulse"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-muted rounded animate-pulse"></div>
              ))}
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
          <h1 className="text-3xl font-bold text-gray-900">Revenue Analytics</h1>
          <p className="text-gray-600 mt-2">System-wide performance metrics and subscription insights</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedPackage} onValueChange={setSelectedPackage}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="All packages" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All packages</SelectItem>
              <SelectItem value="Basic">Basic</SelectItem>
              <SelectItem value="Premium">Premium</SelectItem>
              <SelectItem value="Enterprise">Enterprise</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Revenue Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Stores"
          value={analyticsData.totalStores.toString()}
          icon={Building}
          description="Active customer accounts"
        />
        <MetricCard
          title="Active Subscriptions"
          value={analyticsData.totalActiveSubscriptions.toString()}
          icon={CreditCard}
          description="Paying customers"
        />
        <MetricCard
          title="Store Locations"
          value={analyticsData.totalStores.toString()}
          icon={Store}
          description="Store locations"
        />
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(analyticsData.totalRevenue)}
          icon={DollarSign}
          description="Monthly recurring revenue"
        />
      </div>

      {/* Revenue Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trends</CardTitle>
          <CardDescription>Monthly revenue, new stores, and renewals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsData.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" tickFormatter={(value) => formatCurrency(value)} />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === 'revenue') {
                      return [formatCurrency(Number(value)), 'Revenue'];
                    }
                    return [value, name === 'newStores' ? 'New Stores' : 'Renewals'];
                  }}
                />
                <Legend />
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#0088FE" 
                  fill="#0088FE" 
                  fillOpacity={0.2}
                  name="Revenue" 
                  strokeWidth={2}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="newStores" 
                  stroke="#00C49F" 
                  name="New Stores" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="renewals" 
                  stroke="#FF8042" 
                  name="Renewals" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subscription Package Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Package Distribution</CardTitle>
            <CardDescription>Revenue by subscription packages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analyticsData.packageDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ package: pkg, percent }) => `${pkg}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="revenue"
                    nameKey="package"
                  >
                    {analyticsData.packageDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Performing Stores */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Stores</CardTitle>
            <CardDescription>Highest revenue generating customers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData.topStores}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip 
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                  <Legend />
                  <Bar dataKey="revenue" fill="#8884d8" name="Revenue">
                    {analyticsData.topStores.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Status Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription Status Trends</CardTitle>
          <CardDescription>Active, expiring, and expired subscriptions over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analyticsData.subscriptionTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="active" 
                  stroke="#00C49F" 
                  name="Active" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="expiring" 
                  stroke="#FFBB28" 
                  name="Expiring" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="expired" 
                  stroke="#FF8042" 
                  name="Expired" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Package Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Package Performance</CardTitle>
          <CardDescription>Detailed metrics by subscription tier</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">Package</th>
                  <th className="text-right p-4">Stores</th>
                  <th className="text-right p-4">Revenue</th>
                  <th className="text-right p-4">Avg Revenue/Store</th>
                  <th className="text-right p-4">Locations</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.packageDistribution.map((pkg, index) => {
                  const store = analyticsData.packageDistribution.find(p => p.package === pkg.package);
                  const totalLocations = analyticsData.topStores
                    .filter(t => t.package === pkg.package)
                    .reduce((sum, t) => sum + t.locations, 0);
                  
                  return (
                    <tr key={index} className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <div className="font-medium">{pkg.package}</div>
                      </td>
                      <td className="p-4 text-right">{pkg.count}</td>
                      <td className="p-4 text-right font-medium">{formatCurrency(pkg.revenue)}</td>
                      <td className="p-4 text-right">
                        {formatCurrency(pkg.revenue / pkg.count)}
                      </td>
                      <td className="p-4 text-right">{totalLocations}</td>
                    </tr>
                  );
                })}
                <tr className="font-semibold">
                  <td className="p-4">Total</td>
                  <td className="p-4 text-right">
                    {analyticsData.packageDistribution.reduce((sum, pkg) => sum + pkg.count, 0)}
                  </td>
                  <td className="p-4 text-right">
                    {formatCurrency(analyticsData.packageDistribution.reduce((sum, pkg) => sum + pkg.revenue, 0))}
                  </td>
                  <td className="p-4 text-right">
                    {formatCurrency(analyticsData.packageDistribution.reduce((sum, pkg) => sum + pkg.revenue, 0) / 
                    analyticsData.packageDistribution.reduce((sum, pkg) => sum + pkg.count, 0))}
                  </td>
                  <td className="p-4 text-right">
                    {analyticsData.topStores.reduce((sum, store) => sum + store.locations, 0)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
