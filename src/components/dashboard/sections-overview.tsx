'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { FileText, Play, Clock, Trophy } from 'lucide-react';
import { useExamStore } from '@/stores/exam';
import Link from 'next/link';
import { useEffect } from 'react';

interface SectionsOverviewProps {
  examId: string;
}

export function SectionsOverview({ examId }: SectionsOverviewProps) {
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
        bg: 'bg-blue-50 dark:bg-blue-950/20',
        border: 'border-blue-200 dark:border-blue-800',
        text: 'text-blue-600 dark:text-blue-400',
        button: 'bg-blue-600 hover:bg-blue-700'
      };
    } else {
      return {
        bg: 'bg-orange-50 dark:bg-orange-950/20',
        border: 'border-orange-200 dark:border-orange-800',
        text: 'text-orange-600 dark:text-orange-400',
        button: 'bg-orange-600 hover:bg-orange-700'
      };
    }
  };

  const colors = getExamColor();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Exam Sections</h2>
          <p className="text-muted-foreground">
            Practice each section to improve your skills
          </p>
        </div>
        <Button asChild>
          <Link href={`/${examId}/dashboard/practice`}>
            <Play className="mr-2 h-4 w-4" />
            Start Practice
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {examSections.map((section) => (
          <Card key={section.id} className={`${colors.bg} ${colors.border} border`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className={`h-5 w-5 ${colors.text}`} />
                  {section.display_name}
                </CardTitle>
                <span className="text-sm text-muted-foreground">
                  {section.question_types?.length || 0} Question Types
                </span>
              </div>
              <CardDescription>
                {section.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span>Progress</span>
                <span>0%</span>
              </div>
              <Progress value={0} className="h-2" />
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{section.duration_minutes || 0} min</span>
                </div>
                <div className="flex items-center gap-1">
                  <Trophy className="h-4 w-4" />
                  <span>0/{section.question_types?.reduce((acc, qt) => acc + (qt.question_count || 0), 0) || 0} Questions</span>
                </div>
              </div>
              
              <Button 
                className={`w-full ${colors.button} text-white`} 
                asChild
              >
                <Link href={`/${examId}/dashboard/sections/${section.id}`}>
                  Practice Section
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}