'use client';

import { useState } from 'react';
import { useExamStore } from '@/stores/exam';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SectionDialogForm } from './section-dialog-form';
import { QuestionTypeForm } from './question-type-form';
import { QuestionForm } from './question-form';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Clock,
  Plus,
  BookOpen,
  FileText,
  Settings,
  Edit,
  Trash2,
  MoreVertical,
  ArrowUp,
  ArrowDown,
  Eye,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export function ExamDetail() {
  const { selectedExam, deleteSection, deleteQuestionType, updateQuestionType, createQuestionType, deleteQuestion, fetchQuestions } = useExamStore();
  const [showSectionForm, setShowSectionForm] = useState(false);
  const [showQuestionTypeForm, setShowQuestionTypeForm] = useState(false);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingSection, setEditingSection] = useState<any>(null);
  const [editingQuestionType, setEditingQuestionType] = useState<any>(null);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [targetSectionId, setTargetSectionId] = useState<string>('');
  const [targetQuestionTypeId, setTargetQuestionTypeId] = useState<string>('');
  const [activeSection, setActiveSection] = useState<any>(null);
  const [activeQuestionType, setActiveQuestionType] = useState<any>(null);

  if (!selectedExam) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Select an exam to view its structure</p>
        </CardContent>
      </Card>
    );
  }

  const handleDeleteSection = async (sectionId: string, sectionName: string) => {
    if (confirm(`Are you sure you want to delete section "${sectionName}"?`)) {
      try {
        await deleteSection(sectionId);
        toast.success('Section deleted successfully');
      } catch (error) {
        toast.error('Failed to delete section');
      }
    }
  };

  const handleDeleteQuestionType = async (questionTypeId: string, questionTypeName: string) => {
    if (confirm(`Are you sure you want to delete question type "${questionTypeName}"?`)) {
      try {
        await deleteQuestionType(questionTypeId);
        toast.success('Question type deleted successfully');
      } catch (error) {
        toast.error('Failed to delete question type');
      }
    }
  };

  const handleDeleteQuestion = async (questionId: string, questionTitle: string) => {
    if (confirm(`Are you sure you want to delete question "${questionTitle}"?`)) {
      try {
        await deleteQuestion(questionId);
        toast.success('Question deleted successfully');
      } catch (error) {
        toast.error('Failed to delete question');
      }
    }
  };

  const openQuestionTypeForm = (sectionId: string, questionType?: any) => {
    setTargetSectionId(sectionId);
    setEditingQuestionType(questionType || null);
    setShowQuestionTypeForm(true);
  };

  const openQuestionForm = (questionTypeId: string, question?: any) => {
    setTargetQuestionTypeId(questionTypeId);
    setEditingQuestion(question || null);
    setShowQuestionForm(true);
  };

  const handleSelectSection = (section: any) => {
    setActiveSection(section);
  };

  const handleSelectQuestionType = (questionType: any) => {
    setActiveQuestionType(questionType);
  };

  const handleBackToExam = () => {
    setActiveSection(null);
    setActiveQuestionType(null);
  };

  const handleBackToSection = () => {
    setActiveQuestionType(null);
  };

  // If we're viewing a specific question type, show a focused view
  if (activeQuestionType) {
    return (
      <div className="space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink className="cursor-pointer" onClick={handleBackToExam}>
                {selectedExam.display_name}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink className="cursor-pointer" onClick={handleBackToSection}>
                {activeSection?.display_name}
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => 
                      openQuestionTypeForm(activeSection.id, activeQuestionType)
                    }>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Type
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => 
                        handleDeleteQuestionType(activeQuestionType.id, activeQuestionType.display_name)
                      }
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Type
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
          }}
        />
      </div>
    );
  }

  // If we're viewing a specific section, show section details
  if (activeSection) {
    return (
      <div className="space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink className="cursor-pointer" onClick={handleBackToExam}>
                {selectedExam.display_name}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{activeSection.display_name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Section Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-3">
                  {activeSection.display_name}
                  <Badge variant="outline">
                    #{activeSection.order_index}
                  </Badge>
                </CardTitle>
                <CardDescription>{activeSection.description}</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={() => openQuestionTypeForm(activeSection.id)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Question Type
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => {
                      setEditingSection(activeSection);
                      setShowSectionForm(true);
                    }}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Section
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => handleDeleteSection(activeSection.id, activeSection.display_name)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Section
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              {activeSection.duration_minutes && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{activeSection.duration_minutes} minutes</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span>{activeSection.question_types?.length || 0} question types</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Question Types */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  Question Types
                  <Badge variant="secondary">
                    {activeSection.question_types?.length || 0}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Manage question types in this section
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeSection.question_types?.length > 0 ? (
                activeSection.question_types
                  .sort((a: any, b: any) => a.order_index - b.order_index)
                  .map((questionType: any) => (
                    <Card 
                      key={questionType.id} 
                      className="border-l-4 border-blue-500 cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => {
                        setActiveQuestionType(questionType);
                        // Load questions if not already loaded
                        if (!questionType.questions) {
                          fetchQuestions(questionType.id);
                        }
                      }}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium text-base">{questionType.display_name}</h4>
                              <Badge variant="outline" className="text-xs">
                                #{questionType.order_index}
                              </Badge>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {questionType.scoring_method}
                            </Badge>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveQuestionType(questionType);
                              // Load questions if not already loaded
                              if (!questionType.questions) {
                                fetchQuestions(questionType.id);
                              }
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Input:</span>
                            <Badge variant="outline" className="text-xs">{questionType.input_type}</Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Response:</span>
                            <Badge variant="outline" className="text-xs">{questionType.response_type}</Badge>
                          </div>
                          {questionType.time_limit_seconds && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{questionType.time_limit_seconds}s</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            <span>{questionType.questions?.length || questionType.question_count || 0} questions</span>
                          </div>
                        </div>
                        
                        <div className="flex justify-end mt-3">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                className="h-8 w-8 p-0"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                openQuestionTypeForm(activeSection.id, questionType);
                              }}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Type
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                openQuestionForm(questionType.id);
                              }}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Question
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteQuestionType(questionType.id, questionType.display_name);
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Type
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardContent>
                    </Card>
                  ))
              ) : (
                <div className="col-span-full text-center py-12 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4" />
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
            </div>
          </CardContent>
        </Card>

        {/* Question Type Form Modal */}
        <QuestionTypeForm
          questionType={editingQuestionType}
          sectionId={targetSectionId}
          examId={selectedExam?.id}
          open={showQuestionTypeForm}
          onClose={() => {
            setShowQuestionTypeForm(false);
            setEditingQuestionType(null);
            setTargetSectionId('');
          }}
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
            } catch (error: any) {
              toast.error(error.message || 'Failed to save question type');
            }
          }}
          onCancel={() => {
            setShowQuestionTypeForm(false);
            setEditingQuestionType(null);
            setTargetSectionId('');
          }}
          loading={false}
          asModal={true}
        />
      </div>
    );
  }

  // Default view: Exam overview with sections
  return (
    <div className="space-y-6">
      {/* Exam Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-3">
                {selectedExam.display_name}
                <Badge variant={selectedExam.is_active ? 'default' : 'secondary'}>
                  {selectedExam.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </CardTitle>
              <CardDescription>{selectedExam.description}</CardDescription>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              {selectedExam.duration_minutes && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {selectedExam.duration_minutes}m
                </div>
              )}
              <div className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                Max: {selectedExam.total_score}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 text-sm text-gray-600">
            <span>{selectedExam.sections?.length || 0} Sections</span>
            <span>
              {selectedExam.sections?.reduce((total: number, section: any) => 
                total + (section.question_types?.length || 0), 0
              ) || 0} Question Types
            </span>
            <span>
              {selectedExam.sections?.reduce((total: number, section: any) => 
                total + (section.question_types?.reduce((qTotal: number, qt: any) => 
                  qTotal + (qt.question_count || 0), 0
                ) || 0), 0
              ) || 0} Questions
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Sections */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Sections</h2>
          <Button onClick={() => setShowSectionForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Section
          </Button>
        </div>

        {(selectedExam.sections?.length ?? 0) > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedExam.sections
              ?.sort((a: any, b: any) => a.order_index - b.order_index)
              .map((section: any) => (
                <Card 
                  key={section.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleSelectSection(section)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {section.display_name}
                          <Badge variant="outline" className="ml-2 text-xs">
                            #{section.order_index}
                          </Badge>
                        </CardTitle>
                        {section.description && (
                          <CardDescription className="mt-1 line-clamp-2">{section.description}</CardDescription>
                        )}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectSection(section);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-gray-600">
                      {section.duration_minutes && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{section.duration_minutes} minutes</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        <span>{section.question_types?.length || 0} question types</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-end mt-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            setEditingSection(section);
                            setShowSectionForm(true);
                          }}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Section
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            openQuestionTypeForm(section.id);
                          }}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Question Type
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <ArrowUp className="mr-2 h-4 w-4" />
                            Move Up
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <ArrowDown className="mr-2 h-4 w-4" />
                            Move Down
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSection(section.id, section.display_name);
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No sections yet
              </h3>
              <p className="text-gray-500 mb-4">
                Add sections to organize your exam content
              </p>
              <Button onClick={() => setShowSectionForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Section
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Forms */}
      <Dialog open={showSectionForm} onOpenChange={setShowSectionForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingSection ? "Edit Section" : "Create New Section"}</DialogTitle>
            <DialogDescription>
              {editingSection ? "Update the section details" : "Add a new section to organize your exam content"}
            </DialogDescription>
          </DialogHeader>
          <SectionDialogForm
            initialData={editingSection ? {
              name: editingSection.name,
              display_name: editingSection.display_name,
              description: editingSection.description,
              duration_minutes: editingSection.duration_minutes?.toString() || '',
              order_index: editingSection.order_index,
              is_active: editingSection.is_active,
            } : {}}
            examSectionCount={selectedExam?.sections?.length || 0}
            onSubmit={async (data) => {
              // Handle create or update
              if (editingSection) {
                // Update section
              } else {
                // Create section
              }
              setShowSectionForm(false);
              setEditingSection(null);
            }}
            onCancel={() => {
              setShowSectionForm(false);
              setEditingSection(null);
            }}
            submitLabel={editingSection ? "Update Section" : "Create Section"}
            loading={false}
          />
        </DialogContent>
      </Dialog>

      <QuestionTypeForm
        questionType={editingQuestionType}
        sectionId={targetSectionId}
        examId={selectedExam?.id}
        open={showQuestionTypeForm}
        onClose={() => {
          setShowQuestionTypeForm(false);
          setEditingQuestionType(null);
          setTargetSectionId('');
        }}
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
          } catch (error: any) {
            toast.error(error.message || 'Failed to save question type');
          }
        }}
        onCancel={() => {
          setShowQuestionTypeForm(false);
          setEditingQuestionType(null);
          setTargetSectionId('');
        }}
        loading={false}
        asModal={true}
      />

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
        }}
      />
    </div>
  );
}