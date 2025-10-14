import { SharedDashboardLayout } from '@/components/dashboard/shared-dashboard-layout';

export default function PTEDashboardLayoutPage({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SharedDashboardLayout 
      title="PTE Dashboard"
      description="Track your progress and improve your score"
      examId="pte-academic"
      examDisplayName="PTE Academic"
    >
      {children}
    </SharedDashboardLayout>
  );
}