'use client';

import React from 'react';
import { MobileHeader } from '../mobile/MobileHeader';
import { AdaptiveBottomNav } from '../layout/AdaptiveBottomNav';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { useDeviceAdaptive } from '@/hooks/use-device-adaptive';

interface MobileLayoutProps {
  children: React.ReactNode;
  title: string;
  showBackButton?: boolean;
  className?: string;
  headerClassName?: string;
  adminUser?: { email: string; role: string } | null;
}

export function MobileLayout({
  children,
  title,
  showBackButton = false,
  className,
  headerClassName,
  adminUser
}: MobileLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Mobile Header - fixed at top */}
      <MobileHeader
        title={title}
        showBackButton={showBackButton}
        className={headerClassName}
      />

      {/* Main Content - scrollable with bottom nav padding */}
      <main className={cn(
        "flex-1 overflow-auto pb-20 bg-background",
        className
      )}>
        {children}
      </main>

      {/* Mobile Bottom Navigation - fixed at bottom */}
      <AdaptiveBottomNav adminUser={adminUser} />

      {/* Toast notifications */}
      <Toaster />
    </div>
  );
}

// Alternative layout for full-screen content (without bottom nav)
export function MobileFullScreenLayout({
  children,
  title,
  showBackButton = false,
  className,
  headerClassName,
  adminUser
}: MobileLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Mobile Header - fixed at top */}
      <MobileHeader
        title={title}
        showBackButton={showBackButton}
        className={headerClassName}
      />

      {/* Full screen content - no bottom padding needed */}
      <main className={cn(
        "flex-1 overflow-auto bg-background",
        className
      )}>
        {children}
      </main>

      {/* Toast notifications */}
      <Toaster />
    </div>
  );
}
