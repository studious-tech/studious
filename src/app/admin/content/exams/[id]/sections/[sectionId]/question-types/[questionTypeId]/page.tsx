'use client';

import { useEffect, useState } from 'react';
import { useExamStore } from '@/stores/exam';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock,
  Plus,
  BookOpen,
  FileText,
  Settings,
  Edit,
  Trash2,
  MoreVertical,
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from '@/components/ui/breadcrumb';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { QuestionForm } from '@/components/admin/content/question-form';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import React from 'react';

export default function QuestionTypeDetailPage({ params }: { params: Promise<{ id: string; sectionId: string; questionTypeId: string }> }) {
  // Unwrap the params promise
  const unwrappedParams = React.use(params);
  const { fetchExam, selectedExam, deleteQuestion, fetchQuestions, loading } = useExamStore();
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [targetQuestionTypeId, setTargetQuestionTypeId] = useState<string>('');
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<any>(null);
  const [activeQuestionType, setActiveQuestionType] = useState<any>(null);

  useEffect(() => {
    fetchExam(unwrappedParams.id);
    setTargetQuestionTypeId(unwrappedParams.questionTypeId);
  }, [unwrappedParams.id, unwrappedParams.questionTypeId, fetchExam]);

  useEffect(() => {
    if (selectedExam && selectedExam.sections) {
      const section = selectedExam.sections.find((s: any) => s.id === unwrappedParams.sectionId);
      if (section) {
        setActiveSection(section);
        const questionType = section.question_types?.find((qt: any) => qt.id === unwrappedParams.questionTypeId);
        if (questionType) {
          setActiveQuestionType(questionType);
          // Load questions if not already loaded
          if (!questionType.questions) {
            fetchQuestions(unwrappedParams.questionTypeId);
          }
        }
      }
    }
  }, [selectedExam, unwrappedParams.sectionId, unwrappedParams.questionTypeId, fetchQuestions]);

  const handleDeleteQuestion = async (questionId: string, questionTitle: string) => {
    if (confirm(`Are you sure you want to delete question "${questionTitle}"?`)) {
      try {
        await deleteQuestion(questionId);
        toast.success('Question deleted successfully');
        // Refresh the exam data
        fetchExam(unwrappedParams.id);
      } catch (error) {
        toast.error('Failed to delete question');
      }
    }
  };

  const openQuestionForm = (questionTypeId: string, question?: any) => {
    setTargetQuestionTypeId(questionTypeId);
    setEditingQuestion(question || null);
    setShowQuestionForm(true);
  };

  const handleBackToExam = () => {
    router.push(`/admin/content/exams/${unwrappedParams.id}`);
  };

  const handleBackToSection = () => {
    router.push(`/admin/content/exams/${unwrappedParams.id}/sections/${unwrappedParams.sectionId}`);
  };

  const handleBackToQuestionTypes = () => {
    router.push(`/admin/content/exams/${unwrappedParams.id}/sections/${unwrappedParams.sectionId}`);
  };

  if (loading && !selectedExam) {
    return (
      <div className="space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink className="cursor-pointer" onClick={handleBackToExam}>
                Exams
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <Skeleton className="h-4 w-32" />
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <Skeleton className="h-4 w-32" />
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <Skeleton className="h-4 w-32" />
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96 mt-2" />
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-24" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-3 w-64 mt-1" />
                    <div className="flex items-center gap-3 text-xs mt-2">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!selectedExam || !activeSection || !activeQuestionType) {
    return (
      <div className="space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink className="cursor-pointer" onClick={handleBackToExam}>
                Exams
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink className="cursor-pointer" onClick={handleBackToSection}>
                {selectedExam?.display_name || 'Exam'}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink className="cursor-pointer" onClick={handleBackToQuestionTypes}>
                {activeSection?.display_name || 'Section'}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Question Type Not Found</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Question type not found</h3>
            <p className="text-gray-500">The requested question type could not be found.</p>
            <Button onClick={handleBackToSection} className="mt-4">
              Back to Section
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink className="cursor-pointer" onClick={handleBackToExam}>
              Exams
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink className="cursor-pointer" onClick={handleBackToSection}>
              {selectedExam.display_name}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink className="cursor-pointer" onClick={handleBackToQuestionTypes}>
              {activeSection.display_name}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{activeQuestionType.display_name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Question Type Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-3">
                {activeQuestionType.display_name}
                <Badge variant="outline">
                  #{activeQuestionType.order_index}
                </Badge>
                <Badge variant="secondary">
                  {activeQuestionType.scoring_method}
                </Badge>
              </CardTitle>
              <CardDescription>{activeQuestionType.description}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => openQuestionForm(activeQuestionType.id)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
              <Button variant="outline" onClick={() => {
                setEditingQuestion(null);
                openQuestionForm(activeQuestionType.id);
              }}>
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span className="font-medium">Input:</span>
              <Badge variant="outline">{activeQuestionType.input_type}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Response:</span>
              <Badge variant="outline">{activeQuestionType.response_type}</Badge>
            </div>
            {activeQuestionType.time_limit_seconds && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{activeQuestionType.time_limit_seconds}s time limit</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>{activeQuestionType.questions?.length || activeQuestionType.question_count || 0} questions</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Questions
                <Badge variant="secondary">
                  {activeQuestionType.questions?.length || activeQuestionType.question_count || 0}
                </Badge>
              </CardTitle>
              <CardDescription>
                Manage all questions in this question type
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activeQuestionType.questions?.length > 0 ? (
              activeQuestionType.questions.map((question: any) => (
                <div
                  key={question.id}
                  className="flex items-center justify-between p-4 bg-white border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="font-medium">{question.title}</h5>
                      <Badge variant="outline" className="text-xs">
                        Level {question.difficulty_level}
                      </Badge>
                      {!question.is_active && (
                        <Badge variant="secondary" className="text-xs">
                          Inactive
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {question.content}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
                      {question.expected_duration_seconds && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {question.expected_duration_seconds}s
                        </div>
                      )}
                      {question.question_media?.length > 0 && (
                        <div className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {question.question_media.length} media
                        </div>
                      )}
                      {question.question_options?.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Settings className="h-3 w-3" />
                          {question.question_options.length} options
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => 
                        openQuestionForm(activeQuestionType.id, question)
                      }>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Question
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => 
                          handleDeleteQuestion(question.id, question.title)
                        }
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Question
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No questions yet
                </h3>
                <p className="text-gray-500 mb-4">
                  Add your first question to get started
                </p>
                <Button onClick={() => openQuestionForm(activeQuestionType.id)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Question
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Question Form */}
      <QuestionForm
        question={editingQuestion}
        questionTypeId={targetQuestionTypeId}
        open={showQuestionForm}
        onClose={() => {
          setShowQuestionForm(false);
          setEditingQuestion(null);
          setTargetQuestionTypeId('');
        }}
        onSuccess={() => {
          setShowQuestionForm(false);
          setEditingQuestion(null);
          setTargetQuestionTypeId('');
          // Refresh the exam data
          fetchExam(unwrappedParams.id);
        }}
      />
    </div>
  );
}