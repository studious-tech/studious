import { create } from 'zustand';
import { createClient } from '@/supabase/client';
import { AdminMedia } from '@/components/admin/data-table/admin-media-columns';
import { AdminUser as AdminUserColumn } from '@/components/admin/data-table/admin-user-columns';

interface AdminQuestion {
  id: string;
  question_type_id: string;
  title: string | null;
  content: string | null;
  instructions: string | null;
  difficulty_level: number;
  expected_duration_seconds: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  question_media?: {
    id: string;
    media_role: string;
    display_order: number;
    media?: {
      original_filename: string;
      file_type: string;
      file_size: number;
      mime_type: string;
    };
  }[];
  question_options?: {
    id: string;
    option_text: string;
    option_media_id: string | null;
    is_correct: boolean;
    display_order: number;
  }[];
  question_types?: {
    id: string;
    display_name: string;
    sections?: {
      id: string;
      display_name: string;
      exams?: {
        id: string;
        display_name: string;
      };
    };
  };
}

interface AdminStats {
  total_users: number;
  active_users_today: number;
  total_questions: number;
  total_attempts_today: number;
  active_subscriptions: number;
  revenue_this_month: number;
  average_score_today: number;
  growth_metrics: {
    new_users_this_week: number;
    retention_rate: number;
    conversion_rate: number;
  };
}

export interface AdminUser {
  id: string;
  full_name: string | null;
  email: string;
  role: string;
  target_exam: string | null;
  target_score: number | null;
  created_at: string;
  updated_at: string;
  avatar_url?: string;
  subscription_status?: string;
}

interface MediaItem {
  id: string;
  original_filename: string | null;
  file_type: string;
  mime_type: string | null;
  file_size: number | null;
  storage_path: string;
  storage_bucket: string;
  public_url: string | null;
  duration_seconds: number | null;
  dimensions: { width: number; height: number } | null;
  alt_text: string | null;
  created_at: string;
  created_by: string;
}

interface AdminStore {
  // Stats
  stats: AdminStats | null;
  statsLoading: boolean;

  // Users
  users: AdminUser[];
  usersLoading: boolean;

  // Media
  media: AdminMedia[];
  mediaLoading: boolean;

  // Questions
  questions: AdminQuestion[];
  questionsLoading: boolean;
  selectedQuestion: AdminQuestion | null;
  selectedQuestionLoading: boolean;

  // Question Types
  questionTypes: any[];
  questionTypesLoading: boolean;

  // Actions
  fetchStats: () => Promise<void>;
  fetchUsers: (offset?: number) => Promise<void>;
  updateUserRole: (userId: string, role: string) => Promise<void>;
  fetchMedia: () => Promise<void>;
  uploadMedia: (file: File) => Promise<MediaItem>;
  deleteMedia: (mediaId: string) => Promise<void>;
  fetchQuestions: (offset?: number) => Promise<void>;
  fetchQuestionById: (id: string) => Promise<void>;
  createQuestion: (questionData: any) => Promise<AdminQuestion>;
  updateQuestion: (id: string, questionData: any) => Promise<void>;
  deleteQuestion: (id: string) => Promise<void>;
  toggleQuestionStatus: (id: string) => Promise<void>;

  fetchQuestionTypes: () => Promise<any[]>;
  createQuestionType: (questionTypeData: any) => Promise<void>;
  updateQuestionType: (id: string, questionTypeData: any) => Promise<void>;
  deleteQuestionType: (id: string) => Promise<void>;
}

export const useAdminStore = create<AdminStore>((set, get) => ({
  // Initial state
  stats: null,
  statsLoading: false,
  users: [],
  usersLoading: false,
  media: [],
  mediaLoading: false,
  questions: [],
  questionsLoading: false,
  selectedQuestion: null,
  selectedQuestionLoading: false,
  questionTypes: [],
  questionTypesLoading: false,

  // Fetch admin stats
  fetchStats: async () => {
    set({ statsLoading: true });
    try {
      const supabase = createClient();

      // Fetch basic counts that are likely to exist
      const [questionsResult] = await Promise.all([
        supabase.from('questions').select('*', { count: 'exact', head: true }),
      ]);

      // Create stats with default values
      const stats: AdminStats = {
        total_users: 0, // Default until we have proper user table access
        active_users_today: 0,
        total_questions: questionsResult.count || 0,
        total_attempts_today: 0,
        active_subscriptions: 0,
        revenue_this_month: 0,
        average_score_today: 0,
        growth_metrics: {
          new_users_this_week: 0,
          retention_rate: 0,
          conversion_rate: 0,
        },
      };

      set({ stats, statsLoading: false });
    } catch (error) {
      console.error('Failed to fetch stats:', error);

      // Set default stats even on error
      const defaultStats: AdminStats = {
        total_users: 0,
        active_users_today: 0,
        total_questions: 0,
        total_attempts_today: 0,
        active_subscriptions: 0,
        revenue_this_month: 0,
        average_score_today: 0,
        growth_metrics: {
          new_users_this_week: 0,
          retention_rate: 0,
          conversion_rate: 0,
        },
      };

      set({ stats: defaultStats, statsLoading: false });
    }
  },

  // Fetch users with pagination
  fetchUsers: async (offset = 0) => {
    set({ usersLoading: true });
    try {
      const supabase = createClient();

      // Try to fetch from auth.users table first, then fall back to a custom users table
      const { data: users, error } = await supabase.auth.admin.listUsers();
      let usersList: any = users;

      if (error || !users) {
        // Fallback to custom users table if auth table is not accessible
        const result = await supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: false });

        if (result.error) {
          console.error(
            'Failed to fetch users from custom table:',
            result.error
          );
          // Set empty users array on error
          set({ users: [], usersLoading: false });
          return;
        }

        usersList = { users: result.data || [] };
      }

      // Transform auth users to match our interface
      const transformedUsers = (usersList?.users || [])
        .slice(offset, offset + 20)
        .map((user: any) => ({
          id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || null,
          role: user.role || 'user',
          target_exam: user.user_metadata?.target_exam || null,
          target_score: user.user_metadata?.target_score || null,
          created_at: user.created_at,
          updated_at: user.updated_at || user.created_at,
          avatar_url: user.user_metadata?.avatar_url || null,
        }));

      set({ users: transformedUsers, usersLoading: false });
    } catch (error) {
      console.error('Failed to fetch users:', error);
      // Set empty users array on error
      set({ users: [], usersLoading: false });
    }
  },

  // Update user role
  updateUserRole: async (userId: string, role: string) => {
    try {
      const supabase = createClient();

      // Update user role in auth.users table
      const { data, error } = await supabase.auth.admin.updateUserById(userId, {
        role: role,
      });

      if (error) {
        throw new Error(error.message);
      }

      // Refresh users list
      await get().fetchUsers();
    } catch (error) {
      console.error('Failed to update user role:', error);
      throw error;
    }
  },

  // Fetch media files
  fetchMedia: async () => {
    set({ mediaLoading: true });
    try {
      const supabase = createClient();

      const { data: media, error } = await supabase
        .from('media')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to fetch media:', error);
        // Set empty media array on error
        set({ media: [], mediaLoading: false });
        return;
      }

      set({ media: media || [], mediaLoading: false });
    } catch (error) {
      console.error('Failed to fetch media:', error);
      // Set empty media array on error
      set({ media: [], mediaLoading: false });
    }
  },

  // Upload media file using the admin API
  uploadMedia: async (file: File) => {
    try {
      // Enhanced file details logging
      console.log('Upload attempt details:', {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        fileSizeInMB: (file.size / (1024 * 1024)).toFixed(2),
        lastModified: new Date(file.lastModified).toISOString()
      });

      // Validate file size (max 50MB)
      const maxSize = 50 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error('File size must be less than 50MB');
      }

      // Validate file type
      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        // Audio formats (comprehensive list)
        'audio/mpeg',        // MP3
        'audio/mp3',         // MP3 (alternate)
        'audio/wav',         // WAV
        'audio/wave',        // WAV (alternate)
        'audio/x-wav',       // WAV (alternate)
        'audio/webm',        // WebM Audio
        'audio/ogg',         // OGG
        'audio/mp4',         // MP4 Audio
        'audio/aac',         // AAC
        'audio/flac',        // FLAC
        'audio/x-flac',      // FLAC (alternate)
        'audio/m4a',         // M4A
        'video/mp4',
        'video/webm',
        'application/pdf',
      ];

      if (!allowedTypes.includes(file.type)) {
        console.error('File type validation failed:', {
          detectedType: file.type,
          allowedTypes: allowedTypes,
          isAudio: file.type.startsWith('audio/'),
          fileName: file.name,
          fileExtension: file.name.split('.').pop()
        });
        throw new Error(`File type "${file.type}" is not allowed. Detected type: ${file.type}`);
      }

      console.log('File type validation passed, proceeding with upload...');

      // Use the admin API for upload
      const formData = new FormData();
      formData.append('file', file);

      console.log('Sending request to /api/admin/media...');

      const response = await fetch('/api/admin/media', {
        method: 'POST',
        body: formData,
      });

      console.log('Response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('API response error:', error);
        throw new Error(error.error || 'Upload failed');
      }

      const media = await response.json();
      console.log('Upload successful:', media);

      // Refresh media list
      await get().fetchMedia();

      return media;
    } catch (error) {
      console.error('Upload failed with error:', {
        error: error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  },

  // Delete media file
  deleteMedia: async (mediaId: string) => {
    try {
      const supabase = createClient();

      // First, get the media item to get the storage path
      const { data: media, error: fetchError } = await supabase
        .from('media')
        .select('storage_path')
        .eq('id', mediaId)
        .single();

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      // Delete file from storage bucket
      const { error: deleteError } = await supabase.storage
        .from('media')
        .remove([media.storage_path]);

      if (deleteError) {
        throw new Error(deleteError.message);
      }

      // Delete metadata from database
      const { error: dbError } = await supabase
        .from('media')
        .delete()
        .eq('id', mediaId);

      if (dbError) {
        throw new Error(dbError.message);
      }

      // Refresh media list
      await get().fetchMedia();
    } catch (error) {
      console.error('Failed to delete media:', error);
      throw error;
    }
  },

  // Fetch all questions with pagination
  fetchQuestions: async (offset = 0) => {
    set({ questionsLoading: true });
    try {
      const supabase = createClient();

      // Fetch questions with related data
      const { data: questions, error } = await supabase
        .from('questions')
        .select(
          `
          *,
          question_types (
            id,
            display_name,
            sections (
              id,
              display_name,
              exams (
                id,
                display_name
              )
            )
          ),
          question_media (
            id,
            media_role,
            media (
              id,
              original_filename,
              file_type,
              file_size,
              mime_type
            )
          ),
          question_options (
            id,
            option_text,
            is_correct,
            display_order
          )
        `
        )
        .range(offset, offset + 19)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to fetch questions:', error);
        return;
      }

      set({ questions: questions || [], questionsLoading: false });
    } catch (error) {
      console.error('Failed to fetch questions:', error);
      set({ questionsLoading: false });
    }
  },

  // Fetch single question by ID
  fetchQuestionById: async (id: string) => {
    set({ selectedQuestionLoading: true });
    try {
      const supabase = createClient();

      // Fetch question with all related data
      const { data: question, error } = await supabase
        .from('questions')
        .select(
          `
          *,
          question_types (
            id,
            display_name,
            sections (
              id,
              display_name,
              exams (
                id,
                display_name
              )
            )
          ),
          question_media (
            id,
            media_role,
            media (
              id,
              original_filename,
              file_type,
              file_size,
              mime_type
            )
          ),
          question_options (
            id,
            option_text,
            is_correct,
            display_order
          )
        `
        )
        .eq('id', id)
        .single();

      if (error) {
        console.error('Failed to fetch question:', error);
        set({ selectedQuestion: null, selectedQuestionLoading: false });
        return;
      }

      set({ selectedQuestion: question, selectedQuestionLoading: false });
    } catch (error) {
      console.error('Failed to fetch question:', error);
      set({ selectedQuestion: null, selectedQuestionLoading: false });
    }
  },

  // Create new question
  createQuestion: async (questionData) => {
    try {
      const supabase = createClient();

      const { data: question, error } = await supabase
        .from('questions')
        .insert(questionData)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      // Refresh questions list
      await get().fetchQuestions(0);

      return question;
    } catch (error) {
      console.error('Failed to create question:', error);
      throw error;
    }
  },

  // Update question
  updateQuestion: async (id, questionData) => {
    try {
      const supabase = createClient();

      const { data: question, error } = await supabase
        .from('questions')
        .update(questionData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      // Refresh questions list
      await get().fetchQuestions(0);

      return question;
    } catch (error) {
      console.error('Failed to update question:', error);
      throw error;
    }
  },

  // Delete question
  deleteQuestion: async (id) => {
    try {
      const supabase = createClient();

      const { error } = await supabase.from('questions').delete().eq('id', id);

      if (error) {
        throw new Error(error.message);
      }

      // Refresh questions list
      await get().fetchQuestions(0);
    } catch (error) {
      console.error('Failed to delete question:', error);
      throw error;
    }
  },

  // Toggle question status
  toggleQuestionStatus: async (id) => {
    try {
      const supabase = createClient();

      // Get current question to determine new status
      const { data: question, error: fetchError } = await supabase
        .from('questions')
        .select('is_active')
        .eq('id', id)
        .single();

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      // Toggle the status
      const newStatus = !question.is_active;

      const { error } = await supabase
        .from('questions')
        .update({ is_active: newStatus })
        .eq('id', id);

      if (error) {
        throw new Error(error.message);
      }

      // Refresh questions list
      await get().fetchQuestions(0);
    } catch (error) {
      console.error('Failed to toggle question status:', error);
      throw error;
    }
  },

  // Fetch question types
  fetchQuestionTypes: async () => {
    set({ questionTypesLoading: true });
    try {
      const supabase = createClient();

      const { data: questionTypes, error } = await supabase
        .from('question_types')
        .select(
          `
          *,
          sections (
            id,
            display_name,
            exams (
              id,
              display_name
            )
          )
        `
        )
        .order('display_name');

      if (error) {
        console.error('Failed to fetch question types:', error);
        set({ questionTypesLoading: false });
        return [];
      }

      set({ questionTypes: questionTypes || [], questionTypesLoading: false });
      return questionTypes || [];
    } catch (error) {
      console.error('Failed to fetch question types:', error);
      set({ questionTypesLoading: false });
      return [];
    }
  },

  // Create new question type
  createQuestionType: async (questionTypeData) => {
    try {
      const response = await fetch('/api/admin/question-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(questionTypeData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create question type');
      }

      // Refresh question types list
      await get().fetchQuestionTypes();
    } catch (error) {
      console.error('Failed to create question type:', error);
      throw error;
    }
  },

  // Update question type
  updateQuestionType: async (id, questionTypeData) => {
    try {
      const response = await fetch(`/api/admin/question-types/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(questionTypeData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update question type');
      }

      // Refresh question types list
      await get().fetchQuestionTypes();
    } catch (error) {
      console.error('Failed to update question type:', error);
      throw error;
    }
  },

  // Delete question type
  deleteQuestionType: async (id) => {
    try {
      const response = await fetch(`/api/admin/question-types/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete question type');
      }

      // Refresh question types list
      await get().fetchQuestionTypes();
    } catch (error) {
      console.error('Failed to delete question type:', error);
      throw error;
    }
  },
}));
