'use client';

import { Course } from '@/stores/course';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Clock, 
  Play, 
  Users, 
  Star,
  Trophy,
  Lock,
  CheckCircle2
} from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface CourseCardProps {
  course: Course & {
    exam?: {
      name: string;
      display_name: string;
    };
    progress?: number;
    isEnrolled?: boolean;
    totalVideos?: number;
    completedVideos?: number;
  };
  onEnroll?: (courseId: string) => Promise<boolean>;
  examPath?: string; // 'ielts-academic' or 'pte-academic'
}

export function CourseCard({ course, onEnroll, examPath = 'ielts-academic' }: CourseCardProps) {
  const [isEnrolling, setIsEnrolling] = useState(false);
  const router = useRouter();

  const handleEnroll = async () => {
    if (!onEnroll) return;
    setIsEnrolling(true);
    try {
      await onEnroll(course.id);
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleStartCourse = () => {
    router.push(`/${examPath}/dashboard/courses/${course.id}`);
  };

  const getDifficultyColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 2: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 3: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 4: return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 5: return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getDifficultyText = (level: number) => {
    switch (level) {
      case 1: return 'Beginner';
      case 2: return 'Elementary';
      case 3: return 'Intermediate';
      case 4: return 'Upper Intermediate';
      case 5: return 'Advanced';
      default: return 'Unknown';
    }
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm hover:shadow-xl hover:scale-[1.02]">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
              {course.display_name}
            </CardTitle>
            <CardDescription className="mt-1 text-sm">
              {course.description || 'Comprehensive preparation course'}
            </CardDescription>
          </div>
          {course.is_premium && (
            <Badge variant="secondary" className="ml-2">
              <Trophy className="w-3 h-3 mr-1" />
              Premium
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-4 mt-3">
          <Badge className={`text-xs ${getDifficultyColor(course.difficulty_level || 3)}`}>
            {getDifficultyText(course.difficulty_level || 3)}
          </Badge>
          
          {course.exam && (
            <Badge variant="outline" className="text-xs">
              {course.exam.display_name}
            </Badge>
          )}

          {course.duration_minutes && (
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock className="w-3 h-3 mr-1" />
              {Math.round(course.duration_minutes / 60)}h
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Course Stats */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center text-muted-foreground">
              <BookOpen className="w-4 h-4 mr-2" />
              {course.totalVideos || 0} Videos
            </div>
            <div className="flex items-center text-muted-foreground">
              <Users className="w-4 h-4 mr-2" />
              0 Students
            </div>
          </div>

          {/* Progress Bar (if enrolled) */}
          {course.isEnrolled && typeof course.progress === 'number' && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{Math.round(course.progress)}%</span>
              </div>
              <Progress value={course.progress} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{course.completedVideos || 0} completed</span>
                <span>{course.totalVideos || 0} total</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2">
            {course.isEnrolled ? (
              <Button 
                onClick={handleStartCourse} 
                className="w-full"
                size="sm"
              >
                <Play className="w-4 h-4 mr-2" />
                {course.progress && course.progress > 0 ? 'Continue' : 'Start Course'}
              </Button>
            ) : (
              <div className="space-y-2">
                {course.is_premium ? (
                  <Button 
                    onClick={handleEnroll}
                    disabled={isEnrolling}
                    className="w-full"
                    size="sm"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    {isEnrolling ? 'Enrolling...' : 'Enroll Now'}
                  </Button>
                ) : (
                  <Button 
                    onClick={handleEnroll}
                    disabled={isEnrolling}
                    variant="default"
                    className="w-full"
                    size="sm"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    {isEnrolling ? 'Enrolling...' : 'Enroll Free'}
                  </Button>
                )}
                
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full"
                  onClick={() => router.push(`/${examPath}/dashboard/courses/${course.id}/preview`)}
                >
                  Preview Course
                </Button>
              </div>
            )}
          </div>

          {/* Course Status */}
          {course.isEnrolled && (
            <div className="flex justify-end pt-2 border-t">
              <Badge variant="secondary" className="text-xs">
                Enrolled
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}