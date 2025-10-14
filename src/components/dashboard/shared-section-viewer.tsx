'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Play, Clock, Trophy, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { Section } from '@/stores/exam';

interface SharedSectionViewerProps {
  section: Section;
  examId: string;
}

export function SharedSectionViewer({ section, examId }: SharedSectionViewerProps) {
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
        <h1 className="text-3xl font-bold">{section.display_name}</h1>
        <p className="text-muted-foreground mt-2">
          {section.description}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Section Overview</CardTitle>
          <CardDescription>
            Practice all question types in this section
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">Time Limit</span>
            <span>{section.duration_minutes || 0} minutes</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="font-medium">Question Types</span>
            <span>{section.question_types?.length || 0}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="font-medium">Total Questions</span>
            <span>
              {section.question_types?.reduce((acc: number, qt: any) => acc + (qt.question_count || 0), 0) || 0}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {section.question_types?.map((questionType: any) => (
          <Card key={questionType.id} className="flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className={`h-5 w-5 ${colors.text}`} />
                {questionType.display_name}
              </CardTitle>
              <CardDescription>
                {questionType.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span>Questions</span>
                <span>{questionType.question_count || 0}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{questionType.time_limit_seconds || 0}s per question</span>
                </div>
              </div>
              
              <Progress value={0} className="h-2" />
              
              <Button 
                className={`w-full ${colors.button} text-white mt-2`} 
                asChild
              >
                <Link href={`/${examId}/dashboard/practice/by-type/${questionType.id}`}>
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