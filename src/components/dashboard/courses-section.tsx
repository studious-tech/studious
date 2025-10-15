'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BookOpen,
  PlayCircle,
  Clock,
  Lock,
  ChevronRight,
  Loader2,
  GraduationCap,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface Course {
  id: string;
  name: string;
  display_name: string;
  description: string;
  thumbnail_media_id: string | null;
  difficulty_level: number;
  duration_minutes: number | null;
  is_premium: boolean;
  hasAccess: boolean;
  progress: number;
  totalModules: number;
  totalVideos: number;
}

interface CoursesSectionProps {
  examId: string;
  isCompact?: boolean;
}

export default function CoursesSection({
  examId,
  isCompact = false,
}: CoursesSectionProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch(`/api/courses/by-exam/${examId}`);
        if (!response.ok) throw new Error('Failed to fetch courses');
        const data = await response.json();
        setCourses(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, [examId]);

  const getDifficultyLabel = (level: number) => {
    const labels = ['Beginner', 'Elementary', 'Intermediate', 'Advanced', 'Expert'];
    return labels[level - 1] || 'Intermediate';
  };

  const getDifficultyColor = (level: number) => {
    const colors = [
      'bg-green-100 text-green-800',
      'bg-blue-100 text-blue-800',
      'bg-yellow-100 text-yellow-800',
      'bg-orange-100 text-orange-800',
      'bg-red-100 text-red-800',
    ];
    return colors[level - 1] || colors[2];
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        </CardContent>
      </Card>
    );
  }

  if (error || courses.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">
            {error || 'No courses available yet'}
          </p>
        </CardContent>
      </Card>
    );
  }

  const displayCourses = isCompact ? courses.slice(0, 3) : courses;

  return (
    <div className="space-y-4">
      {!isCompact && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Learning Courses</h2>
            <p className="text-muted-foreground">
              Structured courses to help you prepare effectively
            </p>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayCourses.map((course) => (
          <Card
            key={course.id}
            className="group hover:shadow-lg transition-all overflow-hidden"
          >
            {/* Thumbnail */}
            <div className="relative h-40 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-950/20 dark:to-indigo-950/20">
              {course.thumbnail_media_id ? (
                <Image
                  src={`/api/media/${course.thumbnail_media_id}`}
                  alt={course.display_name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <GraduationCap className="h-16 w-16 text-blue-600/30" />
                </div>
              )}

              {/* Premium Badge */}
              {course.is_premium && !course.hasAccess && (
                <div className="absolute top-3 right-3">
                  <Badge className="bg-amber-600 text-white">
                    <Lock className="h-3 w-3 mr-1" />
                    PRO
                  </Badge>
                </div>
              )}

              {/* Progress Badge */}
              {course.progress > 0 && (
                <div className="absolute top-3 left-3">
                  <Badge className="bg-green-600 text-white">
                    {Math.round(course.progress)}% Complete
                  </Badge>
                </div>
              )}
            </div>

            <CardContent className="p-4">
              {/* Title and Difficulty */}
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-base line-clamp-1 group-hover:text-blue-600 transition-colors">
                  {course.display_name}
                </h3>
                <Badge variant="outline" className={getDifficultyColor(course.difficulty_level)}>
                  {getDifficultyLabel(course.difficulty_level)}
                </Badge>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {course.description}
              </p>

              {/* Progress Bar */}
              {course.progress > 0 && (
                <div className="mb-3">
                  <Progress value={course.progress} className="h-1.5" />
                </div>
              )}

              {/* Course Info */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>{course.totalModules} modules</span>
                </div>
                <div className="flex items-center gap-1">
                  <PlayCircle className="h-3.5 w-3.5" />
                  <span>{course.totalVideos} videos</span>
                </div>
                {course.duration_minutes && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{Math.floor(course.duration_minutes / 60)}h</span>
                  </div>
                )}
              </div>

              {/* Action Button */}
              {course.hasAccess ? (
                <Button asChild className="w-full" size="sm">
                  <Link href={`/${examId}/dashboard/courses/${course.id}`}>
                    {course.progress > 0 ? 'Continue Learning' : 'Start Course'}
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <Button asChild variant="outline" className="w-full" size="sm">
                  <Link href="/subscription">
                    <Lock className="mr-2 h-4 w-4" />
                    Unlock with PRO
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {isCompact && courses.length > 3 && (
        <div className="text-center">
          <Button asChild variant="outline">
            <Link href={`/${examId}/dashboard/courses`}>
              View All {courses.length} Courses
              <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
