'use client';

import { useEffect } from 'react';
import { useExamStore } from '@/stores/exam';
import { useUserCourseStore } from '@/stores/user-course';
import { DashboardStats } from './dashboard-stats';
import { SectionsOverview } from './sections-overview';

interface SharedDashboardProps {
  examId: string;
}

export function SharedDashboard({ examId }: SharedDashboardProps) {
  const { fetchCourses } = useUserCourseStore();

  useEffect(() => {
    // Fetch courses
    fetchCourses();
  }, [fetchCourses]);

  return (
    <div className="space-y-8">
      {/* Essential Stats Only */}
      <DashboardStats examId={examId} />
      
      {/* Main Content: Exam Sections */}
      <SectionsOverview examId={examId} />
    </div>
  );
}