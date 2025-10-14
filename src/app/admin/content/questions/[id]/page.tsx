'use client';

import * as React from 'react';
import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock,
  BookOpen,
  FileText,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Image,
  Volume2,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { AdminDetailHeader, AdminDetailSection } from '@/components/admin/admin-detail-components';
import { useAdminStore } from '@/stores/admin';

export default function QuestionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap the params promise
  const unwrappedParams = React.use(params);
  const { 
    questions, 
    questionsLoading, 
    fetchQuestionById, 
    deleteQuestion, 
    toggleQuestionStatus 
  } = useAdminStore();
  const router = useRouter();

  useEffect(() => {
    fetchQuestionById(unwrappedParams.id);
  }, [unwrappedParams.id, fetchQuestionById]);

  const selectedQuestion = questions.find(q => q.id === unwrappedParams.id);

  const handleDeleteQuestion = async () => {
    if (confirm(`Are you sure you want to delete this question?`)) {
      try {
        await deleteQuestion(unwrappedParams.id);
        toast.success('Question deleted successfully');
        router.push('/admin/content/questions');
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete question');
      }
    }
  };

  const handleToggleStatus = async () => {
    try {
      await toggleQuestionStatus(unwrappedParams.id);
      toast.success('Question status updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update question status');
    }
  };

  const handleBackToQuestions = () => {
    router.push('/admin/content/questions');
  };

  if (questionsLoading && !selectedQuestion) {
    return (
      <div className="space-y-6">
        <AdminDetailHeader
          title="Loading..."
          breadcrumbs={[
            { label: 'Questions', href: '/admin/content/questions' },
            { label: 'Loading...', href: `/admin/content/questions/${unwrappedParams.id}` },
            { label: 'Loading...' }
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
            { label: 'Not Found' }
          ]}
          actions={[
            {
              label: 'Back to Questions',
              onClick: handleBackToQuestions
            }
          ]}
        />
        
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-600 mb-2">
              Question not found
            </h3>
            <p className="text-gray-500">
              The requested question could not be found.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminDetailHeader
        title={selectedQuestion.title || "Untitled Question"}
        subtitle={`${selectedQuestion.question_types?.display_name || 'Unknown Type'} • Level ${selectedQuestion.difficulty_level}`}
        breadcrumbs={[
          { label: 'Questions', href: '/admin/content/questions' },
          { label: selectedQuestion.title || "Untitled Question" }
        ]}
        status={selectedQuestion.is_active ? 'active' : 'inactive'}
        actions={[
          {
            label: 'Edit Question',
            onClick: () => router.push(`/admin/content/questions/${selectedQuestion.id}/edit`),
            variant: 'outline'
          }
        ]}
        onEdit={() => router.push(`/admin/content/questions/${selectedQuestion.id}/edit`)}
        onDelete={handleDeleteQuestion}
      />

      {/* Question Overview */}
      <AdminDetailSection title="Question Overview">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <h4 className="font-medium">Instructions</h4>
            <p className="text-muted-foreground">
              {selectedQuestion.instructions || 'No specific instructions provided'}
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">Duration</h4>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>
                {selectedQuestion.expected_duration_seconds 
                  ? `${Math.floor(selectedQuestion.expected_duration_seconds / 60)}m ${selectedQuestion.expected_duration_seconds % 60}s` 
                  : 'Not set'}
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">Context</h4>
            <div className="flex items-center gap-2">
              {selectedQuestion.question_types?.sections?.exams && (
                <Badge variant="outline">
                  {selectedQuestion.question_types.sections.exams.display_name}
                </Badge>
              )}
              {selectedQuestion.question_types?.sections && (
                <Badge variant="outline">
                  {selectedQuestion.question_types.sections.display_name}
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Status:</span>
            <Badge variant={selectedQuestion.is_active ? 'default' : 'secondary'}>
              {selectedQuestion.is_active ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Difficulty:</span>
            <Badge variant="secondary">
              Level {selectedQuestion.difficulty_level}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Type:</span>
            <Badge variant="outline">
              {selectedQuestion.question_types?.display_name || 'Unknown'}
            </Badge>
          </div>
        </div>
      </AdminDetailSection>

      {/* Question Content */}
      <AdminDetailSection title="Question Content">
        <div className="prose max-w-none">
          {selectedQuestion.content ? (
            <div 
              dangerouslySetInnerHTML={{ __html: selectedQuestion.content }} 
              className="bg-muted p-4 rounded-lg"
            />
          ) : (
            <p className="text-muted-foreground italic">
              No content provided for this question
            </p>
          )}
        </div>
      </AdminDetailSection>

      {/* Question Options */}
      {selectedQuestion.question_options && selectedQuestion.question_options.length > 0 && (
        <AdminDetailSection title="Answer Options">
          <div className="space-y-3">
            {selectedQuestion.question_options
              .sort((a, b) => a.display_order - b.display_order)
              .map((option, index) => (
                <div 
                  key={option.id} 
                  className={`flex items-start p-4 rounded-lg border ${
                    option.is_correct ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center mr-3 mt-0.5">
                    {option.is_correct ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="font-medium">
                        Option {String.fromCharCode(65 + index)}
                      </h5>
                      <Badge variant="outline" className="text-xs">
                        #{option.display_order}
                      </Badge>
                    </div>
                    <div className="mt-1">
                      {option.option_text || 'No text provided'}
                    </div>
                    {option.option_media_id && (
                      <div className="mt-2 flex items-center gap-2">
                        <Image className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Media attached
                        </span>
                      </div>
                    )}
                  </div>
                  {option.is_correct && (
                    <Badge variant="default" className="ml-2">
                      Correct Answer
                    </Badge>
                  )}
                </div>
              ))}
          </div>
        </AdminDetailSection>
      )}

      {/* Question Media */}
      {selectedQuestion.question_media && selectedQuestion.question_media.length > 0 && (
        <AdminDetailSection title="Media Assets">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedQuestion.question_media
              .sort((a, b) => a.display_order - b.display_order)
              .map((media) => (
                <Card key={media.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="aspect-video bg-muted flex items-center justify-center">
                      {media.media?.mime_type?.startsWith('image/') ? (
                        <Image className="h-8 w-8 text-muted-foreground" />
                      ) : media.media?.mime_type?.startsWith('audio/') ? (
                        <Volume2 className="h-8 w-8 text-muted-foreground" />
                      ) : (
                        <FileText className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    <div className="p-4">
                      <h4 className="font-medium text-sm truncate">
                        {media.media?.original_filename || 'Unnamed File'}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {media.media?.file_type?.toUpperCase() || 'FILE'} •{' '}
                        {media.media?.file_size 
                          ? `${Math.round(media.media.file_size / 1024)} KB` 
                          : 'Unknown size'}
                      </p>
                      <Badge variant="outline" className="mt-2 text-xs">
                        {media.media_role}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </AdminDetailSection>
      )}

      {/* Metadata */}
      <AdminDetailSection title="Metadata">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <h4 className="font-medium">Created</h4>
            <p className="text-muted-foreground">
              {new Date(selectedQuestion.created_at).toLocaleString()}
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">Last Updated</h4>
            <p className="text-muted-foreground">
              {new Date(selectedQuestion.updated_at).toLocaleString()}
            </p>
          </div>
        </div>
      </AdminDetailSection>
    </div>
  );
}