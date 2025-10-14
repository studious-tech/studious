'use client';

import { create } from 'zustand';
import { Course } from './course';

interface UserCourseState {
  courses: Course[];
  enrolledCourses: Course[];
  currentCourse: Course | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchCourses: () => Promise<void>;
  fetchEnrolledCourses: () => Promise<void>;
  getCourseById: (courseId: string) => Promise<Course | null>;
  enrollInCourse: (courseId: string) => Promise<boolean>;
  isEnrolledInCourse: (courseId: string) => Promise<boolean>;
  setCurrentCourse: (course: Course | null) => void;
  clearError: () => void;
}

export const useUserCourseStore = create<UserCourseState>((set, get) => ({
  courses: [],
  enrolledCourses: [],
  currentCourse: null,
  loading: false,
  error: null,

  fetchCourses: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/courses');
      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }
      const courses = await response.json();
      set({ courses, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch courses', 
        loading: false 
      });
    }
  },

  fetchEnrolledCourses: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/user/courses/enrolled');
      if (!response.ok) {
        // If endpoint doesn't exist, fallback to showing all courses
        set({ enrolledCourses: [], loading: false });
        return;
      }
      const enrolledCourses = await response.json();
      set({ enrolledCourses, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch enrolled courses', 
        loading: false 
      });
    }
  },

  getCourseById: async (courseId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/courses/${courseId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch course details');
      }
      const course = await response.json();
      set({ currentCourse: course, loading: false });
      return course;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch course details', 
        loading: false 
      });
      return null;
    }
  },

  enrollInCourse: async (courseId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/user/courses/${courseId}/enroll`, {
        method: 'POST',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to enroll in course');
      }
      
      // Refresh enrolled courses immediately after successful enrollment
      await get().fetchEnrolledCourses();
      set({ loading: false });
      return true;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to enroll in course', 
        loading: false 
      });
      return false;
    }
  },

  isEnrolledInCourse: async (courseId: string) => {
    try {
      const response = await fetch(`/api/user/courses/${courseId}/enrollment-status`);
      if (!response.ok) {
        return false;
      }
      const data = await response.json();
      return data.is_enrolled || false;
    } catch (error) {
      console.error('Failed to check enrollment status:', error);
      return false;
    }
  },

  setCurrentCourse: (course) => {
    set({ currentCourse: course });
  },

  clearError: () => {
    set({ error: null });
  },
}));;