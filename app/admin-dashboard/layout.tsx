'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { AdminHeader } from '@/components/layout/AdminHeader';
import { MobileLayout } from '@/components/layouts/MobileLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useDeviceAdaptive, useIsMobile } from '@/hooks/use-device-adaptive';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { shouldUseMobileView, isPortrait, isLandscape, isTablet, isDesktop } = useDeviceAdaptive();
  const { toast } = useToast();
  const { state, logout } = useAuth();

  // Extract admin user data from auth context
  const adminUser = state.user ? {
    email: state.user.email,
    role: state.user.role
  } : null;

  // Route protection based on user role
  useEffect(() => {
    if (!state.isLoading && state.isAuthenticated && adminUser?.role === 'ADMIN') {
      // ADMIN users can only access Stores pages - redirect dashboard to stores
      if (pathname === '/admin-dashboard') {
        router.push('/admin-dashboard/stores');
        return;
      }
      const allowedPaths = ['/admin-dashboard/stores'];
      if (!allowedPaths.some(path => pathname === path || pathname.startsWith(`${path}/`))) {
        router.push('/admin-dashboard/stores');
      }
    }
  }, [state.isLoading, state.isAuthenticated, adminUser, pathname, router]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!state.isLoading && !state.isAuthenticated) {
      router.push('/admin-login');
    }
  }, [state.isLoading, state.isAuthenticated, router]);

  // Show loading state while auth context is initializing
  if (state.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, don't render anything (redirect will happen)
  if (!state.isAuthenticated) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Logout Error",
        description: "There was an error logging out.",
        variant: "destructive",
      });
    }
  };

  // Define current page title - always show ZetraTech Admin
  const getCurrentTitle = () => {
    return 'ZetraTech Admin';
  };

  // Orientation-aware adaptive layout:
  // - Portrait tablets: Mobile experience
  // - Landscape tablets: Desktop experience
  if (shouldUseMobileView) {
    return (
      <>
        <MobileLayout title={getCurrentTitle()} adminUser={adminUser}>
          {children}
        </MobileLayout>
        <Toaster />
      </>
    );
  }

  // Desktop layout
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full flex-col">
        <div className="flex flex-1 overflow-hidden">
          <AppSidebar isAdmin adminUser={adminUser} />
          <div className="flex-1 flex flex-col">
            <AdminHeader adminUser={adminUser} onLogout={handleLogout} />
            <main className="flex-1 overflow-auto p-6 bg-muted/10">
              {children}
            </main>
          </div>
        </div>
      </div>
      <Toaster />
    </SidebarProvider>
  );
}
