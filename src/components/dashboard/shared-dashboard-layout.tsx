'use client';

import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar';
import { SharedDashboardSidebar } from './shared-dashboard-sidebar';
import { SharedDashboardHeader } from './shared-dashboard-header';
import { Suspense } from 'react';

interface SharedDashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  examId: string;
  examDisplayName: string;
}

export function SharedDashboardLayout({ 
  children, 
  title = "Dashboard",
  description = "Welcome to your dashboard",
  examId,
  examDisplayName
}: SharedDashboardLayoutProps) {
  return (
    <SidebarProvider>
      <Suspense fallback={<div>Loading sidebar...</div>}>
        <SharedDashboardSidebar examId={examId} examDisplayName={examDisplayName} />
      </Suspense>
      <SidebarInset>
        <SharedDashboardHeader
          title={title}
          description={description}
        />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}