'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, BookOpen, Play } from 'lucide-react';
import Link from 'next/link';

interface Question {
  id: string;
  title: string;
  content: string;
  difficulty_level: number;
  expected_duration_seconds?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Section {
  id: string;
  exam_id: string;
  name: string;
  display_name: string;
  description: string;
  duration_minutes: number;
  order_index: number;
  is_active: boolean;
  created_at: string;
}

interface Exam {
  id: string;
  name: string;
  display_name: string;
  description: string;
  duration_minutes: number;
  total_score: number;
  is_active: boolean;
  created_at: string;
}

interface QuestionTypeDetailProps {
  questionType: {
    id: string;
    section_id: string;
    name: string;
    display_name: string;
    description: string;
    input_type: string;
    response_type: string;
    scoring_method: string;
    time_limit_seconds: number;
    order_index: number;
    is_active: boolean;
    created_at: string;
    questions?: Question[];
    sections?: Section & { exams?: Exam };
  };
  examId: string;
}

export function QuestionTypeDetail({ questionType, examId }: QuestionTypeDetailProps) {
  // Get appropriate color based on exam
  const getExamColor = () => {
    if (examId.includes('ielts')) {
      return {
        text: 'text-blue-600',
        button: 'bg-blue-600 hover:bg-blue-700'
      };
    } else {
      return {
        text: 'text-orange-600',
        button: 'bg-orange-600 hover:bg-orange-700'
      };
    }
  };

  const colors = getExamColor();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{questionType.display_name}</h1>
        <p className="text-muted-foreground mt-2">
          {questionType.description}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Question Type Overview</CardTitle>
          <CardDescription>
            Practice all questions in this question type
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">Input Type</span>
            <span>{questionType.input_type}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="font-medium">Response Type</span>
            <span>{questionType.response_type}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="font-medium">Time Limit</span>
            <span>{questionType.time_limit_seconds || 0} seconds per question</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="font-medium">Total Questions</span>
            <span>{questionType.questions?.length || 0}</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {questionType.questions?.map((question) => (
          <Card key={question.id} className="flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className={`h-5 w-5 ${colors.text}`} />
                {question.title}
              </CardTitle>
              <CardDescription className="line-clamp-2">
                {question.content}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="secondary">
                  Level {question.difficulty_level}
                </Badge>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{question.expected_duration_seconds || 0}s</span>
                </div>
              </div>
              
              <Button 
                className={`w-full ${colors.button} text-white`} 
                asChild
              >
                <Link href={`/${examId}/dashboard/practice/by-type/${questionType.id}/${question.id}`}>
                  <Play className="w-4 h-4 mr-2" />
                  Start Practice
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}