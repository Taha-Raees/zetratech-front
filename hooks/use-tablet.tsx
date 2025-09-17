import { useState, useEffect } from 'react';

interface TabletDetectionResult {
  isTablet: boolean;
  isLandscape: boolean;
  shouldUseMobileLayout: boolean;
  isMobileDevice: boolean;
}

export function useTablet(): TabletDetectionResult {
  const [result, setResult] = useState<TabletDetectionResult>({
    isTablet: false,
    isLandscape: false,
    shouldUseMobileLayout: false,
    isMobileDevice: false,
  });

  useEffect(() => {
    const updateDeviceInfo = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const aspectRatio = viewportWidth / viewportHeight;
      const isLandscape = aspectRatio >= 1;

      // Mobile device detection (phones and small tablets)
      const isMobileDevice = viewportWidth < 768;

      // Tablet detection (768px to 1024px width, medium tablets)
      const isTablet = viewportWidth >= 768 && viewportWidth < 1024;

      // Determine if we should use mobile layout
      // 1. Always use mobile layout on phones (< 768px)
      // 2. Use mobile layout on tablets in portrait mode (< 768px effective width)
      // 3. Use desktop layout on tablets in landscape mode (>= 1024px effective width)
      const shouldUseMobileLayout = isMobileDevice || (isTablet && !isLandscape);

      setResult({
        isTablet,
        isLandscape,
        shouldUseMobileLayout,
        isMobileDevice,
      });
    };

    // Initial detection
    updateDeviceInfo();

    // Listen for orientation changes
    const handleOrientationChange = () => {
      // Allow time for viewport to settle after rotation
      setTimeout(updateDeviceInfo, 100);
    };

    // Listen for resize events
    window.addEventListener('resize', updateDeviceInfo);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', updateDeviceInfo);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  return result;
}

/**
 * Legacy hook compatibility - maintains backward compatibility
 * while providing the new tablet-aware logic
 */
export function useIsMobile() {
  const { shouldUseMobileLayout } = useTablet();
  return shouldUseMobileLayout;
}
