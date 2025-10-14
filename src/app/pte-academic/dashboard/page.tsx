import { Suspense } from 'react';
import { DashboardContent } from '@/components/test-session/dashboard-content';

export default async function PTEDashboardPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardContent
        examId="pte-academic"
        examDisplayName="PTE Academic"
      />
    </Suspense>
  );
}