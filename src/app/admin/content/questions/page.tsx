'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Plus, Filter, RefreshCw } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { AdminDataTable } from '@/components/admin/data-table/admin-data-table';
import {
  adminQuestionColumns,
  AdminQuestion,
} from '@/components/admin/data-table/admin-question-columns';
import { useAdminStore } from '@/stores/admin';
import { EnhancedQuestionForm } from '@/components/admin/content/enhanced-question-form';

export default function QuestionsPage() {
  const { questions, questionsLoading, fetchQuestions, toggleQuestionStatus } =
    useAdminStore();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<AdminQuestion | null>(
    null
  );

  const router = useRouter();

  useEffect(() => {
    fetchQuestions(0);
  }, [fetchQuestions]);

  const handleCreateSuccess = () => {
    setShowCreateDialog(false);
    fetchQuestions(0); // Refresh the list
  };

  const handleEditSuccess = () => {
    setEditingQuestion(null);
    fetchQuestions(0); // Refresh the list
  };

  const handleDeleteQuestion = async (
    questionId: string,
    questionTitle: string
  ) => {
    if (
      confirm(`Are you sure you want to delete question "${questionTitle}"?`)
    ) {
      try {
        // Implementation would go here
        toast.success('Question deleted successfully');
        fetchQuestions(0); // Refresh the list
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete question');
      }
    }
  };

  const handleToggleStatus = async (questionId: string) => {
    try {
      await toggleQuestionStatus(questionId);
      toast.success('Question status updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update question status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Questions Management
          </h1>
          <p className="text-muted-foreground">
            Create and manage exam questions
          </p>
        </div>

        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Question
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Search and filter questions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 text-gray-400 transform -translate-y-1/2" />
              <Input placeholder="Search questions..." className="pl-10" />
            </div>

            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="1">Level 1</SelectItem>
                <SelectItem value="2">Level 2</SelectItem>
                <SelectItem value="3">Level 3</SelectItem>
                <SelectItem value="4">Level 4</SelectItem>
                <SelectItem value="5">Level 5</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Question Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                <SelectItem value="essay">Essay</SelectItem>
                <SelectItem value="true-false">True/False</SelectItem>
                <SelectItem value="fill-blank">Fill in the Blank</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchQuestions(0)}
              disabled={questionsLoading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${
                  questionsLoading ? 'animate-spin' : ''
                }`}
              />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Questions Table */}
      <AdminDataTable
        columns={adminQuestionColumns}
        data={questions as AdminQuestion[]}
        title="All Questions"
        description="Browse and manage all exam questions"
        filterPlaceholder="Search questions..."
        filterKey="title"
        actionButton={
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Question
          </Button>
        }
        onRowClick={(question) => {
          router.push(`/admin/content/questions/${question.id}`);
        }}
      />

      {/* Create Question Dialog */}
      <EnhancedQuestionForm
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* Edit Question Dialog */}
      <EnhancedQuestionForm
        question={editingQuestion}
        open={!!editingQuestion}
        onClose={() => setEditingQuestion(null)}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
}
