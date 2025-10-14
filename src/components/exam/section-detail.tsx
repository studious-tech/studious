'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  Clock, 
  FileText, 
  ChevronRight,
  Target
} from 'lucide-react';
import Link from 'next/link';

interface QuestionType {
  id: string;
  name: string;
  display_name: string;
  description: string;
  input_type: string;
  response_type: string;
  scoring_method: string;
  time_limit_seconds: number | null;
  order_index: number;
  is_active: boolean;
  questions: { id: string }[];
}

interface Exam {
  display_name: string;
}

interface Section {
  id: string;
  name: string;
  display_name: string;
  description: string;
  duration_minutes: number | null;
  order_index: number;
  is_active: boolean;
  exams: Exam;
  question_types: QuestionType[];
}

interface SectionDetailProps {
  section: Section;
  examId: string;
}

export function SectionDetail({ section, examId }: SectionDetailProps) {
  // Calculate stats
  const questionTypeCount = section.question_types?.length || 0;
  const totalQuestions = section.question_types?.reduce(
    (total, qt) => total + (qt.questions?.length || 0), 
    0
  ) || 0;

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="border-b pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{section.display_name}</h1>
            <p className="text-gray-600 mt-2">
              {section.exams?.display_name} → {section.display_name}
            </p>
          </div>
          <Badge variant="outline">
            Section #{section.order_index}
          </Badge>
        </div>
        
        {section.description && (
          <p className="mt-4 text-gray-700">{section.description}</p>
        )}
        
        <div className="flex flex-wrap gap-6 mt-6">
          <div className="flex items-center text-gray-600">
            <FileText className="h-5 w-5 mr-2" />
            <span>{questionTypeCount} Question Types</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Target className="h-5 w-5 mr-2" />
            <span>{totalQuestions} Questions</span>
          </div>
          {section.duration_minutes && (
            <div className="flex items-center text-gray-600">
              <Clock className="h-5 w-5 mr-2" />
              <span>{section.duration_minutes} minutes</span>
            </div>
          )}
        </div>
      </div>

      {/* Question Types */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Question Types</h2>
          <Badge variant="secondary">{questionTypeCount} types</Badge>
        </div>
        
        {questionTypeCount === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No question types available</h3>
            <p className="text-gray-500">There are no question types in this section yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {section.question_types
              .sort((a, b) => a.order_index - b.order_index)
              .map((questionType) => (
                <QuestionTypeCard 
                  key={questionType.id} 
                  questionType={questionType}
                  examId={examId}
                  sectionId={section.id}
                />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface QuestionTypeCardProps {
  questionType: QuestionType;
  examId: string;
  sectionId: string;
}

function QuestionTypeCard({ questionType, examId, sectionId }: QuestionTypeCardProps) {
  const questionCount = questionType.questions?.length || 0;
  
  return (
    <Card className="hover:shadow-md transition-shadow border-l-4 border-blue-500">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{questionType.display_name}</CardTitle>
          <Link href={`/${examId}/dashboard/question-types/${questionType.id}`}>
            <Button variant="ghost" size="sm">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        {questionType.description && (
          <CardDescription className="mt-2 line-clamp-2">
            {questionType.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          <div className="flex items-center">
            <FileText className="h-4 w-4 mr-1" />
            <span>{questionCount} questions</span>
          </div>
          {questionType.time_limit_seconds && (
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span>{questionType.time_limit_seconds}s</span>
            </div>
          )}
          <Badge variant="secondary" className="text-xs">
            {questionType.scoring_method.replace('_', ' ')}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}