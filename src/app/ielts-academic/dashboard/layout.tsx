import { SharedDashboardLayout } from '@/components/dashboard/shared-dashboard-layout';

export default function IELTSDashboardLayoutPage({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SharedDashboardLayout 
      title="IELTS Dashboard"
      description="Track your progress and improve your band score"
      examId="ielts-academic"
      examDisplayName="IELTS Academic"
    >
      {children}
    </SharedDashboardLayout>
  );
}