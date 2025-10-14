'use client';

import { CreateQuestionForm } from '@/components/admin/content/create-question-form';
import React from 'react';

export default function CreateQuestionPage({ params }: { params: Promise<{ id: string; sectionId: string; questionTypeId: string }> }) {
  const unwrappedParams = React.use(params);
  
  const handleBack = () => {
    window.location.href = `/admin/content/exams/${unwrappedParams.id}/sections/${unwrappedParams.sectionId}/question-types/${unwrappedParams.questionTypeId}`;
  };

  const handleSuccess = () => {
    window.location.href = `/admin/content/exams/${unwrappedParams.id}/sections/${unwrappedParams.sectionId}/question-types/${unwrappedParams.questionTypeId}`;
  };

  return (
    <CreateQuestionForm
      examId={unwrappedParams.id}
      sectionId={unwrappedParams.sectionId}
      questionTypeId={unwrappedParams.questionTypeId}
      onBack={handleBack}
      onSuccess={handleSuccess}
    />
  );
}