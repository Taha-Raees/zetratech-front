'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AdminBreadcrumbs } from '@/components/layout/AdminBreadcrumbs';
import { useToast } from '@/hooks/use-toast';
import { adminApi } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    systemName: 'Retail Management System',
    supportEmail: 'support@example.com',
    smtpHost: 'smtp.example.com',
    smtpPort: '587',
    smtpUser: 'noreply@example.com',
    smtpPassword: '',
    smtpSecure: true,
    backupFrequency: 'daily',
    retentionPeriod: '30',
    maintenanceMode: false
  });
  const [loading, setLoading] = useState(true);

  // Fetch current settings from API
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      // In a real implementation, this would call an API endpoint to get current settings
      // const result = await adminApi.getSettings();
      
      // For now, we'll just use the default values
      // In a real implementation, you would populate formData with the actual settings
      setLoading(false);
    } catch (error: any) {
      console.error('Error fetching settings:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch settings",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // In a real implementation, this would call an API endpoint
      // const result = await adminApi.updateSettings(formData);
      
      // For now, just simulate the update
      toast({
        title: "Success",
        description: "Settings updated successfully",
      });
    } catch (error: any) {
      console.error('Error updating settings:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update settings",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <AdminBreadcrumbs />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-600 mt-2">Configure global system settings</p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Basic system configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="systemName">System Name</Label>
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supportEmail">Support Email</Label>
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Email Configuration</CardTitle>
              <CardDescription>SMTP settings for system emails</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtpHost">SMTP Host</Label>
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPort">SMTP Port</Label>
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpUser">SMTP Username</Label>
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPassword">SMTP Password</Label>
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Skeleton className="h-4 w-4 rounded" />
                <Label htmlFor="smtpSecure">Use Secure Connection (TLS/SSL)</Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Backup & Maintenance</CardTitle>
              <CardDescription>System backup and maintenance settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="backupFrequency">Backup Frequency</Label>
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="retentionPeriod">Data Retention (days)</Label>
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Skeleton className="h-4 w-4 rounded" />
                <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminBreadcrumbs />
      <div>
        <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
        <p className="text-gray-600 mt-2">Configure global system settings</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Basic system configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="systemName">System Name</Label>
                <Input
                  id="systemName"
                  name="systemName"
                  value={formData.systemName}
                  onChange={handleInputChange}
                  placeholder="Enter system name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supportEmail">Support Email</Label>
                <Input
                  id="supportEmail"
                  name="supportEmail"
                  type="email"
                  value={formData.supportEmail}
                  onChange={handleInputChange}
                  placeholder="Enter support email"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Email Configuration</CardTitle>
            <CardDescription>SMTP settings for system emails</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="smtpHost">SMTP Host</Label>
                <Input
                  id="smtpHost"
                  name="smtpHost"
                  value={formData.smtpHost}
                  onChange={handleInputChange}
                  placeholder="Enter SMTP host"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtpPort">SMTP Port</Label>
                <Input
                  id="smtpPort"
                  name="smtpPort"
                  type="number"
                  value={formData.smtpPort}
                  onChange={handleInputChange}
                  placeholder="Enter SMTP port"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtpUser">SMTP Username</Label>
                <Input
                  id="smtpUser"
                  name="smtpUser"
                  value={formData.smtpUser}
                  onChange={handleInputChange}
                  placeholder="Enter SMTP username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtpPassword">SMTP Password</Label>
                <Input
                  id="smtpPassword"
                  name="smtpPassword"
                  type="password"
                  value={formData.smtpPassword}
                  onChange={handleInputChange}
                  placeholder="Enter SMTP password"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                id="smtpSecure"
                name="smtpSecure"
                type="checkbox"
                checked={formData.smtpSecure}
                onChange={handleInputChange}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="smtpSecure">Use Secure Connection (TLS/SSL)</Label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Backup & Maintenance</CardTitle>
            <CardDescription>System backup and maintenance settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="backupFrequency">Backup Frequency</Label>
                <select
                  id="backupFrequency"
                  name="backupFrequency"
                  value={formData.backupFrequency}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="retentionPeriod">Data Retention (days)</Label>
                <Input
                  id="retentionPeriod"
                  name="retentionPeriod"
                  type="number"
                  value={formData.retentionPeriod}
                  onChange={handleInputChange}
                  placeholder="Enter retention period"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                id="maintenanceMode"
                name="maintenanceMode"
                type="checkbox"
                checked={formData.maintenanceMode}
                onChange={handleInputChange}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit">Save Settings</Button>
        </div>
      </form>
    </div>
  );
}
