import { Suspense } from 'react';
import { DashboardContent } from '@/components/test-session/dashboard-content';

export default async function IELTSDashboardPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardContent
        examId="ielts-academic"
        examDisplayName="IELTS Academic"
      />
    </Suspense>
  );
}
