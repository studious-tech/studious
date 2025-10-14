'use client';

import { useState } from 'react';
import { useExamStore } from '@/stores/exam';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from '@/components/ui/breadcrumb';
import { QuestionTypeForm } from '@/components/admin/content/question-type-form';
import React from 'react';

export default function CreateQuestionTypePage({ params }: { params: Promise<{ id: string; sectionId: string }> }) {
  const unwrappedParams = React.use(params);
  const { createQuestionType, fetchExam, selectedExam } = useExamStore();
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<any>(null);

  React.useEffect(() => {
    fetchExam(unwrappedParams.id);
  }, [unwrappedParams.id, fetchExam]);

  React.useEffect(() => {
    if (selectedExam && selectedExam.sections) {
      const section = selectedExam.sections.find((s: any) => s.id === unwrappedParams.sectionId);
      if (section) {
        setActiveSection(section);
      }
    }
  }, [selectedExam, unwrappedParams.sectionId]);

  const handleSubmit = async (questionTypeData: any) => {
    setLoading(true);
    
    try {
      await createQuestionType(questionTypeData);
      toast.success('Question type created successfully');
      window.location.href = `/admin/content/exams/${unwrappedParams.id}/sections/${unwrappedParams.sectionId}`;
    } catch (error: any) {
      toast.error(error.message || 'Failed to create question type');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    window.location.href = `/admin/content/exams/${unwrappedParams.id}/sections/${unwrappedParams.sectionId}`;
  };

  const handleBack = () => {
    window.location.href = `/admin/content/exams/${unwrappedParams.id}/sections/${unwrappedParams.sectionId}`;
  };

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink className="cursor-pointer" onClick={() => window.location.href = '/admin/content/exams'}>
              Exams
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink className="cursor-pointer" onClick={() => window.location.href = `/admin/content/exams/${unwrappedParams.id}`}>
              {selectedExam?.display_name || 'Exam'}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink className="cursor-pointer" onClick={handleBack}>
              {activeSection?.display_name || 'Section'}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Create Question Type</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <CardTitle>Create New Question Type</CardTitle>
              <CardDescription>Define a new type of question for this section</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <QuestionTypeForm
            sectionId={unwrappedParams.sectionId}
            examId={unwrappedParams.id}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={loading}
            asModal={false}
          />
        </CardContent>
      </Card>
    </div>
  );
}