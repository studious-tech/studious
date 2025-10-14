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
  BarChart3,
  Users,
  Calendar,
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

interface Section {
  id: string;
  name: string;
  display_name: string;
  description: string;
  duration_minutes: number | null;
  order_index: number;
  is_active: boolean;
  question_types: QuestionType[];
}

interface Exam {
  id: string;
  name: string;
  display_name: string;
  description: string;
  duration_minutes: number | null;
  total_score: number;
  is_active: boolean;
  sections: Section[];
}

interface ExamDashboardProps {
  exam: Exam;
}

export function ExamDashboard({ exam }: ExamDashboardProps) {
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);

  // Reset selection when exam changes
  const handleBackToExam = () => {
    setSelectedSection(null);
  };

  // Calculate stats
  const totalSections = exam.sections?.length || 0;
  const totalQuestionTypes = exam.sections?.reduce(
    (total, section) => total + (section.question_types?.length || 0), 
    0
  ) || 0;
  
  const totalQuestions = exam.sections?.reduce(
    (total, section) => 
      total + (section.question_types?.reduce(
        (sectionTotal, qt) => sectionTotal + (qt.questions?.length || 0), 
        0
      ) || 0), 
    0
  ) || 0;

  if (selectedSection) {
    return (
      <SectionView 
        section={selectedSection} 
        onBack={handleBackToExam} 
        examId={exam.id}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Exam Header */}
      <div className="border-b pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{exam.display_name}</h1>
            <p className="text-gray-600 mt-2">{exam.description}</p>
          </div>
          <Badge variant="secondary" className="text-sm">
            {exam.is_active ? 'Active' : 'Inactive'}
          </Badge>
        </div>
        
        <div className="flex flex-wrap gap-6 mt-6">
          <div className="flex items-center text-gray-600">
            <BookOpen className="h-5 w-5 mr-2" />
            <span>{totalSections} Sections</span>
          </div>
          <div className="flex items-center text-gray-600">
            <FileText className="h-5 w-5 mr-2" />
            <span>{totalQuestionTypes} Question Types</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Target className="h-5 w-5 mr-2" />
            <span>{totalQuestions} Questions</span>
          </div>
          {exam.duration_minutes && (
            <div className="flex items-center text-gray-600">
              <Clock className="h-5 w-5 mr-2" />
              <span>{exam.duration_minutes} minutes</span>
            </div>
          )}
        </div>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="rounded-full bg-blue-100 p-3 mr-4">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Your Progress</p>
                <p className="text-2xl font-bold">65%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="rounded-full bg-green-100 p-3 mr-4">
                <Target className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg. Score</p>
                <p className="text-2xl font-bold">7.5</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="rounded-full bg-purple-100 p-3 mr-4">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Streak</p>
                <p className="text-2xl font-bold">7 days</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sections */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Sections</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {exam.sections
            ?.sort((a, b) => a.order_index - b.order_index)
            .map((section) => (
              <SectionCard 
                key={section.id} 
                section={section} 
                onSelect={setSelectedSection}
              />
            ))}
        </div>
      </div>
    </div>
  );
}

interface SectionCardProps {
  section: Section;
  onSelect: (section: Section) => void;
}

function SectionCard({ section, onSelect }: SectionCardProps) {
  const questionTypeCount = section.question_types?.length || 0;
  const questionCount = section.question_types?.reduce(
    (total, qt) => total + (qt.questions?.length || 0), 
    0
  ) || 0;

  return (
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-blue-500"
      onClick={() => onSelect(section)}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{section.display_name}</CardTitle>
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </div>
        {section.description && (
          <CardDescription className="mt-2 line-clamp-2">
            {section.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          {section.duration_minutes && (
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span>{section.duration_minutes}m</span>
            </div>
          )}
          <div className="flex items-center">
            <FileText className="h-4 w-4 mr-1" />
            <span>{questionTypeCount} types</span>
          </div>
          <div className="flex items-center">
            <Target className="h-4 w-4 mr-1" />
            <span>{questionCount} questions</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface SectionViewProps {
  section: Section;
  onBack: () => void;
  examId: string;
}

function SectionView({ section, onBack, examId }: SectionViewProps) {
  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="border-b pb-6">
        <Button 
          variant="ghost" 
          onClick={onBack} 
          className="mb-4 -ml-2"
        >
          ← Back to {examId === 'ielts-academic' ? 'IELTS' : 'PTE'} Dashboard
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{section.display_name}</h1>
            <p className="text-gray-600 mt-2">{section.description}</p>
          </div>
          <Badge variant="outline">
            Section #{section.order_index}
          </Badge>
        </div>
        
        <div className="flex flex-wrap gap-6 mt-6">
          <div className="flex items-center text-gray-600">
            <FileText className="h-5 w-5 mr-2" />
            <span>{section.question_types?.length || 0} Question Types</span>
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
        <h2 className="text-2xl font-bold text-gray-900">Question Types</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {section.question_types
            ?.sort((a, b) => a.order_index - b.order_index)
            .map((questionType) => (
              <QuestionTypeCard 
                key={questionType.id} 
                questionType={questionType}
                examId={examId}
                sectionId={section.id}
              />
            ))}
        </div>
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
    <Card className="hover:shadow-md transition-shadow border-l-4 border-green-500">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{questionType.display_name}</CardTitle>
          <Link href={`/${examId}/question-types/${questionType.id}`}>
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