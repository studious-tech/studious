'use client';

import * as React from 'react';
import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { AdminDetailHeader } from '@/components/admin/admin-detail-components';
import { EditQuestionForm } from '@/components/admin/content/edit-question-form';
import { useAdminStore } from '@/stores/admin';

export default function EditQuestionPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap the params promise
  const unwrappedParams = React.use(params);
  const { 
    selectedQuestion,
    selectedQuestionLoading,
    fetchQuestionById,
    updateQuestion,
    questionTypes,
    fetchQuestionTypes
  } = useAdminStore();
  const router = useRouter();

  useEffect(() => {
    fetchQuestionById(unwrappedParams.id);
    fetchQuestionTypes();
  }, [unwrappedParams.id, fetchQuestionById, fetchQuestionTypes]);

  const handleSubmit = async (questionData: any) => {
    try {
      await updateQuestion(unwrappedParams.id, questionData);
      toast.success('Question updated successfully');
      router.push(`/admin/content/questions/${unwrappedParams.id}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update question');
      throw error;
    }
  };

  const handleCancel = () => {
    router.push(`/admin/content/questions/${unwrappedParams.id}`);
  };

  if (selectedQuestionLoading && !selectedQuestion) {
    return (
      <div className="space-y-6">
        <AdminDetailHeader
          title="Loading..."
          breadcrumbs={[
            { label: 'Questions', href: '/admin/content/questions' },
            { label: 'Loading...', href: `/admin/content/questions/${unwrappedParams.id}` },
            { label: 'Edit' }
          ]}
          loading={true}
        />
        
        <div className="grid gap-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!selectedQuestion) {
    return (
      <div className="space-y-6">
        <AdminDetailHeader
          title="Question Not Found"
          breadcrumbs={[
            { label: 'Questions', href: '/admin/content/questions' },
            { label: 'Not Found' },
            { label: 'Edit' }
          ]}
          actions={[
            {
              label: 'Back to Questions',
              onClick: () => router.push('/admin/content/questions')
            }
          ]}
        />
        
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Card className="w-full max-w-md mx-auto">
              <CardHeader>
                <CardTitle>Question Not Found</CardTitle>
                <CardDescription>
                  The question you're trying to edit could not be found.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => router.push('/admin/content/questions')}>
                  Back to Questions
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminDetailHeader
        title={`Edit Question: ${selectedQuestion.title || 'Untitled'}`}
        breadcrumbs={[
          { label: 'Questions', href: '/admin/content/questions' },
          { label: selectedQuestion.title || 'Untitled', href: `/admin/content/questions/${unwrappedParams.id}` },
          { label: 'Edit' }
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle>Question Editor</CardTitle>
          <CardDescription>
            Modify the details of this question
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EditQuestionForm
            question={selectedQuestion}
            questionTypes={questionTypes}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            submitLabel="Update Question"
          />
        </CardContent>
      </Card>
    </div>
  );
}