'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Plus, 
  RefreshCw, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Wrench,
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdminStore } from '@/stores/admin';
import { AdminDataTable } from '@/components/admin/data-table/admin-data-table';
import { adminQuestionTypeColumns, AdminQuestionType } from '@/components/admin/data-table/admin-question-type-columns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function QuestionTypesPage() {
  const { 
    questionTypes, 
    questionTypesLoading, 
    fetchQuestionTypes, 
    createQuestionType, 
    updateQuestionType, 
    deleteQuestionType 
  } = useAdminStore();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingQuestionType, setEditingQuestionType] = useState<AdminQuestionType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchQuestionTypes();
  }, [fetchQuestionTypes]);

  const handleCreateQuestionType = async (questionTypeData: any) => {
    setIsSubmitting(true);
    try {
      await createQuestionType(questionTypeData);
      toast.success('Question type created successfully');
      setShowCreateDialog(false);
      fetchQuestionTypes();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create question type');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateQuestionType = async (questionTypeData: any) => {
    if (!editingQuestionType) return;
    
    setIsSubmitting(true);
    try {
      await updateQuestionType(editingQuestionType.id, questionTypeData);
      toast.success('Question type updated successfully');
      setEditingQuestionType(null);
      fetchQuestionTypes();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update question type');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteQuestionType = async (questionTypeId: string, questionTypeName: string) => {
    if (confirm(`Are you sure you want to delete question type "${questionTypeName}"? This will affect all questions of this type.`)) {
      try {
        await deleteQuestionType(questionTypeId);
        toast.success('Question type deleted successfully');
        fetchQuestionTypes();
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete question type');
      }
    }
  };

  const handleConfigureQuestionType = (questionType: AdminQuestionType) => {
    // Navigate to question type configuration page
    router.push(`/admin/content/question-types/${questionType.id}/configure`);
  };

  // Convert store question types to table data
  const tableData: AdminQuestionType[] = questionTypes.map(qt => ({
    id: qt.id,
    section_id: qt.section_id,
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
    ui_component: qt.ui_component,
    section: qt.sections ? {
      id: qt.sections.id,
      name: qt.sections.name,
      display_name: qt.sections.display_name,
      exam: qt.sections.exams ? {
        id: qt.sections.exams.id,
        name: qt.sections.exams.name,
        display_name: qt.sections.exams.display_name,
      } : undefined,
    } : undefined,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Question Types</h1>
          <p className="text-muted-foreground">
            Manage question types and their configurations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchQuestionTypes}
            disabled={questionTypesLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${questionTypesLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Question Type
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-4">
            <div className="rounded-full bg-primary/10 p-3 mr-4">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Types</p>
              <p className="text-2xl font-bold">{questionTypes.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-4">
            <div className="rounded-full bg-green-100 p-3 mr-4 dark:bg-green-900">
              <BookOpen className="h-6 w-6 text-green-600 dark:text-green-300" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Types</p>
              <p className="text-2xl font-bold">
                {questionTypes.filter(qt => qt.is_active).length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-4">
            <div className="rounded-full bg-purple-100 p-3 mr-4 dark:bg-purple-900">
              <BookOpen className="h-6 w-6 text-purple-600 dark:text-purple-300" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Configured Types</p>
              <p className="text-2xl font-bold">
                {questionTypes.filter(qt => qt.ui_component).length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-4">
            <div className="rounded-full bg-orange-100 p-3 mr-4 dark:bg-orange-900">
              <AlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-300" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Missing Config</p>
              <p className="text-2xl font-bold">
                {questionTypes.filter(qt => !qt.ui_component).length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Question Types Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Question Types</CardTitle>
              <CardDescription>
                Browse and manage all question types
              </CardDescription>
            </div>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Question Type
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <AdminDataTable
            columns={adminQuestionTypeColumns}
            data={tableData}
            title="All Question Types"
            description="Browse and manage all question types"
            filterPlaceholder="Search question types..."
            filterKey="display_name"
            onRowClick={(questionType) => {
              router.push(`/admin/content/question-types/${questionType.id}`);
            }}
          />
        </CardContent>
      </Card>

      {/* Create Question Type Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Question Type</DialogTitle>
            <DialogDescription>
              Set up a new question type
            </DialogDescription>
          </DialogHeader>
          {/* Implementation would go here */}
          <div className="text-center py-8">
            <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Question Type Creation Form
            </h3>
            <p className="text-gray-500 mb-4">
              Implementation would go here
            </p>
            <Button onClick={() => setShowCreateDialog(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Question Type Dialog */}
      <Dialog open={!!editingQuestionType} onOpenChange={(open) => !open && setEditingQuestionType(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Question Type</DialogTitle>
            <DialogDescription>
              Update the question type details
            </DialogDescription>
          </DialogHeader>
          {editingQuestionType && (
            <div className="text-center py-8">
              <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Question Type Editing Form
              </h3>
              <p className="text-gray-500 mb-4">
                Implementation would go here
              </p>
              <Button onClick={() => setEditingQuestionType(null)}>
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}