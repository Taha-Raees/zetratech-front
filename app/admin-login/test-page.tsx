'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Shield, Lock, Mail } from 'lucide-react';

export default function AdminLoginTestPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [testResults, setTestResults] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'}/auth/admin-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        // Redirect to admin dashboard
        router.push('/admin-dashboard');
        router.refresh();
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (error: any) {
      console.error('Admin login error:', error);
      setError(error.message || 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  const testAuth = async () => {
    setIsTesting(true);
    try {
      // Test login endpoint
      const loginResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'}/auth/admin-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: 'admin@example.com',
          password: 'admin123'
        }),
      });

      const loginResult = await loginResponse.json();

      // Test verify endpoint
      const verifyResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'}/auth/admin-login/verify`, {
        method: 'GET',
        credentials: 'include',
      });

      const verifyResult = await verifyResponse.json();

      // Test refresh endpoint
      const refreshResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'}/auth/admin-login/refresh`, {
        method: 'POST',
        credentials: 'include',
      });

      const refreshResult = await refreshResponse.json();

      // Test logout endpoint
      const logoutResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'}/auth/admin-login/logout`, {
        method: 'POST',
        credentials: 'include',
      });

      const logoutResult = await logoutResponse.json();

      setTestResults({
        login: {
          status: loginResponse.status,
          success: loginResult.success,
          message: loginResult.message || loginResult.error
        },
        verify: {
          status: verifyResponse.status,
          success: verifyResult.success,
          message: verifyResult.message || verifyResult.error
        },
        refresh: {
          status: refreshResponse.status,
          success: refreshResult.success,
          message: refreshResult.message || refreshResult.error
        },
        logout: {
          status: logoutResponse.status,
          success: logoutResult.success,
          message: logoutResult.message || logoutResult.error
        }
      });
    } catch (error: any) {
      console.error('Test error:', error);
      setError('Failed to run tests: ' + error.message);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="w-full max-w-4xl space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-slate-800 flex items-center justify-center">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Login Test</h1>
          <p className="text-gray-600 mt-2">Test the admin authentication system</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Login Form */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Admin Login</CardTitle>
              <CardDescription>
                Enter your admin credentials to test login
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4" noValidate>
                <div className="space-y-2">
                  <Label htmlFor="email">Admin Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter admin email"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter password"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full bg-slate-800 hover:bg-slate-900" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In as Admin'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Test Results */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Authentication Tests</CardTitle>
              <CardDescription>
                Run tests to verify the authentication system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button 
                  onClick={testAuth} 
                  className="w-full" 
                  disabled={isTesting}
                >
                  {isTesting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Running Tests...
                    </>
                  ) : (
                    'Run Authentication Tests'
                  )}
                </Button>

                {testResults && (
                  <div className="space-y-3">
                    <h3 className="font-medium">Test Results:</h3>
                    {Object.entries(testResults).map(([key, result]: [string, any]) => (
                      <div key={key} className="p-3 rounded-md border">
                        <div className="flex justify-between items-center">
                          <span className="font-medium capitalize">{key}</span>
                          <span className={`px-2 py-1 rounded text-xs ${
                            result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {result.status} {result.success ? '✓' : '✗'}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {result.message}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="text-sm text-muted-foreground">
                  <h4 className="font-medium mb-2">Test Information:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Tests all admin auth endpoints</li>
                    <li>Uses default test credentials</li>
                    <li>Verifies login, verify, refresh, and logout</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Button
            variant="link"
            onClick={() => router.push('/admin-login')}
            className="text-sm text-slate-600 hover:text-slate-800"
          >
            Back to Admin Login
          </Button>
        </div>
      </div>
    </div>
  );
}
