'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { AdminDetailHeader } from '@/components/admin/admin-detail-components';
import { EditQuestionForm } from '@/components/admin/content/edit-question-form';
import { useAdminStore } from '@/stores/admin';

export default function NewQuestionPage() {
  const { 
    createQuestion,
    questionTypes,
    fetchQuestionTypes
  } = useAdminStore();
  const router = useRouter();

  React.useEffect(() => {
    fetchQuestionTypes();
  }, [fetchQuestionTypes]);

  const handleSubmit = async (questionData: any) => {
    try {
      const newQuestion = await createQuestion(questionData);
      toast.success('Question created successfully');
      router.push(`/admin/content/questions/${newQuestion.id}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create question');
      throw error;
    }
  };

  const handleCancel = () => {
    router.push('/admin/content/questions');
  };

  return (
    <div className="space-y-6">
      <AdminDetailHeader
        title="Create New Question"
        breadcrumbs={[
          { label: 'Questions', href: '/admin/content/questions' },
          { label: 'New Question' }
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle>New Question</CardTitle>
          <CardDescription>
            Create a new exam question
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EditQuestionForm
            questionTypes={questionTypes}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            submitLabel="Create Question"
          />
        </CardContent>
      </Card>
    </div>
  );
}