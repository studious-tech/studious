'use client';

import { Card, CardContent } from '@/components/ui/card';
import { 
  BookOpen, 
  TrendingUp, 
  Clock, 
  Star,
  Users,
  Award,
  Target
} from 'lucide-react';
import { useUserCourseStore } from '@/stores/user-course';
import { useEffect } from 'react';

interface DashboardStatsProps {
  examId: string;
}

export function DashboardStats({ examId }: DashboardStatsProps) {
  const { courses, fetchCourses } = useUserCourseStore();

  // Fetch courses when component mounts
  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Filter courses for current exam
  const examCourses = courses.filter(course => course.exam?.id === examId);

  // Calculate total duration
  const totalDuration = examCourses.reduce((acc, course) => 
    acc + (course.duration_minutes || 0), 0
  );

  // Count premium courses
  const premiumCourses = examCourses.filter(course => course.is_premium);

  // Get appropriate color based on exam
  const getExamColor = () => {
    if (examId.includes('ielts')) {
      return 'text-blue-600';
    } else {
      return 'text-orange-600';
    }
  };

  const colorClass = getExamColor();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center">
            <BookOpen className={`w-8 h-8 ${colorClass} mr-3`} />
            <div>
              <p className="text-2xl font-bold">{examCourses.length}</p>
              <p className="text-sm text-muted-foreground">Total Courses</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center">
            <TrendingUp className={`w-8 h-8 ${colorClass} mr-3`} />
            <div>
              <p className="text-2xl font-bold">{premiumCourses.length}</p>
              <p className="text-sm text-muted-foreground">Premium Courses</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center">
            <Clock className={`w-8 h-8 ${colorClass} mr-3`} />
            <div>
              <p className="text-2xl font-bold">
                {Math.round(totalDuration / 60)}h
              </p>
              <p className="text-sm text-muted-foreground">Total Content</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center">
            <Target className={`w-8 h-8 ${colorClass} mr-3`} />
            <div>
              <p className="text-2xl font-bold">
                {examId.includes('ielts') ? '7.5' : '79'}
              </p>
              <p className="text-sm text-muted-foreground">Target Score</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}