import { SharedDashboardLayout } from '@/components/dashboard/shared-dashboard-layout';
import { notFound } from 'next/navigation';

export default async function SharedExamDashboardLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ examId: string }>;
}) {
  const { examId } = await params;
  
  // Validate examId
  const validExams = ['ielts-academic', 'pte-academic'];
  if (!validExams.includes(examId)) {
    return notFound();
  }
  
  const examDisplayNames: Record<string, string> = {
    'ielts-academic': 'IELTS Academic',
    'pte-academic': 'PTE Academic'
  };

  return (
    <SharedDashboardLayout 
      title={`${examDisplayNames[examId]} Dashboard`}
      description={`Track your progress and improve your ${examId.includes('ielts') ? 'band score' : 'score'}`}
      examId={examId}
      examDisplayName={examDisplayNames[examId]}
    >
      {children}
    </SharedDashboardLayout>
  );
}