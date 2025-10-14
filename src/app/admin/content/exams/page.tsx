'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { useExamStore } from '@/stores/exam';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Plus, FileText, List } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { ExamDialogForm } from '@/components/admin/content/exam-dialog-form';
import { AdminDataTable } from '@/components/admin/data-table/admin-data-table';
import { adminExamColumns, AdminExam } from '@/components/admin/data-table/admin-exam-columns';

export default function ExamsPage() {
  const { fetchExams, exams, createExam, updateExam } = useExamStore();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingExam, setEditingExam] = useState<AdminExam | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  const handleCreateExam = async (examData: any) => {
    setLoading(true);
    try {
      await createExam(examData);
      toast.success('Exam created successfully');
      setShowCreateDialog(false);
      fetchExams(); // Refresh the list
    } catch (error: any) {
      toast.error(error.message || 'Failed to create exam');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateExam = async (examData: any) => {
    if (!editingExam) return;
    
    setLoading(true);
    try {
      await updateExam(editingExam.id, examData);
      toast.success('Exam updated successfully');
      setEditingExam(null);
      fetchExams(); // Refresh the list
    } catch (error: any) {
      toast.error(error.message || 'Failed to update exam');
    } finally {
      setLoading(false);
    }
  };

  // Convert store exam data to table data
  const tableData: AdminExam[] = exams.map(exam => ({
    id: exam.id,
    name: exam.name,
    display_name: exam.display_name,
    description: exam.description,
    duration_minutes: exam.duration_minutes,
    total_score: exam.total_score,
    is_active: exam.is_active,
    created_at: exam.created_at,
    sections: exam.sections?.map(section => ({
      id: section.id,
      name: section.name,
      display_name: section.display_name,
      question_types: section.question_types?.map(qt => ({
        id: qt.id,
        name: qt.name,
        display_name: qt.display_name,
      })) || [],
    })) || [],
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Exam Management</h1>
          <p className="text-muted-foreground">
            Create and manage exam structures
          </p>
        </div>

        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Exam
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center p-4">
            <div className="rounded-full bg-primary/10 p-3 mr-4">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Exams</p>
              <p className="text-2xl font-bold">{exams.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-4">
            <div className="rounded-full bg-green-100 p-3 mr-4 dark:bg-green-900">
              <FileText className="h-6 w-6 text-green-600 dark:text-green-300" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Sections</p>
              <p className="text-2xl font-bold">
                {exams.reduce(
                  (total, exam) => total + (exam.sections?.length || 0),
                  0
                )}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-4">
            <div className="rounded-full bg-purple-100 p-3 mr-4 dark:bg-purple-900">
              <List className="h-6 w-6 text-purple-600 dark:text-purple-300" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Question Types</p>
              <p className="text-2xl font-bold">
                {exams.reduce(
                  (total, exam) =>
                    total +
                    (exam.sections?.reduce(
                      (secTotal, section) =>
                        secTotal + (section.question_types?.length || 0),
                      0
                    ) || 0),
                  0
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Exams Table */}
      <AdminDataTable
        columns={adminExamColumns}
        data={tableData}
        title="All Exams"
        description="Browse and manage all available exams"
        filterPlaceholder="Search exams..."
        filterKey="display_name"
        actionButton={
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Exam
          </Button>
        }
        onRowClick={(exam) => {
          router.push(`/admin/content/exams/${exam.id}`);
        }}
      />

      {/* Create Exam Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Exam</DialogTitle>
            <DialogDescription>
              Set up a new exam structure
            </DialogDescription>
          </DialogHeader>
          <ExamDialogForm
            onSubmit={handleCreateExam}
            onCancel={() => setShowCreateDialog(false)}
            submitLabel="Create Exam"
            loading={loading}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Exam Dialog */}
      <Dialog open={!!editingExam} onOpenChange={(open) => !open && setEditingExam(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Exam</DialogTitle>
            <DialogDescription>
              Update the exam details
            </DialogDescription>
          </DialogHeader>
          {editingExam && (
            <ExamDialogForm
              initialData={{
                name: editingExam.name,
                display_name: editingExam.display_name,
                description: editingExam.description || '',
                duration_minutes: editingExam.duration_minutes?.toString() || '',
                total_score: editingExam.total_score || 0,
                is_active: editingExam.is_active,
              }}
              onSubmit={handleUpdateExam}
              onCancel={() => setEditingExam(null)}
              submitLabel="Update Exam"
              loading={loading}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}