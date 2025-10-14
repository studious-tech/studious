'use client';

import { useEffect } from 'react';
import { useExamStore } from '@/stores/exam';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen,
  Clock,
  Users,
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
import { adminSectionColumns, AdminSection } from '@/components/admin/data-table/admin-section-columns';

export default function ExamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap the params promise
  const unwrappedParams = React.use(params);
  const { fetchExam, selectedExam, loading, deleteSection, createSection, updateSection } = useExamStore();
  const router = useRouter();

  useEffect(() => {
    fetchExam(unwrappedParams.id);
  }, [unwrappedParams.id, fetchExam]);

  const handleBackToExams = () => {
    router.push('/admin/content/exams');
  };

  const handleDeleteSection = async (sectionId: string, sectionName: string) => {
    if (confirm(`Are you sure you want to delete section "${sectionName}"? This will also delete all question types and questions within this section.`)) {
      try {
        await deleteSection(sectionId);
        toast.success('Section deleted successfully');
        await fetchExam(unwrappedParams.id);
      } catch (error) {
        toast.error('Failed to delete section');
      }
    }
  };

  const handleViewSection = (sectionId: string) => {
    router.push(`/admin/content/exams/${unwrappedParams.id}/sections/${sectionId}`);
  };

  const handleCreateQuestionType = (sectionId: string) => {
    router.push(`/admin/content/exams/${unwrappedParams.id}/sections/${sectionId}/question-types/new`);
  };

  if (loading && !selectedExam) {
    return (
      <div className="space-y-6">
        <AdminDetailHeader
          title="Loading..."
          breadcrumbs={[
            { label: 'Exams', href: '/admin/content/exams' },
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

  if (!selectedExam) {
    return (
      <div className="space-y-6">
        <AdminDetailHeader
          title="Exam Not Found"
          breadcrumbs={[
            { label: 'Exams', href: '/admin/content/exams' },
            { label: 'Not Found' }
          ]}
          actions={[
            {
              label: 'Back to Exams',
              onClick: handleBackToExams
            }
          ]}
        />
        
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Exam not found</h3>
            <p className="text-gray-500">The requested exam could not be found.</p>
          </div>
        </div>
      </div>
    );
  }

  // Convert sections to table data
  const sectionTableData: AdminSection[] = selectedExam.sections?.map(section => ({
    id: section.id,
    exam_id: selectedExam.id,
    name: section.name,
    display_name: section.display_name,
    description: section.description,
    duration_minutes: section.duration_minutes,
    order_index: section.order_index,
    is_active: section.is_active,
    created_at: section.created_at,
    updated_at: section.updated_at,
    question_types: section.question_types?.map(qt => ({
      id: qt.id,
      name: qt.name,
      display_name: qt.display_name,
      question_count: qt.question_count,
    })) || [],
  })) || [];

  return (
    <div className="space-y-6">
      <AdminDetailHeader
        title={selectedExam.display_name}
        subtitle={selectedExam.name}
        breadcrumbs={[
          { label: 'Exams', href: '/admin/content/exams' },
          { label: selectedExam.display_name }
        ]}
        status={selectedExam.is_active ? 'active' : 'inactive'}
        actions={[
          {
            label: 'Edit Exam',
            onClick: () => router.push(`/admin/content/exams/${selectedExam.id}/edit`),
            variant: 'outline'
          }
        ]}
        onEdit={() => router.push(`/admin/content/exams/${selectedExam.id}/edit`)}
        onDelete={() => {
          if (confirm(`Are you sure you want to delete exam "${selectedExam.display_name}"? This will also delete all sections, question types, and questions.`)) {
            // Implementation would go here
          }
        }}
      />

      {/* Exam Overview */}
      <AdminDetailSection title="Exam Overview">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <h4 className="font-medium">Description</h4>
            <p className="text-muted-foreground">
              {selectedExam.description || 'No description provided'}
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">Duration</h4>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>
                {selectedExam.duration_minutes 
                  ? `${selectedExam.duration_minutes} minutes` 
                  : 'Not set'}
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">Max Score</h4>
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <span>{selectedExam.total_score || 'N/A'}</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Sections:</span>
            <Badge variant="outline">
              {selectedExam.sections?.length || 0}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Question Types:</span>
            <Badge variant="outline">
              {selectedExam.sections?.reduce((total, section) => 
                total + (section.question_types?.length || 0), 0) || 0}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Questions:</span>
            <Badge variant="outline">
              {selectedExam.sections?.reduce((total, section) => 
                total + (section.question_types?.reduce((qtTotal, qt) => 
                  qtTotal + (qt.question_count || 0), 0) || 0), 0) || 0}
            </Badge>
          </div>
        </div>
      </AdminDetailSection>

      {/* Sections */}
      <AdminDetailSection 
        title="Sections"
        description="Manage exam sections and their question types"
        actions={[
          {
            label: 'Add Section',
            onClick: () => router.push(`/admin/content/exams/${selectedExam.id}/sections/new`),
            variant: 'outline'
          }
        ]}
      >
        {sectionTableData.length > 0 ? (
          <AdminDataTable
            columns={adminSectionColumns}
            data={sectionTableData}
            title=""
            description=""
            onRowClick={(section) => {
              handleViewSection(section.id);
            }}
          />
        ) : (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No sections yet
            </h3>
            <p className="text-gray-500 mb-4">
              Add sections to organize your exam content
            </p>
            <Button onClick={() => router.push(`/admin/content/exams/${selectedExam.id}/sections/new`)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Section
            </Button>
          </div>
        )}
      </AdminDetailSection>
    </div>
  );
}