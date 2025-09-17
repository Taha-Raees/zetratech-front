'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useDeviceAdaptive } from '@/hooks/use-device-adaptive';
import { AdaptiveBottomNav } from './AdaptiveBottomNav';
import { MobileHeader } from '../mobile/MobileHeader';
import { AdminHeader } from './AdminHeader';
import { AppSidebar } from './AppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';

interface AdaptiveLayoutProps {
  children: React.ReactNode;
  title?: string;
  showBackButton?: boolean;
  mobileTitle?: string;
  desktopTitle?: string;
  className?: string;
}

// Get title from path for dashboard sections
function getTitleFromPath(pathname: string): string {
  if (pathname.includes('/stores')) return 'Store Management';
  if (pathname.includes('/packages')) return 'Subscription Packages';
  if (pathname.includes('/users')) return 'User Management';
  if (pathname.includes('/analytics')) return 'Analytics';
  if (pathname.includes('/settings')) return 'System Settings';
  if (pathname.includes('/dashboard')) return 'Admin Dashboard';
  return 'ZetraTech Admin';
}

export function AdaptiveLayout({
  children,
  title,
  showBackButton = false,
  mobileTitle,
  desktopTitle,
  className = ''
}: AdaptiveLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isMobile } = useDeviceAdaptive();
  const { toast } = useToast();
  const { state, logout } = useAuth();

  // Extract admin user data
  const adminUser = state.user ? {
    email: state.user.email,
    role: state.user.role
  } : null;

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

  // Determine titles
  const determinedTitle = title || getTitleFromPath(pathname);
  const currentMobileTitle = mobileTitle || determinedTitle;
  const currentDesktopTitle = desktopTitle || determinedTitle;

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Mobile Header */}
        <MobileHeader
          title={currentMobileTitle}
          showBackButton={showBackButton}
        />

        {/* Main Content - with bottom nav padding */}
        <main className={cn("flex-1 overflow-auto pb-20", className)}>
          {children}
        </main>

        {/* Adaptive Bottom Navigation */}
        <AdaptiveBottomNav />

        {/* Toast notifications */}
        <Toaster />
      </div>
    );
  }

  // Desktop/Table Layout - Use desktop header and sidebar
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full flex-col">
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <AppSidebar isAdmin={true} />

          {/* Main content area */}
          <div className="flex-1 flex flex-col">
            {/* Top header */}
            <AdminHeader adminUser={adminUser} onLogout={handleLogout} />

            {/* Content area */}
            <main className={cn(
              "flex-1 overflow-auto bg-muted/10 p-6",
              className
            )}>
              {children}
            </main>
          </div>
        </div>
      </div>

      {/* Toast notifications */}
      <Toaster />
    </SidebarProvider>
  );
}

// Full-screen variant for forms (no bottom nav, no sidebar header)
export function AdaptiveFullScreenLayout({
  children,
  title,
  showBackButton = true,
  className = ''
}: AdaptiveLayoutProps) {
  const { isMobile } = useDeviceAdaptive();

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Mobile Header */}
        <MobileHeader
          title={title || 'Form'}
          showBackButton={showBackButton}
        />

        {/* Full screen content - no bottom nav padding */}
        <main className={cn("flex-1 overflow-auto", className)}>
          {children}
        </main>

        {/* Toast notifications */}
        <Toaster />
      </div>
    );
  }

  // Desktop full-screen - modal-like container but without sidebar
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Simple desktop header for full-screen views */}
      <header className="border-b bg-background px-6 py-4">
        <h1 className="text-2xl font-bold">{title}</h1>
        {showBackButton && (
          <button
            onClick={() => window.history.back()}
            className="mt-2 text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back
          </button>
        )}
      </header>

      <main className={cn("flex-1 overflow-auto p-6", className)}>
        {children}
      </main>

      <Toaster />
    </div>
  );
}

// Minimal variant for simple content without navigation
export function AdaptiveContentLayout({
  children,
  className = ''
}: { children: React.ReactNode; className?: string }) {
  const { isMobile } = useDeviceAdaptive();

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <main className={cn("flex-1 overflow-auto pb-20", className)}>
          {children}
        </main>
        <AdaptiveBottomNav />
        <Toaster />
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen bg-background", className)}>
      {children}
      <Toaster />
    </div>
  );
}
