'use client';

import { ReactNode } from 'react';
import { useDeviceAdaptive } from '@/hooks/use-device-adaptive';

interface ResponsiveContainerProps {
  children: ReactNode;
  mobile?: ReactNode;
  tablet?: ReactNode;
  desktop?: ReactNode;
  className?: string;
}

/**
 * ResponsiveContainer - Renders different content based on device type
 * If specific device component not provided, falls back to children
 */
export function ResponsiveContainer({
  children,
  mobile,
  tablet,
  desktop,
  className = ''
}: ResponsiveContainerProps) {
  const { isMobile, isTablet } = useDeviceAdaptive();

  if (isMobile && mobile) {
    return <div className={className}>{mobile}</div>;
  }

  if (isTablet && tablet) {
    return <div className={className}>{tablet}</div>;
  }

  if (desktop && !isMobile && !isTablet) {
    return <div className={className}>{desktop}</div>;
  }

  return <div className={className}>{children}</div>;
}

interface DeviceSwitchProps {
  mobile: ReactNode;
  desktop: ReactNode;
  tablet?: ReactNode;
  className?: string;
}

/**
 * DeviceSwitch - Always renders either mobile, tablet, or desktop content
 */
export function DeviceSwitch({
  mobile,
  desktop,
  tablet,
  className = ''
}: DeviceSwitchProps) {
  const { isMobile, isTablet } = useDeviceAdaptive();

  if (isMobile) {
    return <div className={className}>{mobile}</div>;
  }

  if (isTablet && tablet) {
    return <div className={className}>{tablet}</div>;
  }

  return <div className={className}>{desktop}</div>;
}

interface AdaptiveFormProps {
  children: ReactNode;
  mobileProps?: any;
  desktopProps?: any;
}

/**
 * AdaptiveForm - Renders forms differently for mobile vs desktop
 */
export function AdaptiveForm({
  children,
  mobileProps = {},
  desktopProps = {}
}: AdaptiveFormProps) {
  const { isMobile } = useDeviceAdaptive();

  return (
    <form
      {...(isMobile ? mobileProps : desktopProps)}
      className={isMobile ? 'space-y-4' : ''}
    >
      {children}
    </form>
  );
}

interface ResponsiveModalProps {
  children: ReactNode;
  mobileTitle?: ReactNode;
  desktopTitle?: ReactNode;
  onClose?: () => void;
}

/**
 * ResponsiveModal - Handles modal behavior responsively
 */
export function ResponsiveModal({
  children,
  mobileTitle,
  desktopTitle,
  onClose
}: ResponsiveModalProps) {
  const { isMobile } = useDeviceAdaptive();

  if (isMobile) {
    return (
      <div className="fixed inset-0 z-50 bg-background">
        {mobileTitle && (
          <div className="sticky top-0 border-b bg-background p-4">
            <div className="flex items-center justify-between">
              {typeof mobileTitle === 'string' ? (
                <h2 className="text-lg font-semibold">{mobileTitle}</h2>
              ) : mobileTitle}
              {onClose && (
                <button
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground"
                  type="button"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        )}
        <div className="p-4">{children}</div>
      </div>
    );
  }

  // Desktop modal implementation (would use Dialog from UI library)
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-hidden">
        {desktopTitle && (
          <div className="border-b p-4">
            {typeof desktopTitle === 'string' ? (
              <h3 className="text-lg font-semibold">{desktopTitle}</h3>
            ) : desktopTitle}
          </div>
        )}
        <div className="p-4 overflow-auto max-h-[calc(90vh-120px)]">
          {children}
        </div>
      </div>
    </div>
  );
}
