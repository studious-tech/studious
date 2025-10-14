'use client';

import { useState, useEffect } from 'react';
import { useExamStore } from '@/stores/exam';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Save, 
  Loader2, 
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Eye,
  BookOpen,
  Clock,
  Users,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import React from 'react';
import { SectionDialogForm } from '@/components/admin/content/section-dialog-form';

interface SectionManagementProps {
  examId: string;
  onBack: () => void;
}

export function SectionManagement({ examId, onBack }: SectionManagementProps) {
  const { fetchExam, selectedExam, createSection, updateSection, deleteSection } = useExamStore();
  const [loading, setLoading] = useState(false);
  const [editingSection, setEditingSection] = useState<any>(null);
  const [showSectionForm, setShowSectionForm] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchExam(examId);
  }, [examId, fetchExam]);

  const handleCreateSection = async (sectionData: any) => {
    setLoading(true);
    try {
      const data = {
        ...sectionData,
        exam_id: examId,
      };
      await createSection(data);
      toast.success('Section created successfully');
      setShowSectionForm(false);
      await fetchExam(examId);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create section');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSection = async (sectionData: any) => {
    if (!editingSection) return;
    
    setLoading(true);
    try {
      await updateSection(editingSection.id, sectionData);
      toast.success('Section updated successfully');
      setEditingSection(null);
      await fetchExam(examId);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update section');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSection = async (sectionId: string, sectionName: string) => {
    if (confirm(`Are you sure you want to delete section "${sectionName}"? This will also delete all question types and questions within this section.`)) {
      try {
        await deleteSection(sectionId);
        toast.success('Section deleted successfully');
        await fetchExam(examId);
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete section');
      }
    }
  };

  const handleEditSection = (section: any) => {
    setEditingSection(section);
  };

  const handleViewSection = (sectionId: string) => {
    router.push(`/admin/content/exams/${examId}/sections/${sectionId}`);
  };

  const handleCreateQuestionType = (sectionId: string) => {
    router.push(`/admin/content/exams/${examId}/sections/${sectionId}/question-types/new`);
  };

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink className="cursor-pointer" onClick={() => router.push('/admin/content/exams')}>
              Exams
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink className="cursor-pointer" onClick={onBack}>
              {selectedExam?.display_name || 'Exam'}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Sections</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Exam Header */}
      {selectedExam && (
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
      )}

      {/* Sections Management */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Sections</h2>
          <Button onClick={() => setShowSectionForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Section
          </Button>
        </div>

        {(selectedExam?.sections?.length ?? 0) > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedExam?.sections
              ?.sort((a: any, b: any) => a.order_index - b.order_index)
              .map((section: any) => (
                <Card 
                  key={section.id} 
                  className="hover:shadow-md transition-shadow"
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
                        onClick={() => handleViewSection(section.id)}
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
                    
                    <div className="flex justify-between mt-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleCreateQuestionType(section.id)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Question Type
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <span className="h-4 w-4">⋯</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditSection(section)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Section
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleViewSection(section.id)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeleteSection(section.id, section.display_name)}
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

      {/* Create Section Dialog */}
      <Dialog open={showSectionForm} onOpenChange={setShowSectionForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Section</DialogTitle>
            <DialogDescription>
              Add a new section to organize your exam content
            </DialogDescription>
          </DialogHeader>
          <SectionDialogForm
            examSectionCount={selectedExam?.sections?.length || 0}
            onSubmit={handleCreateSection}
            onCancel={() => setShowSectionForm(false)}
            submitLabel="Create Section"
            loading={loading}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Section Dialog */}
      <Dialog open={!!editingSection} onOpenChange={(open) => !open && setEditingSection(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Section</DialogTitle>
            <DialogDescription>
              Update the section details
            </DialogDescription>
          </DialogHeader>
          {editingSection && (
            <SectionDialogForm
              initialData={{
                name: editingSection.name,
                display_name: editingSection.display_name,
                description: editingSection.description,
                duration_minutes: editingSection.duration_minutes?.toString() || '',
                order_index: editingSection.order_index,
                is_active: editingSection.is_active,
              }}
              onSubmit={handleUpdateSection}
              onCancel={() => setEditingSection(null)}
              submitLabel="Update Section"
              loading={loading}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}