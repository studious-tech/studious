import { IELTSLayout } from '@/components/sections/ielts/layout';
import { QuestionBrowser } from '@/components/exam/question-browser';

export default function IELTSQuestionTypesPage() {
  return (
    <IELTSLayout 
      title="IELTS Practice Questions" 
      description="Browse and practice IELTS questions by section and difficulty"
    >
      <QuestionBrowser examId="ielts-academic" />
    </IELTSLayout>
  );
}