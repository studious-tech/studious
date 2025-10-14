'use client';

import { useCourseStore } from '@/stores/course';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Clock,
  BookOpen,
  Play,
  FileText,
  Settings,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Plus,
  Lock,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useRouter } from 'next/navigation';

interface Course {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  is_active: boolean;
  is_premium: boolean;
  difficulty_level: number;
  duration_minutes?: number | null;
  modules?: Array<{
    id: string;
    videos?: Array<{
      id: string;
      is_active: boolean;
    }>;
  }>;
  materials?: Array<{
    id: string;
    is_active: boolean;
  }>;
}

interface CourseListProps {
  viewMode?: 'list' | 'grid';
  onSelectCourse?: (course: Course) => void;
  onEditCourse?: (course: Course) => void;
}

export function CourseList({
  viewMode = 'grid',
  onSelectCourse,
  onEditCourse,
}: CourseListProps) {
  const { courses, loading, fetchCourse, deleteCourse } = useCourseStore();
  const router = useRouter();

  const handleSelectCourse = async (course: Course) => {
    try {
      await fetchCourse(course.id);
      if (onSelectCourse) {
        onSelectCourse(course);
      } else {
        // Default navigation
        router.push(`/admin/content/courses/${course.id}`);
      }
    } catch {
      toast.error('Failed to load course details');
    }
  };

  const handleDeleteCourse = async (courseId: string, courseName: string) => {
    if (
      confirm(
        `Are you sure you want to delete "${courseName}"? This will also delete all modules, videos, and materials.`
      )
    ) {
      try {
        await deleteCourse(courseId);
        toast.success('Course deleted successfully');
      } catch {
        toast.error('Failed to delete course');
      }
    }
  };

  if (loading) {
    if (viewMode === 'list') {
      return (
        <div className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Content</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-12" />
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-8 w-8 ml-auto" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      );
    }

    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <div className="flex space-x-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (viewMode === 'list') {
    return (
      <div className="space-y-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Course</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Content</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.map((course) => (
              <TableRow key={course.id} className="hover:bg-gray-50">
                <TableCell>
                  <div className="font-medium">{course.display_name}</div>
                  <div className="text-sm text-gray-500">{course.name}</div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Badge variant={course.is_active ? 'default' : 'secondary'}>
                      {course.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    {course.is_premium && (
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        <Lock className="h-3 w-3" />
                        Premium
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {course.duration_minutes
                    ? `${course.duration_minutes}m`
                    : 'N/A'}
                </TableCell>
                <TableCell>
                  <div className="text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-3 w-3" />
                      <span>{course.modules?.length || 0} Modules</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Play className="h-3 w-3" />
                      <span>
                        {course.modules?.reduce(
                          (total, module) =>
                            total +
                            (module.videos?.filter((v) => v.is_active)
                              ?.length || 0),
                          0
                        ) || 0}{' '}
                        Videos
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <FileText className="h-3 w-3" />
                      <span>
                        {course.materials?.filter((m) => m.is_active)?.length ||
                          0}{' '}
                        Materials
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleSelectCourse(course)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Structure
                      </DropdownMenuItem>
                      {onEditCourse && (
                        <DropdownMenuItem onClick={() => onEditCourse(course)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Course
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() =>
                          handleDeleteCourse(course.id, course.display_name)
                        }
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {courses.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No courses found
            </h3>
            <p className="text-gray-500 mb-4">
              Get started by creating your first course
            </p>
            <Button onClick={() => router.push('/admin/content/courses/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Course
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => (
        <Card key={course.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{course.display_name}</CardTitle>
                <p className="text-sm text-gray-500 mt-1">{course.name}</p>
              </div>
              <div className="flex gap-1">
                <Badge variant={course.is_active ? 'default' : 'secondary'}>
                  {course.is_active ? 'Active' : 'Inactive'}
                </Badge>
                {course.is_premium && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Lock className="h-3 w-3" />
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600 line-clamp-2">
              {course.description || 'No description provided'}
            </p>

            <div className="flex flex-wrap gap-2">
              {course.duration_minutes && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {course.duration_minutes}m
                </Badge>
              )}

              <Badge variant="outline" className="flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                Lvl: {course.difficulty_level}
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="flex items-center text-gray-600">
                <BookOpen className="h-4 w-4 mr-2" />
                <span>{course.modules?.length || 0} Modules</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Play className="h-4 w-4 mr-2" />
                <span>
                  {course.modules?.reduce(
                    (total, module) =>
                      total +
                      (module.videos?.filter((v) => v.is_active)?.length || 0),
                    0
                  ) || 0}{' '}
                  Videos
                </span>
              </div>
              <div className="flex items-center text-gray-600">
                <FileText className="h-4 w-4 mr-2" />
                <span>
                  {course.materials?.filter((m) => m.is_active)?.length || 0}{' '}
                  Materials
                </span>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSelectCourse(course)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Manage
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleSelectCourse(course)}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Structure
                  </DropdownMenuItem>
                  {onEditCourse && (
                    <DropdownMenuItem onClick={() => onEditCourse(course)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Course
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() =>
                      handleDeleteCourse(course.id, course.display_name)
                    }
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>
      ))}

      {courses.length === 0 && (
        <div className="col-span-full">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No courses found
              </h3>
              <p className="text-gray-500 text-center mb-4">
                Get started by creating your first course
              </p>
              <Button onClick={() => router.push('/admin/content/courses/new')}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Course
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
