'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useTablet } from '@/hooks/use-tablet';
import {
  Home,
  Building,
  CreditCard,
  BarChart3,
  Users,
  Settings
} from 'lucide-react';

interface MobileNavItem {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  activePaths?: string[];
}

const mobileNavItems: MobileNavItem[] = [
  {
    title: 'Dashboard',
    icon: Home,
    href: '/admin-dashboard',
  },
  {
    title: 'Stores',
    icon: Building,
    href: '/admin-dashboard/stores',
  },
  {
    title: 'Packages',
    icon: CreditCard,
    href: '/admin-dashboard/packages',
  },
  {
    title: 'Analytics',
    icon: BarChart3,
    href: '/admin-dashboard/analytics',
  },
  {
    title: 'Users',
    icon: Users,
    href: '/admin-dashboard/users',
  }
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const { isTablet, isLandscape, isMobileDevice } = useTablet();

  const isActive = (item: MobileNavItem) => {
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

  // Adjust sizing and spacing based on device type
  const getContainerClasses = () => {
    if (isTablet && !isLandscape) {
      // Tablets in portrait - slightly larger touch targets
      return "h-20";
    } else if (isMobileDevice) {
      // Phones - standard mobile size
      return "h-16";
    }
    return "h-18"; // Default tablet landscape size
  };

  const getIconSize = () => {
    if (isTablet && !isLandscape) {
      return "h-6 w-6";
    }
    return "h-5 w-5";
  };

  const getTextSize = () => {
    if (isTablet && !isLandscape) {
      return "text-sm";
    }
    return "text-xs";
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border">
      <div className={cn("grid grid-cols-5", getContainerClasses())}>
        {mobileNavItems.map((item, index) => {
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
              {/* Optional: Add subtle visual feedback for tablets */}
              {isTablet && active && (
                <div className="absolute inset-x-1 bottom-0 h-1 bg-primary rounded-t" />
              )}
            </Link>
          );
        })}
      </div>

      {/* Optional: Device indicator for development/debugging */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs bg-muted px-2 py-1 rounded text-muted-foreground">
          {isMobileDevice ? '📱 Phone' : isTablet ? `📱 Tablet ${isLandscape ? '(Landscape)' : '(Portrait)'}` : '🖥️ Desktop'}
        </div>
      )}
    </div>
  );
}
