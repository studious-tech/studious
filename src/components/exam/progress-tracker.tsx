// components/exam/progress-tracker.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  MessageSquare,
  Headphones,
  PenTool,
  Calendar,
  TrendingUp,
} from 'lucide-react';
import { ExamService } from '@/lib/exam-service';
import { UserProgress } from '@/lib/interfaces';

const sectionIcons = {
  'pte-speaking': MessageSquare,
  'pte-writing': PenTool,
  'pte-reading': BookOpen,
  'pte-listening': Headphones,
  'ielts-speaking': MessageSquare,
  'ielts-writing': PenTool,
  'ielts-reading': BookOpen,
  'ielts-listening': Headphones,
};

const sectionColors = {
  'pte-speaking': 'text-orange-600',
  'pte-writing': 'text-green-600',
  'pte-reading': 'text-blue-600',
  'pte-listening': 'text-purple-600',
  'ielts-speaking': 'text-orange-600',
  'ielts-writing': 'text-green-600',
  'ielts-reading': 'text-blue-600',
  'ielts-listening': 'text-purple-600',
};

export function ProgressTracker({ examId }: { examId: string }) {
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        // In a real implementation, we would get the user ID from auth
        // For now, we'll use a placeholder
        const progress = {} as any;
        setUserProgress(progress);
      } catch (error) {
        console.error('Failed to fetch progress:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [examId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        Loading progress...
      </div>
    );
  }

  return (
    <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center text-gray-900 dark:text-white">
          <TrendingUp className="mr-2 h-5 w-5 text-blue-600" />
          Your Progress
        </CardTitle>
        <CardDescription className="text-gray-500 dark:text-gray-400">
          Track your performance in{' '}
          {examId.toUpperCase().replace('-ACADEMIC', '')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {userProgress.length > 0 ? (
          userProgress.map((progress) => {
            // We would normally get section info from the database
            // For now, we'll use the section ID to get the icon and color
            const Icon =
              sectionIcons[progress.section_id as keyof typeof sectionIcons] ||
              BookOpen;
            const color =
              sectionColors[
                progress.section_id as keyof typeof sectionColors
              ] || 'text-gray-600';

            // Calculate accuracy percentage
            const accuracy =
              progress.questions_attempted > 0
                ? Math.round(
                    (progress.questions_correct /
                      progress.questions_attempted) *
                      100
                  )
                : 0;

            return (
              <div key={progress.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mr-3">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3
                        className={`font-medium text-gray-900 dark:text-white capitalize ${color}`}
                      >
                        {progress.section_id
                          ?.replace(`${examId}-`, '')
                          .replace('-', ' ') || 'Section'}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {progress.questions_attempted} questions attempted
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {accuracy}%
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Accuracy
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={accuracy} className="flex-1" />
                  <span className="text-sm text-gray-500 dark:text-gray-400 w-10">
                    {accuracy}%
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Streak: {progress.current_streak_days} days</span>
                  <span>Time: {progress.total_time_spent_minutes} min</span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No progress data available yet. Start practicing to track your
            progress!
          </div>
        )}
      </CardContent>
    </Card>
  );
}
