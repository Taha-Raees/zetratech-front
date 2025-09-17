import React from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  BarChart3, 
  Settings, 
  Users, 
  Receipt, 
  AlertTriangle,
  Home,
  Building,
  CreditCard,
  DollarSign
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';

interface NavigationItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  description?: string;
}

const adminNavigationItems: NavigationItem[] = [
  {
    title: 'Dashboard',
    url: '/admin-dashboard',
    icon: Home,
    description: 'System overview and statistics'
  },
  {
    title: 'Stores',
    url: '/admin-dashboard/stores',
    icon: Building,
    description: 'Manage stores'
  },
  {
    title: 'Subscription Packages',
    url: '/admin-dashboard/packages',
    icon: CreditCard,
    description: 'Manage subscription packages'
  },
  {
    title: 'Revenue Analytics',
    url: '/admin-dashboard/analytics',
    icon: BarChart3,
    description: 'Revenue and performance analytics'
  },
  {
    title: 'System Users',
    url: '/admin-dashboard/users',
    icon: Users,
    description: 'Manage system administrators'
  },
  {
    title: 'System Settings',
    url: '/admin-dashboard/settings',
    icon: Settings,
    description: 'Configure system settings'
  }
];

interface AppSidebarProps {
  isAdmin?: boolean;
  adminUser?: { email: string; role: string } | null;
}

export function AppSidebar({ isAdmin = false, adminUser = null }: AppSidebarProps) {
  // Filter navigation items based on user role
  const navigationItems = adminUser?.role === 'SUPERADMIN'
    ? adminNavigationItems
    : adminNavigationItems.filter(item => {
        // ADMIN users only see Stores
        return ['Stores'].includes(item.title);
      });

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            {isAdmin ? (
              <Building className="h-4 w-4 text-primary-foreground" />
            ) : (
              <span className="text-primary-foreground font-bold text-sm">
                ZT
              </span>
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">
              {isAdmin ? 'System Admin' : 'ZetraTech'}
            </span>
            <span className="text-xs text-muted-foreground">
              {isAdmin ? 'Admin Panel' : 'v1.0.0'}
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{isAdmin ? 'Navigation' : 'Main Navigation'}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const Icon = item.icon;
                
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild>
                      <Link href={item.url}>
                        <Icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>Quick Stats</SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="space-y-2 px-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Building className="h-4 w-4 text-blue-600" />
                      <span className="text-sm">Total Stores</span>
                    </div>
                    <Badge variant="outline">0</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Active Users</span>
                    </div>
                    <Badge variant="outline">0</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-purple-600" />
                      <span className="text-sm">Monthly Revenue</span>
                    </div>
                    <Badge variant="outline">PKR 0</Badge>
                  </div>
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      <SidebarFooter>
        <div className="px-2 py-2 text-xs text-muted-foreground">
          © 2024 ZetraTech Admin
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
