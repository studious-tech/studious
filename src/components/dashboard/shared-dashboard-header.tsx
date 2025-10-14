'use client';

import * as React from 'react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ChevronRight } from 'lucide-react';

interface SharedDashboardHeaderProps {
  title: string;
  description: string;
}

export function SharedDashboardHeader({ title, description }: SharedDashboardHeaderProps) {
  const pathname = usePathname();
  const [breadcrumbs, setBreadcrumbs] = useState<Array<{ name: string; href?: string }>>([]);

  useEffect(() => {
    // Parse pathname to create breadcrumbs
    const pathSegments = pathname.split('/').filter(segment => segment);
    
    // Create breadcrumb items
    const breadcrumbItems = pathSegments.map((segment, index) => {
      const href = '/' + pathSegments.slice(0, index + 1).join('/');
      
      // Format segment name
      let name = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      // Special handling for common segments
      if (segment === 'ielts-academic') name = 'IELTS Academic';
      if (segment === 'pte-academic') name = 'PTE Academic';
      if (segment === 'dashboard') name = 'Dashboard';
      
      return {
        name,
        href: index < pathSegments.length - 1 ? href : undefined // Last item is current page, no href
      };
    });
    
    setBreadcrumbs(breadcrumbItems);
  }, [pathname]);

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((breadcrumb, index) => (
              <React.Fragment key={index}>
                <BreadcrumbItem>
                  {index < breadcrumbs.length - 1 ? (
                    <BreadcrumbLink href={breadcrumb.href}>{breadcrumb.name}</BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{breadcrumb.name}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
                {index < breadcrumbs.length - 1 && (
                  <BreadcrumbSeparator>
                    <ChevronRight className="h-4 w-4" />
                  </BreadcrumbSeparator>
                )}
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  );
}