'use client';

import { SharedDashboardLayout } from '@/components/dashboard/shared-dashboard-layout';

interface PTELayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export function PTELayout({ title, description, children }: PTELayoutProps) {
  return (
    <SharedDashboardLayout 
      title={title}
      description={description}
      examId="pte-academic"
      examDisplayName="PTE Academic"
    >
      {children}
    </SharedDashboardLayout>
  );
}