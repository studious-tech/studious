'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { useCourseStore } from '@/stores/course';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Plus } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CourseDialogForm } from '@/components/admin/content/course-dialog-form';
import { toast } from 'sonner';
import { AdminDataTable } from '@/components/admin/data-table/admin-data-table';
import { adminCourseColumns, AdminCourse } from '@/components/admin/data-table/admin-course-columns';

export default function CoursesPage() {
  const { courses, loading, fetchCourses, createCourse, updateCourse } = useCourseStore();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingCourse, setEditingCourse] = useState<AdminCourse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleCreateCourse = async (courseData: any) => {
    setIsSubmitting(true);
    try {
      await createCourse(courseData);
      toast.success('Course created successfully');
      setShowCreateDialog(false);
      fetchCourses(); // Refresh the list
    } catch (error: any) {
      toast.error(error.message || 'Failed to create course');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateCourse = async (courseData: any) => {
    if (!editingCourse) return;
    
    setIsSubmitting(true);
    try {
      await updateCourse(editingCourse.id, courseData);
      toast.success('Course updated successfully');
      setEditingCourse(null);
      fetchCourses(); // Refresh the list
    } catch (error: any) {
      toast.error(error.message || 'Failed to update course');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Convert store course data to table data
  const tableData: AdminCourse[] = courses.map(course => ({
    id: course.id,
    exam_id: course.exam_id,
    name: course.name,
    display_name: course.display_name,
    description: course.description,
    thumbnail_media_id: course.thumbnail_media_id,
    difficulty_level: course.difficulty_level,
    duration_minutes: course.duration_minutes,
    is_active: course.is_active,
    is_premium: course.is_premium,
    sort_order: course.sort_order,
    created_at: course.created_at,
    updated_at: course.updated_at,
    exam: course.exam ? {
      id: course.exam.id,
      name: course.exam.name,
      display_name: course.exam.display_name,
    } : undefined,
    modules: course.modules?.map(module => ({
      id: module.id,
      name: module.name,
      display_name: module.display_name,
      is_active: module.is_active,
      videos: module.videos?.map(video => ({
        id: video.id,
        name: video.name,
        display_name: video.display_name,
        is_active: video.is_active,
      })) || [],
    })) || [],
    materials: course.materials?.map(material => ({
      id: material.id,
      name: material.name,
      display_name: material.display_name,
      file_type: material.file_type,
      file_size: material.file_size,
      is_active: material.is_active,
    })) || [],
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Course Management</h1>
          <p className="text-muted-foreground">
            Create and manage learning courses
          </p>
        </div>

        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Course
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center p-4">
            <div className="rounded-full bg-primary/10 p-3 mr-4">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Courses</p>
              <p className="text-2xl font-bold">{courses.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-4">
            <div className="rounded-full bg-green-100 p-3 mr-4 dark:bg-green-900">
              <BookOpen className="h-6 w-6 text-green-600 dark:text-green-300" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Courses</p>
              <p className="text-2xl font-bold">
                {courses.filter(c => c.is_active).length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-4">
            <div className="rounded-full bg-purple-100 p-3 mr-4 dark:bg-purple-900">
              <BookOpen className="h-6 w-6 text-purple-600 dark:text-purple-300" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Premium Courses</p>
              <p className="text-2xl font-bold">
                {courses.filter(c => c.is_premium).length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Courses Table */}
      <AdminDataTable
        columns={adminCourseColumns}
        data={tableData}
        title="All Courses"
        description="Browse and manage all available courses"
        filterPlaceholder="Search courses..."
        filterKey="display_name"
        actionButton={
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Course
          </Button>
        }
        onRowClick={(course) => {
          router.push(`/admin/content/courses/${course.id}`);
        }}
      />

      {/* Create Course Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-3xl md:min-w-3xl w-full max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Course</DialogTitle>
            <DialogDescription>
              Set up a new learning course
            </DialogDescription>
          </DialogHeader>
          <CourseDialogForm
            onSubmit={handleCreateCourse}
            onCancel={() => setShowCreateDialog(false)}
            submitLabel="Create Course"
            loading={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Course Dialog */}
      <Dialog open={!!editingCourse} onOpenChange={(open) => !open && setEditingCourse(null)}>
        <DialogContent className="max-w-3xl md:min-w-3xl w-full max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Course</DialogTitle>
            <DialogDescription>
              Update the course details
            </DialogDescription>
          </DialogHeader>
          {editingCourse && (
            <CourseDialogForm
              initialData={{
                exam_id: editingCourse.exam_id,
                name: editingCourse.name,
                display_name: editingCourse.display_name,
                description: editingCourse.description || undefined,
                thumbnail_media_id: editingCourse.thumbnail_media_id || undefined,
                difficulty_level: editingCourse.difficulty_level || 1,
                duration_minutes: editingCourse.duration_minutes || undefined,
                is_active: editingCourse.is_active,
                is_premium: editingCourse.is_premium,
                sort_order: editingCourse.sort_order || 0,
              }}
              onSubmit={handleUpdateCourse}
              onCancel={() => setEditingCourse(null)}
              submitLabel="Update Course"
              loading={isSubmitting}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}