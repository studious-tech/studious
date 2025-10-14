'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { useCourseStore } from '@/stores/course';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen,
  Play,
  Download,
  Lock,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { AdminDetailHeader, AdminDetailSection } from '@/components/admin/admin-detail-components';

interface CourseDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function AdminCourseDetailPage({
  params,
}: CourseDetailPageProps) {
  const { id } = React.use(params);
  const router = useRouter();
  const {
    selectedCourse,
    loading,
    fetchCourse,
    updateCourse,
    deleteCourse,
    createModule,
    updateModule,
    deleteModule,
    createVideo,
    updateVideo,
    deleteVideo,
    createMaterial,
    updateMaterial,
    deleteMaterial,
  } = useCourseStore();

  useEffect(() => {
    if (id) {
      fetchCourse(id);
    }
  }, [id, fetchCourse]);

  const handleUpdateCourse = async (courseData: any) => {
    try {
      await updateCourse(id, courseData);
      toast.success('Course updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update course');
    }
  };

  const handleDeleteCourse = async () => {
    if (
      confirm(
        `Are you sure you want to delete "${selectedCourse?.display_name}"? This will also delete all modules, videos, and materials.`
      )
    ) {
      try {
        await deleteCourse(id);
        toast.success('Course deleted successfully');
        router.push('/admin/content/courses');
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete course');
      }
    }
  };

  if (loading && !selectedCourse) {
    return (
      <div className="space-y-6">
        <AdminDetailHeader
          title="Loading..."
          breadcrumbs={[
            { label: 'Courses', href: '/admin/content/courses' },
            { label: 'Loading...' }
          ]}
          loading={true}
        />
      </div>
    );
  }

  if (!selectedCourse) {
    return (
      <div className="space-y-6">
        <AdminDetailHeader
          title="Course Not Found"
          breadcrumbs={[
            { label: 'Courses', href: '/admin/content/courses' },
            { label: 'Not Found' }
          ]}
          actions={[
            {
              label: 'Back to Courses',
              onClick: () => router.push('/admin/content/courses')
            }
          ]}
        />
        
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Course not found</h3>
            <p className="text-gray-500">The requested course could not be found.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminDetailHeader
        title={selectedCourse.display_name}
        subtitle={selectedCourse.name}
        breadcrumbs={[
          { label: 'Courses', href: '/admin/content/courses' },
          { label: selectedCourse.display_name }
        ]}
        status={selectedCourse.is_active ? 'active' : 'inactive'}
        actions={[
          {
            label: 'Edit Course',
            onClick: () => router.push(`/admin/content/courses/${selectedCourse.id}/edit`),
            variant: 'outline'
          }
        ]}
        onEdit={() => router.push(`/admin/content/courses/${selectedCourse.id}/edit`)}
        onDelete={handleDeleteCourse}
      />

      {/* Course Overview */}
      <AdminDetailSection title="Course Overview">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <h4 className="font-medium">Description</h4>
            <p className="text-muted-foreground">
              {selectedCourse.description || 'No description provided'}
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">Duration</h4>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>
                {selectedCourse.duration_minutes 
                  ? `${selectedCourse.duration_minutes} minutes` 
                  : 'Not set'}
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">Difficulty</h4>
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-3 h-3 rounded-full mr-1 ${i < selectedCourse.difficulty_level ? 'bg-primary' : 'bg-muted'}`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">Level {selectedCourse.difficulty_level}</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Status:</span>
            <Badge variant={selectedCourse.is_active ? 'default' : 'secondary'}>
              {selectedCourse.is_active ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          
          {selectedCourse.is_premium && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Access:</span>
              <Badge variant="outline" className="flex items-center gap-1">
                <Lock className="h-3 w-3" />
                Premium
              </Badge>
            </div>
          )}
        </div>
      </AdminDetailSection>

      {/* Modules and Materials Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AdminDetailSection 
          title="Modules"
          description="Course modules and videos"
          actions={[
            {
              label: 'Add Module',
              onClick: () => router.push(`/admin/content/courses/${selectedCourse.id}/modules/new`),
              variant: 'outline'
            }
          ]}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Total Modules</span>
              <Badge variant="outline">
                {selectedCourse.modules?.length || 0}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Total Videos</span>
              <Badge variant="outline">
                {selectedCourse.modules?.reduce((total, module) => 
                  total + (module.videos?.length || 0), 0) || 0}
              </Badge>
            </div>
          </div>
        </AdminDetailSection>

        <AdminDetailSection 
          title="Materials"
          description="Course materials and resources"
          actions={[
            {
              label: 'Add Material',
              onClick: () => router.push(`/admin/content/courses/${selectedCourse.id}/materials/new`),
              variant: 'outline'
            }
          ]}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Total Materials</span>
              <Badge variant="outline">
                {selectedCourse.materials?.length || 0}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Total Size</span>
              <Badge variant="outline">
                {selectedCourse.materials?.reduce((total, material) => 
                  total + (material.file_size || 0), 0) 
                  ? `${Math.round(selectedCourse.materials.reduce((total, material) => 
                      total + (material.file_size || 0), 0) / 1024)} KB`
                  : '0 KB'}
              </Badge>
            </div>
          </div>
        </AdminDetailSection>
      </div>
    </div>
  );
}