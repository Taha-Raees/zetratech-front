'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Monitor, Smartphone, Tablet, RotateCcw } from 'lucide-react';
import { useTablet } from '@/hooks/use-tablet';

export function DeviceOverview() {
  const { isTablet, isLandscape, shouldUseMobileLayout, isMobileDevice } = useTablet();

  const getDeviceType = () => {
    if (isMobileDevice) return 'smartphone';
    if (isTablet) return 'tablet';
    return 'desktop';
  };

  const getDeviceIcon = () => {
    const deviceType = getDeviceType();
    const size = 'h-6 w-6';

    if (deviceType === 'smartphone') return <Smartphone className={size} />;
    if (deviceType === 'tablet') return <Tablet className={size} />;
    return <Monitor className={size} />;
  };

  const getLayoutType = () => {
    return shouldUseMobileLayout ? 'mobile-bottom-nav' : 'desktop-sidebar';
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center space-x-2">
          {getDeviceIcon()}
          <span>Device Detection</span>
        </CardTitle>
        <CardDescription>
          Adaptive layout that adjusts to device type and orientation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Device */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Device Type</span>
            <Badge variant="outline" className="flex items-center space-x-1">
              {getDeviceIcon()}
              <span className="capitalize">{getDeviceType()}</span>
            </Badge>
          </div>

          {isTablet && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Orientation</span>
              <Badge variant="secondary" className="flex items-center space-x-1">
                <RotateCcw className="h-3 w-3" />
                <span>{isLandscape ? 'Landscape' : 'Portrait'}</span>
              </Badge>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Active Layout</span>
            <Badge variant={shouldUseMobileLayout ? 'default' : 'secondary'}>
              {shouldUseMobileLayout ? 'Mobile' : 'Desktop'}
            </Badge>
          </div>
        </div>

        {/* Viewport Info */}
        <div className="pt-3 border-t">
          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div>Width: {window.innerWidth}px</div>
            <div>Height: {window.innerHeight}px</div>
            <div>Ratio: {(window.innerWidth / window.innerHeight).toFixed(2)}</div>
            <div>Layout: {getLayoutType()}</div>
          </div>
        </div>

        {/* Behavior Explanation */}
        <div className="pt-3 border-t">
          <p className="text-xs text-muted-foreground">
            <strong>Behavior:</strong>{' '}
            {isMobileDevice
              ? 'Always mobile layout for phones'
              : isTablet
                ? `Mobile layout in portrait, desktop in landscape`
                : 'Desktop layout for larger screens'
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default DeviceOverview;
