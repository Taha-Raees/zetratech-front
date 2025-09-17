import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function AdminBreadcrumbs() {
  const pathname = usePathname();
  
  // Split pathname and filter out empty segments
  const pathSegments = pathname.split('/').filter(segment => segment);
  
  // Generate breadcrumb items
  const breadcrumbs = pathSegments.map((segment, index) => {
    const href = '/' + pathSegments.slice(0, index + 1).join('/');
    const isLast = index === pathSegments.length - 1;
    
    // Format segment for display
    const displayName = segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    return {
      name: displayName,
      href,
      isLast,
    };
  });
  
  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground">
      <Link href="/admin-dashboard" className="flex items-center hover:text-foreground">
        <Home className="h-4 w-4" />
      </Link>
      
      {breadcrumbs.map((breadcrumb, index) => (
        <React.Fragment key={breadcrumb.href}>
          <ChevronRight className="h-4 w-4" />
          {breadcrumb.isLast ? (
            <span className="font-medium text-foreground truncate max-w-xs">
              {breadcrumb.name}
            </span>
          ) : (
            <Link 
              href={breadcrumb.href} 
              className="hover:text-foreground truncate max-w-xs"
            >
              {breadcrumb.name}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
