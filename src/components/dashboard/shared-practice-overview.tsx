'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Play, Clock, Trophy, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { Section } from '@/stores/exam';
import { useEffect } from 'react';
import { useExamStore } from '@/stores/exam';

interface SharedPracticeOverviewProps {
  examId: string;
}

export function SharedPracticeOverview({ examId }: SharedPracticeOverviewProps) {
  const { selectedExam, fetchExam } = useExamStore();
  
  // Fetch exam data when component mounts
  useEffect(() => {
    fetchExam(examId);
  }, [examId, fetchExam]);
  
  // Filter sections for current exam
  const examSections = selectedExam?.sections?.filter(section => section.exam_id === examId) || [];

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
        <h1 className="text-3xl font-bold">Practice Mode</h1>
        <p className="text-muted-foreground mt-2">
          Select a section and question type to start practicing
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {examSections.map((section) => (
          <Card key={section.id} className="flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className={`h-5 w-5 ${colors.text}`} />
                {section.display_name}
              </CardTitle>
              <CardDescription>
                {section.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span>Question Types</span>
                <span>{section.question_types?.length || 0}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{section.duration_minutes || 0} min</span>
                </div>
                <div className="flex items-center gap-1">
                  <Trophy className="h-4 w-4" />
                  <span>
                    {section.question_types?.reduce((acc: number, qt: any) => acc + (qt.question_count || 0), 0) || 0} Questions
                  </span>
                </div>
              </div>
              
              <Progress value={0} className="h-2" />
              
              <Button 
                className={`w-full ${colors.button} text-white mt-2`} 
                asChild
              >
                <Link href={`/${examId}/dashboard/practice/section/${section.id}`}>
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