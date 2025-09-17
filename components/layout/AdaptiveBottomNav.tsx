'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useDeviceAdaptive } from '@/hooks/use-device-adaptive';
import {
  Home,
  Building,
  CreditCard,
  BarChart3,
  Users,
  Settings
} from 'lucide-react';

interface NavItem {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  activePaths?: string[];
}

const adminNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    icon: Home,
    href: '/admin-dashboard',
    activePaths: ['/admin-dashboard/dashboard']
  },
  {
    title: 'Stores',
    icon: Building,
    href: '/admin-dashboard/stores',
    activePaths: ['/admin-dashboard/stores']
  },
  {
    title: 'Packages',
    icon: CreditCard,
    href: '/admin-dashboard/packages',
    activePaths: ['/admin-dashboard/packages']
  },
  {
    title: 'Analytics',
    icon: BarChart3,
    href: '/admin-dashboard/analytics',
    activePaths: ['/admin-dashboard/analytics']
  },
  {
    title: 'Users',
    icon: Users,
    href: '/admin-dashboard/users',
    activePaths: ['/admin-dashboard/users']
  }
];

interface AdaptiveBottomNavProps {
  className?: string;
  adminUser?: { email: string; role: string } | null;
}

export function AdaptiveBottomNav({ className, adminUser }: AdaptiveBottomNavProps) {
  const pathname = usePathname();
  const { isMobile, isTablet, isTouchDevice } = useDeviceAdaptive();

  // Filter navigation items based on user role
  const navItems = adminUser?.role === 'SUPERADMIN'
    ? adminNavItems
    : adminNavItems.filter(item => {
        // ADMIN users only see Stores
        return ['Stores'].includes(item.title);
      });

  // Only show on mobile and tablet in portrait mode with touch
  if (!isMobile && !isTouchDevice) {
    return null;
  }

  const isActive = (item: NavItem) => {
    // Check exact match
    if (pathname === item.href) return true;
    // Check active paths
    if (item.activePaths?.includes(pathname)) return true;
    // Check if current path starts with item href (for dynamic routes)
    if (pathname.startsWith(item.href) && item.href !== '/admin-dashboard') {
      return true;
    }
    return false;
  };

  // Adjust sizing based on device type
  const getIconSize = () => {
    if (isTablet) return 'h-6 w-6';
    return 'h-5 w-5';
  };

  const getTextSize = () => {
    if (isTablet) return 'text-sm';
    return 'text-xs';
  };

  const getContainerHeight = () => {
    if (isTablet) return 'h-20';
    return 'h-16';
  };

  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border",
      className
    )}>
      <div className={cn("grid grid-cols-5", getContainerHeight())}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center space-y-1 transition-colors duration-200",
                active
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Icon className={getIconSize()} />
              <span className={cn("font-medium leading-none", getTextSize())}>
                {item.title}
              </span>
              {/* Subtle indicator for active state */}
              {active && (
                <div className="absolute inset-x-1 bottom-0 h-1 bg-primary rounded-t" />
              )}
            </Link>
          );
        })}
      </div>

      {/* Development indicator */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute -top-6 left-2 text-xs bg-muted px-2 py-1 rounded text-muted-foreground">
          {isMobile ? '📱 Mobile' : isTablet ? '📱 Tablet' : '🖥️ Desktop'}
        </div>
      )}
    </div>
  );
}

// Legacy component for backward compatibility
export function MobileBottomNav() {
  return <AdaptiveBottomNav />;
}
