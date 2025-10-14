'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CourseCard } from '@/components/common/course-card';
import { useUserCourseStore } from '@/stores/user-course';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { usePathname } from 'next/navigation';
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  BookOpen,
  TrendingUp,
  Clock,
  Star
} from 'lucide-react';

export function IELTSCourses() {
  const { 
    courses, 
    enrolledCourses, 
    loading, 
    error, 
    fetchCourses,
    fetchEnrolledCourses,
    clearError
  } = useUserCourseStore();

  const pathname = usePathname();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'difficulty' | 'duration'>('name');

  // Extract exam ID from pathname (e.g., /ielts-academic/dashboard/courses -> ielts-academic)
  const examId = pathname.split('/')[1];

  useEffect(() => {
    fetchCourses();
    fetchEnrolledCourses();
  }, [fetchCourses, fetchEnrolledCourses]);

  // Debug: Log courses to see exam structure
  useEffect(() => {
    if (courses.length > 0) {
      console.log('Available courses:', courses);
      console.log('Exam info for first course:', courses[0]?.exam);
      console.log('Current exam ID from URL:', examId);
    }
  }, [courses, examId]);

  // Filter courses for current exam (dynamic based on URL)
  const examCourses = courses.filter(course => 
    course.exam?.id === examId
  );

  // Apply search and filters
  const filteredCourses = examCourses.filter(course => {
    const matchesSearch = course.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = selectedDifficulty ? course.difficulty_level === selectedDifficulty : true;
    return matchesSearch && matchesDifficulty;
  });

  // Sort courses
  const sortedCourses = [...filteredCourses].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.display_name.localeCompare(b.display_name);
      case 'difficulty':
        return (a.difficulty_level || 3) - (b.difficulty_level || 3);
      case 'duration':
        return (a.duration_minutes || 0) - (b.duration_minutes || 0);
      default:
        return 0;
    }
  });

  const handleEnroll = async (courseId: string) => {
    // Enrollment functionality not implemented in store
    console.warn('Enrollment functionality not implemented');
    return false;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-64"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={clearError}>Try Again</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* View Mode Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <p className="text-muted-foreground">
            {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} available
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              {/* Difficulty Filter */}
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((level) => (
                  <Button
                    key={level}
                    variant={selectedDifficulty === level ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedDifficulty(selectedDifficulty === level ? null : level)}
                  >
                    Level {level}
                  </Button>
                ))}
              </div>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="name">Sort by Name</option>
                <option value="difficulty">Sort by Difficulty</option>
                <option value="duration">Sort by Duration</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Courses Grid */}
      {sortedCourses.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No courses found</h3>
              <p className="text-muted-foreground">
                {searchQuery || selectedDifficulty 
                  ? 'Try adjusting your search or filters' 
                  : 'No IELTS Academic courses are currently available'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className={`grid gap-6 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
            : 'grid-cols-1'
        }`}>
          {sortedCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={{
                ...course,
                isEnrolled: enrolledCourses.some(ec => ec.id === course.id),
                progress: Math.floor(Math.random() * 100), // TODO: Get real progress
                totalVideos: Math.floor(Math.random() * 50) + 10, // TODO: Get from modules
                completedVideos: Math.floor(Math.random() * 20), // TODO: Get real progress
              }}
            />
          ))}
        </div>
      )}

      {/* Course Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <BookOpen className="w-8 h-8 text-blue-600 mr-3" />
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
              <TrendingUp className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">{enrolledCourses.length}</p>
                <p className="text-sm text-muted-foreground">Enrolled</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-orange-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">
                  {Math.round(examCourses.reduce((acc, course) => acc + (course.duration_minutes || 0), 0) / 60)}h
                </p>
                <p className="text-sm text-muted-foreground">Total Content</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Star className="w-8 h-8 text-yellow-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">4.8</p>
                <p className="text-sm text-muted-foreground">Avg Rating</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}