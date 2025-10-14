'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Clock, Play, Users, Star, Lock } from 'lucide-react';
import Link from 'next/link';
import { Course } from '@/stores/course';
import { useUserCourseStore } from '@/stores/user-course';
import { getThumbnailUrl } from '@/lib/media-utils';
import Image from 'next/image';

interface SharedCourseCardProps {
  course: Course & {
    isEnrolled: boolean;
    totalVideos: number;
  };
  examPath: string;
}

export function SharedCourseCard({ course, examPath }: SharedCourseCardProps) {
  const { enrollInCourse, loading, fetchEnrolledCourses } = useUserCourseStore();

  const handleEnrollClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const success = await enrollInCourse(course.id);
    if (success) {
      // State should automatically update through the store
      console.log('Enrollment successful, state should update automatically');
    }
  };
  // Get appropriate color based on exam
  const getExamColor = () => {
    if (examPath.includes('ielts')) {
      return {
        text: 'text-blue-600',
        border: 'border-blue-200',
        button: 'bg-blue-600 hover:bg-blue-700'
      };
    } else {
      return {
        text: 'text-orange-600',
        border: 'border-orange-200',
        button: 'bg-orange-600 hover:bg-orange-700'
      };
    }
  };

  const colors = getExamColor();

  // Get difficulty color
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

  const thumbnailUrl = getThumbnailUrl(course.thumbnail_media_id);

  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all hover:shadow-lg">
      {/* Course Thumbnail */}
      {thumbnailUrl ? (
        <div className="relative h-48 bg-gray-100">
          <Image
            src={thumbnailUrl}
            alt={course.display_name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {course.is_premium && (
            <div className="absolute top-3 right-3">
              <Badge variant="secondary" className="bg-black/70 text-white">
                Premium
              </Badge>
            </div>
          )}
        </div>
      ) : (
        <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
          <BookOpen className={`h-12 w-12 ${colors.text} opacity-50`} />
          {course.is_premium && (
            <div className="absolute top-3 right-3">
              <Badge variant="secondary">
                Premium
              </Badge>
            </div>
          )}
        </div>
      )}

      <CardHeader className="pb-4">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg">
              <span className="truncate">{course.display_name}</span>
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 space-y-4">
        <CardDescription className="line-clamp-2">
          {course.description || 'Comprehensive preparation course to help you achieve your target score.'}
        </CardDescription>

        <div className="flex flex-wrap gap-3 pt-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="h-4 w-4 mr-1.5" />
            <span>{Math.round((course.duration_minutes || 0) / 60)}h</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Play className="h-4 w-4 mr-1.5" />
            <span>{course.totalVideos} videos</span>
          </div>
          <Badge variant="outline" className={getDifficultyColor(course.difficulty_level)}>
            Level {course.difficulty_level}
          </Badge>
        </div>

        <div className="flex items-center text-sm text-muted-foreground pt-2">
          <Users className="h-4 w-4 mr-1.5" />
          <span>0 students</span>
          <div className="flex items-center ml-3">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
            <span>4.8</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex gap-3">
        {course.isEnrolled ? (
          <Button asChild className={`flex-1 ${colors.button} text-white`}>
            <Link href={`/${examPath}/dashboard/courses/${course.id}`}>
              <Play className="w-4 h-4 mr-2" />
              Continue Course
            </Link>
          </Button>
        ) : (
          <Button 
            onClick={handleEnrollClick}
            disabled={loading}
            className={`flex-1 ${colors.button} text-white`}
          >
            {course.is_premium && (
              <Lock className="w-4 h-4 mr-2" />
            )}
            {loading ? 'Enrolling...' : 'Enroll Now'}
          </Button>
        )}
        
        <Button variant="outline" asChild className="px-3">
          <Link href={`/${examPath}/dashboard/courses/${course.id}/preview`}>
            Preview
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}