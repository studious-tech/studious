import { create } from 'zustand';

export interface Course {
  id: string;
  exam_id: string;
  name: string;
  display_name: string;
  description: string;
  thumbnail_media_id: string | null;
  difficulty_level: number;
  duration_minutes: number | null;
  is_active: boolean;
  is_premium: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  exam?: {
    id: string;
    name: string;
    display_name: string;
  };
  modules?: Module[];
  materials?: Material[];
}

export interface Module {
  id: string;
  course_id: string;
  name: string;
  display_name: string;
  description: string;
  duration_minutes: number | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  videos?: Video[];
}

export interface Video {
  id: string;
  module_id: string;
  name: string;
  display_name: string;
  description: string;
  video_type: 'upload' | 'youtube';
  video_url: string | null;
  video_media_id: string | null;
  thumbnail_media_id: string | null;
  duration_seconds: number | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Material {
  id: string;
  course_id: string;
  name: string;
  display_name: string;
  description: string;
  file_media_id: string;
  file_type: string | null;
  file_size: number | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface CourseStore {
  // State
  courses: Course[];
  selectedCourse: Course | null;
  selectedModule: Module | null;
  loading: boolean;

  // Actions
  fetchCourses: () => Promise<void>;
  fetchCourse: (courseId: string) => Promise<void>;
  createCourse: (courseData: Partial<Course>) => Promise<void>;
  updateCourse: (
    courseId: string,
    courseData: Partial<Course>
  ) => Promise<void>;
  deleteCourse: (courseId: string) => Promise<void>;

  createModule: (
    courseId: string,
    moduleData: Partial<Module>
  ) => Promise<void>;
  updateModule: (
    moduleId: string,
    moduleData: Partial<Module>
  ) => Promise<void>;
  deleteModule: (moduleId: string) => Promise<void>;

  createVideo: (videoData: Partial<Video>) => Promise<void>;
  updateVideo: (videoId: string, videoData: Partial<Video>) => Promise<void>;
  deleteVideo: (videoId: string) => Promise<void>;

  createMaterial: (materialData: Partial<Material>) => Promise<void>;
  updateMaterial: (
    materialId: string,
    materialData: Partial<Material>
  ) => Promise<void>;
  deleteMaterial: (materialId: string) => Promise<void>;

  setSelectedCourse: (course: Course | null) => void;
  setSelectedModule: (module: Module | null) => void;
  clearSelections: () => void;
}

export const useCourseStore = create<CourseStore>((set, get) => ({
  // Initial state
  courses: [],
  selectedCourse: null,
  selectedModule: null,
  loading: false,

  // Fetch all courses
  fetchCourses: async () => {
    set({ loading: true });
    try {
      // Use admin endpoint to get full course details for admin panel
      const response = await fetch('/api/admin/courses');
      if (response.ok) {
        const courses = await response.json();
        set({ courses, loading: false });
      } else {
        console.error('Failed to fetch courses');
        set({ loading: false });
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      set({ loading: false });
    }
  },

  // Fetch single course with full details
  fetchCourse: async (courseId: string) => {
    set({ loading: true });
    try {
      // Use admin endpoint to get full course details for admin panel
      const response = await fetch(`/api/admin/courses/${courseId}`);
      if (response.ok) {
        const course = await response.json();
        set({ selectedCourse: course, loading: false });
      } else {
        console.error('Failed to fetch course');
        set({ loading: false });
      }
    } catch (error) {
      console.error('Failed to fetch course:', error);
      set({ loading: false });
    }
  },

  // Create new course (admin only)
  createCourse: async (courseData) => {
    try {
      const response = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courseData),
      });

      if (response.ok) {
        const newCourse = await response.json();
        const { courses } = get();
        set({ courses: [newCourse, ...courses] });
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create course');
      }
    } catch (error) {
      console.error('Failed to create course:', error);
      throw error;
    }
  },

  // Update course
  updateCourse: async (courseId, courseData) => {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courseData),
      });

      if (response.ok) {
        const updatedCourse = await response.json();
        const { courses } = get();
        set({
          courses: courses.map((course) =>
            course.id === courseId ? updatedCourse : course
          ),
          selectedCourse: updatedCourse,
        });
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update course');
      }
    } catch (error) {
      console.error('Failed to update course:', error);
      throw error;
    }
  },

  // Delete course
  deleteCourse: async (courseId) => {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const { courses } = get();
        set({
          courses: courses.filter((course) => course.id !== courseId),
          selectedCourse: null,
        });
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete course');
      }
    } catch (error) {
      console.error('Failed to delete course:', error);
      throw error;
    }
  },

  // Create module
  createModule: async (courseId, moduleData) => {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}/modules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...moduleData, course_id: courseId }),
      });

      if (response.ok) {
        // Refresh the selected course to show new module
        const { selectedCourse } = get();
        if (selectedCourse) {
          await get().fetchCourse(selectedCourse.id);
        }
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create module');
      }
    } catch (error) {
      console.error('Failed to create module:', error);
      throw error;
    }
  },

  // Update module
  updateModule: async (moduleId, moduleData) => {
    try {
      // Extract course_id from moduleId (format: course_id-module_name)
      const courseId = moduleId.split('-')[0];

      const response = await fetch(
        `/api/admin/courses/${courseId}/modules/${moduleId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(moduleData),
        }
      );

      if (response.ok) {
        // Refresh the selected course
        const { selectedCourse } = get();
        if (selectedCourse) {
          await get().fetchCourse(selectedCourse.id);
        }
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update module');
      }
    } catch (error) {
      console.error('Failed to update module:', error);
      throw error;
    }
  },

  // Delete module
  deleteModule: async (moduleId) => {
    try {
      // Extract course_id from moduleId (format: course_id-module_name)
      const courseId = moduleId.split('-')[0];

      const response = await fetch(
        `/api/admin/courses/${courseId}/modules/${moduleId}`,
        {
          method: 'DELETE',
        }
      );

      if (response.ok) {
        // Refresh the selected course
        const { selectedCourse } = get();
        if (selectedCourse) {
          await get().fetchCourse(selectedCourse.id);
        }
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete module');
      }
    } catch (error) {
      console.error('Failed to delete module:', error);
      throw error;
    }
  },

  // Create video
  createVideo: async (videoData) => {
    try {
      const { module_id } = videoData;
      if (!module_id) {
        throw new Error('module_id is required');
      }

      // Extract course_id from module_id (format: course_id-module_name)
      const courseId = module_id.split('-')[0];

      const response = await fetch(`/api/admin/courses/${courseId}/videos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(videoData),
      });

      if (response.ok) {
        // Refresh the selected course to show new video
        const { selectedCourse } = get();
        if (selectedCourse) {
          await get().fetchCourse(selectedCourse.id);
        }
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create video');
      }
    } catch (error) {
      console.error('Failed to create video:', error);
      throw error;
    }
  },

  // Update video
  updateVideo: async (videoId, videoData) => {
    try {
      // Extract module_id from videoId (format: module_id-video_name)
      const moduleId = videoId.split('-')[0];
      // Extract course_id from module_id (format: course_id-module_name)
      const courseId = moduleId.split('-')[0];

      const response = await fetch(
        `/api/admin/courses/${courseId}/videos/${videoId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(videoData),
        }
      );

      if (response.ok) {
        // Refresh the selected course
        const { selectedCourse } = get();
        if (selectedCourse) {
          await get().fetchCourse(selectedCourse.id);
        }
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update video');
      }
    } catch (error) {
      console.error('Failed to update video:', error);
      throw error;
    }
  },

  // Delete video
  deleteVideo: async (videoId) => {
    try {
      // Extract module_id from videoId (format: module_id-video_name)
      const moduleId = videoId.split('-')[0];
      // Extract course_id from module_id (format: course_id-module_name)
      const courseId = moduleId.split('-')[0];

      const response = await fetch(
        `/api/admin/courses/${courseId}/videos/${videoId}`,
        {
          method: 'DELETE',
        }
      );

      if (response.ok) {
        // Refresh the selected course
        const { selectedCourse } = get();
        if (selectedCourse) {
          await get().fetchCourse(selectedCourse.id);
        }
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete video');
      }
    } catch (error) {
      console.error('Failed to delete video:', error);
      throw error;
    }
  },

  // Create material
  createMaterial: async (materialData) => {
    try {
      const { course_id } = materialData;
      if (!course_id) {
        throw new Error('course_id is required');
      }

      const response = await fetch(
        `/api/admin/courses/${course_id}/materials`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(materialData),
        }
      );

      if (response.ok) {
        // Refresh the selected course to show new material
        const { selectedCourse } = get();
        if (selectedCourse) {
          await get().fetchCourse(selectedCourse.id);
        }
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create material');
      }
    } catch (error) {
      console.error('Failed to create material:', error);
      throw error;
    }
  },

  // Update material
  updateMaterial: async (materialId, materialData) => {
    try {
      // Extract course_id from materialId (format: course_id-material_name)
      const courseId = materialId.split('-')[0];

      const response = await fetch(
        `/api/admin/courses/${courseId}/materials/${materialId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(materialData),
        }
      );

      if (response.ok) {
        // Refresh the selected course
        const { selectedCourse } = get();
        if (selectedCourse) {
          await get().fetchCourse(selectedCourse.id);
        }
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update material');
      }
    } catch (error) {
      console.error('Failed to update material:', error);
      throw error;
    }
  },

  // Delete material
  deleteMaterial: async (materialId) => {
    try {
      // Extract course_id from materialId (format: course_id-material_name)
      const courseId = materialId.split('-')[0];

      const response = await fetch(
        `/api/admin/courses/${courseId}/materials/${materialId}`,
        {
          method: 'DELETE',
        }
      );

      if (response.ok) {
        // Refresh the selected course
        const { selectedCourse } = get();
        if (selectedCourse) {
          await get().fetchCourse(selectedCourse.id);
        }
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete material');
      }
    } catch (error) {
      console.error('Failed to delete material:', error);
      throw error;
    }
  },

  // Setters
  setSelectedCourse: (course) => set({ selectedCourse: course }),
  setSelectedModule: (module) => set({ selectedModule: module }),

  // Clear all selections
  clearSelections: () =>
    set({
      selectedCourse: null,
      selectedModule: null,
    }),
}));
