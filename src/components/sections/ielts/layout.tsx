'use client';

import { SharedDashboardLayout } from '@/components/dashboard/shared-dashboard-layout';

interface IELTSLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export function IELTSLayout({ title, description, children }: IELTSLayoutProps) {
  return (
    <SharedDashboardLayout 
      title={title}
      description={description}
      examId="ielts-academic"
      examDisplayName="IELTS Academic"
    >
      {children}
    </SharedDashboardLayout>
  );
}