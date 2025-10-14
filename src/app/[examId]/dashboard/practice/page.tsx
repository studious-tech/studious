import { SharedPracticeOverview } from '@/components/dashboard/shared-practice-overview';

export default async function SharedPracticePage({ 
  params 
}: { 
  params: Promise<{ examId: string }> 
}) {
  const { examId } = await params;

  return <SharedPracticeOverview examId={examId} />;
}