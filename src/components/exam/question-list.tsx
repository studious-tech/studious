'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  FileText, 
  Play, 
  Volume2,
  Image as ImageIcon,
  BookOpen
} from 'lucide-react';
import Link from 'next/link';

interface Media {
  id: string;
  original_filename: string;
  file_type: string;
  mime_type: string;
  public_url: string;
  file_size: number;
}

interface QuestionMedia {
  id: string;
  media_role: string;
  media: Media;
}

interface QuestionOption {
  id: string;
  option_text: string;
  is_correct: boolean;
  display_order: number;
}

interface Question {
  id: string;
  title: string;
  content: string;
  instructions: string | null;
  difficulty_level: number;
  expected_duration_seconds: number | null;
  is_active: boolean;
  created_at: string;
  question_media: QuestionMedia[];
  question_options: QuestionOption[];
}

interface QuestionListProps {
  questions: Question[];
  examId: string;
  questionTypeId: string;
}

export function QuestionList({ questions, examId, questionTypeId }: QuestionListProps) {
  if (questions.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="h-10 w-10 text-gray-300 mx-auto mb-4" />
        <h3 className="text-base font-medium text-gray-900 mb-1">No questions available</h3>
        <p className="text-sm text-gray-500">There are no questions in this question type yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Questions</h2>
        <Badge variant="secondary" className="text-xs">
          {questions.length} questions
        </Badge>
      </div>
      
      <div className="grid gap-4">
        {questions.map((question) => (
          <QuestionCard 
            key={question.id} 
            question={question} 
            examId={examId}
          />
        ))}
      </div>
    </div>
  );
}

interface QuestionCardProps {
  question: Question;
  examId: string;
}

function QuestionCard({ question, examId }: QuestionCardProps) {
  const mediaCount = question.question_media?.length || 0;
  const optionCount = question.question_options?.length || 0;
  
  // Get difficulty label
  const difficultyLabels = ['Very Easy', 'Easy', 'Medium', 'Hard', 'Very Hard'];
  const difficultyLabel = difficultyLabels[question.difficulty_level - 1] || 'Medium';
  
  // Get media types
  const mediaTypes = [...new Set(
    question.question_media?.map(qm => qm.media.file_type) || []
  )];

  return (
    <Card className="border border-gray-200 hover:border-gray-300 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-base font-medium">
                {question.title || 'Untitled Question'}
              </CardTitle>
              <Badge variant="outline" className="text-xs">
                Level {question.difficulty_level}
              </Badge>
            </div>
            <CardDescription className="line-clamp-2 text-sm">
              {question.content.substring(0, 100)}{question.content.length > 100 ? '...' : ''}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Link href={`/${examId}/dashboard/practice/${question.id}`}>
              <Button size="sm" variant="outline" className="h-8 text-xs">
                <Play className="h-3 w-3 mr-1" />
                View
              </Button>
            </Link>
            <Link href={`/${examId}/dashboard/practice/exam/${question.id}`}>
              <Button size="sm" className="h-8 text-xs">
                <Play className="h-3 w-3 mr-1" />
                Attempt
              </Button>
            </Link>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3 text-xs text-gray-500">
          {question.expected_duration_seconds && (
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              <span>{question.expected_duration_seconds}s</span>
            </div>
          )}
          
          {mediaCount > 0 && (
            <div className="flex items-center">
              <FileText className="h-3 w-3 mr-1" />
              <span>{mediaCount} media</span>
            </div>
          )}
          
          {optionCount > 0 && (
            <div className="flex items-center">
              <BookOpen className="h-3 w-3 mr-1" />
              <span>{optionCount} options</span>
            </div>
          )}
          
          {mediaTypes.map((type) => (
            <div key={type} className="flex items-center">
              {type === 'audio' ? (
                <Volume2 className="h-3 w-3 mr-1" />
              ) : type === 'image' ? (
                <ImageIcon className="h-3 w-3 mr-1" />
              ) : (
                <FileText className="h-3 w-3 mr-1" />
              )}
              <span className="capitalize">{type}</span>
            </div>
          ))}
        </div>
        
        {question.instructions && (
          <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600">
            <span className="font-medium">Instructions:</span> {question.instructions}
          </div>
        )}
      </CardContent>
    </Card>
  );
}