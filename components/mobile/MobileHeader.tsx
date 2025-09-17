'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Menu, LogOut, User, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { adminApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface MobileHeaderProps {
  title: string;
  showBackButton?: boolean;
  className?: string;
}

export function MobileHeader({ title, showBackButton = false, className }: MobileHeaderProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { state, logout } = useAuth();

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
      router.push('/admin-login');
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Logout Error",
        description: "There was an error logging out.",
        variant: "destructive",
      });
    }
  };

  return (
    <header className={cn(
      "sticky top-0 z-40 w-full bg-background border-b border-border px-4 py-3",
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {showBackButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="p-1 h-8 w-8"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Button>
          )}

          {/* Mobile logo/brand */}
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">ZT</span>
            </div>
            <span className="text-sm font-semibold truncate">
              {title}
            </span>
          </div>
        </div>

        {/* Menu sheet for mobile actions */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="p-1 h-8 w-8">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-64">
            {/* Accessibility: SheetTitle required by Radix UI */}
            <SheetTitle className="sr-only">Admin Menu</SheetTitle>

            <div className="flex flex-col space-y-4 mt-6">
              {/* User Info */}
              {adminUser && (
                <div className="flex items-center space-x-3 px-1 py-2">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-sm font-medium break-words overflow-hidden">{adminUser.email}</span>
                    <span className="text-xs text-muted-foreground capitalize">
                      {adminUser.role}
                    </span>
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="px-1">
                <h3 className="text-sm font-medium mb-2">Quick Actions</h3>
                <div className="space-y-1">
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => router.push('/admin-dashboard')}
                  >
                    <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1m-1 0h4m-4 0h4" />
                    </svg>
                    Dashboard
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => router.push('/admin-dashboard/settings')}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-destructive hover:text-destructive"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </div>

              {/* System Info */}
              <div className="px-1 pt-4 border-t">
                <div className="text-xs text-muted-foreground">
                  ZetraTech Admin v1.0.0
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
