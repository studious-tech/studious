'use client';

import { useEffect, useState } from 'react';
import { useExamStore } from '@/stores/exam';
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
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import React from 'react';
import { AdminDetailHeader, AdminDetailSection } from '@/components/admin/admin-detail-components';
import { AdminDataTable } from '@/components/admin/data-table/admin-data-table';
import { adminQuestionTypeColumns, AdminQuestionType } from '@/components/admin/data-table/admin-question-type-columns';
import { QuestionTypeForm } from '@/components/admin/content/question-type-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function SectionDetailPage({ params }: { params: Promise<{ id: string; sectionId: string }> }) {
  // Unwrap the params promise
  const unwrappedParams = React.use(params);
  const { fetchExam, selectedExam, deleteQuestionType, updateQuestionType, createQuestionType, fetchQuestions, loading } = useExamStore();
  const [targetSectionId, setTargetSectionId] = useState<string>('');
  const [editingQuestionType, setEditingQuestionType] = useState<any>(null);
  const [showQuestionTypeForm, setShowQuestionTypeForm] = useState(false);
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<any>(null);

  useEffect(() => {
    fetchExam(unwrappedParams.id);
  }, [unwrappedParams.id, fetchExam]);

  useEffect(() => {
    if (selectedExam && selectedExam.sections) {
      const section = selectedExam.sections.find((s: any) => s.id === unwrappedParams.sectionId);
      if (section) {
        setActiveSection(section);
      }
    }
  }, [selectedExam, unwrappedParams.sectionId]);

  const handleDeleteQuestionType = async (questionTypeId: string, questionTypeName: string) => {
    if (confirm(`Are you sure you want to delete question type "${questionTypeName}"?`)) {
      try {
        await deleteQuestionType(questionTypeId);
        toast.success('Question type deleted successfully');
        // Refresh the exam data
        fetchExam(unwrappedParams.id);
      } catch (error) {
        toast.error('Failed to delete question type');
      }
    }
  };

  const openQuestionTypeForm = (sectionId: string, questionType?: any) => {
    setTargetSectionId(sectionId);
    setEditingQuestionType(questionType || null);
    setShowQuestionTypeForm(true);
  };

  const openQuestionForm = (questionTypeId: string) => {
    router.push(`/admin/content/exams/${unwrappedParams.id}/sections/${unwrappedParams.sectionId}/question-types/${questionTypeId}/questions/new`);
  };

  const handleSelectQuestionType = (questionType: any) => {
    router.push(`/admin/content/exams/${unwrappedParams.id}/sections/${unwrappedParams.sectionId}/question-types/${questionType.id}`);
  };

  const handleBackToExam = () => {
    router.push(`/admin/content/exams/${unwrappedParams.id}`);
  };

  const handleBackToSections = () => {
    router.push(`/admin/content/exams/${unwrappedParams.id}`);
  };

  if (loading && !selectedExam) {
    return (
      <div className="space-y-6">
        <AdminDetailHeader
          title="Loading..."
          breadcrumbs={[
            { label: 'Exams', href: '/admin/content/exams' },
            { label: 'Loading...', href: `/admin/content/exams/${unwrappedParams.id}` },
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

  if (!selectedExam || !activeSection) {
    return (
      <div className="space-y-6">
        <AdminDetailHeader
          title="Section Not Found"
          breadcrumbs={[
            { label: 'Exams', href: '/admin/content/exams' },
            { label: selectedExam?.display_name || 'Exam', href: `/admin/content/exams/${unwrappedParams.id}` },
            { label: 'Not Found' }
          ]}
          actions={[
            {
              label: 'Back to Exam',
              onClick: handleBackToExam
            }
          ]}
        />
        
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Section not found</h3>
            <p className="text-gray-500">The requested section could not be found.</p>
          </div>
        </div>
      </div>
    );
  }

  // Convert question types to table data
  const questionTypeTableData: AdminQuestionType[] = activeSection.question_types?.map((qt: any) => ({
    id: qt.id,
    section_id: activeSection.id,
    name: qt.name,
    display_name: qt.display_name,
    description: qt.description,
    input_type: qt.input_type,
    response_type: qt.response_type,
    scoring_method: qt.scoring_method,
    time_limit_seconds: qt.time_limit_seconds,
    order_index: qt.order_index,
    is_active: qt.is_active,
    created_at: qt.created_at,
    updated_at: qt.updated_at,
    question_count: qt.question_count,
  })) || [];

  return (
    <div className="space-y-6">
      <AdminDetailHeader
        title={activeSection.display_name}
        subtitle={`${activeSection.name} • Section #${activeSection.order_index}`}
        breadcrumbs={[
          { label: 'Exams', href: '/admin/content/exams' },
          { label: selectedExam.display_name, href: `/admin/content/exams/${unwrappedParams.id}` },
          { label: activeSection.display_name }
        ]}
        status={activeSection.is_active ? 'active' : 'inactive'}
        actions={[
          {
            label: 'Edit Section',
            onClick: () => openQuestionTypeForm(activeSection.id),
            variant: 'outline'
          }
        ]}
        onEdit={() => openQuestionTypeForm(activeSection.id)}
        onDelete={() => {
          if (confirm(`Are you sure you want to delete section "${activeSection.display_name}"? This will also delete all question types and questions within this section.`)) {
            // Implementation would go here
          }
        }}
      />

      {/* Section Overview */}
      <AdminDetailSection title="Section Overview">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <h4 className="font-medium">Description</h4>
            <p className="text-muted-foreground">
              {activeSection.description || 'No description provided'}
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">Duration</h4>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>
                {activeSection.duration_minutes 
                  ? `${activeSection.duration_minutes} minutes` 
                  : 'Not set'}
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">Order</h4>
            <div className="flex items-center gap-2">
              <span>#{activeSection.order_index}</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Question Types:</span>
            <Badge variant="outline">
              {activeSection.question_types?.length || 0}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Questions:</span>
            <Badge variant="outline">
              {activeSection.question_types?.reduce((total: number, qt: any) => 
                total + (qt.question_count || 0), 0) || 0}
            </Badge>
          </div>
        </div>
      </AdminDetailSection>

      {/* Question Types */}
      <AdminDetailSection 
        title="Question Types"
        description="Manage question types in this section"
        actions={[
          {
            label: 'Add Question Type',
            onClick: () => openQuestionTypeForm(activeSection.id),
            variant: 'outline'
          }
        ]}
      >
        {questionTypeTableData.length > 0 ? (
          <AdminDataTable
            columns={adminQuestionTypeColumns}
            data={questionTypeTableData}
            title=""
            description=""
            onRowClick={(questionType) => {
              handleSelectQuestionType(questionType);
            }}
          />
        ) : (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No question types yet
            </h3>
            <p className="text-gray-500 mb-4">
              Add your first question type to get started
            </p>
            <Button onClick={() => openQuestionTypeForm(activeSection.id)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Question Type
            </Button>
          </div>
        )}
      </AdminDetailSection>

      {/* Question Type Form Modal */}
      <Dialog open={showQuestionTypeForm} onOpenChange={setShowQuestionTypeForm}>
        <DialogContent className="max-w-6xl md:min-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingQuestionType ? 'Edit Question Type' : 'Create New Question Type'}
            </DialogTitle>
            <DialogDescription>
              Define a new type of question for this section with specific input
              and output patterns
            </DialogDescription>
          </DialogHeader>
          <QuestionTypeForm
            questionType={editingQuestionType}
            sectionId={targetSectionId}
            examId={unwrappedParams.id}
            onSubmit={async (questionTypeData: any) => {
              try {
                if (editingQuestionType) {
                  await updateQuestionType(editingQuestionType.id, questionTypeData);
                  toast.success('Question type updated successfully');
                } else {
                  await createQuestionType(questionTypeData);
                  toast.success('Question type created successfully');
                }
                setShowQuestionTypeForm(false);
                setEditingQuestionType(null);
                setTargetSectionId('');
                // Refresh the exam data to show the new question type
                await fetchExam(unwrappedParams.id);
              } catch (error: any) {
                toast.error(error.message || 'Failed to save question type');
              }
            }}
            onCancel={() => {
              setShowQuestionTypeForm(false);
              setEditingQuestionType(null);
              setTargetSectionId('');
            }}
            onClose={() => {
              setShowQuestionTypeForm(false);
              setEditingQuestionType(null);
              setTargetSectionId('');
            }}
            loading={false}
            asModal={true}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}