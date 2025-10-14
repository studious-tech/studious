import { PTELayout } from '@/components/sections/pte/layout';
import { QuestionBrowser } from '@/components/exam/question-browser';

export default function PTEQuestionTypesPage() {
  return (
    <PTELayout 
      title="PTE Practice Questions" 
      description="Browse and practice PTE questions by section and difficulty"
    >
      <QuestionBrowser examId="pte-academic" />
    </PTELayout>
  );
}