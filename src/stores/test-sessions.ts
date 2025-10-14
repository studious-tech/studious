import { create } from 'zustand';
import { createClient } from '@/supabase/client';

interface TestSessionQuestion {
  id: string;
  session_id: string;
  question_id: string;
  sequence_number: number;
  allocated_time_seconds: number | null;
  is_attempted: boolean;
  is_completed: boolean;
  time_spent_seconds: number;
  question_attempt_id: string | null;
  created_at: string;
  updated_at: string;
  questions: {
    id: string;
    question_type_id: string;
    title: string | null;
    content: string | null;
    instructions: string | null;
    difficulty_level: number;
    expected_duration_seconds: number | null;
    correct_answer: unknown;
    blanks_config: unknown;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    question_types: {
      id: string;
      name: string;
      display_name: string;
      description: string | null;
      input_type: string;
      response_type: string;
      scoring_method: string;
      time_limit_seconds: number | null;
      ui_component: string;
      order_index: number;
      is_active: boolean;
      created_at: string;
      updated_at: string;
      sections: {
        id: string;
        name: string;
        display_name: string;
        description: string | null;
        exam_id: string;
        order_index: number;
        is_active: boolean;
        created_at: string;
        updated_at: string;
        exams: {
          id: string;
          name: string;
          display_name: string;
          description: string | null;
          duration_minutes: number | null;
          total_score: number | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
      };
    };
    question_media: Array<{
      id: string;
      question_id: string;
      media_id: string;
      media_role: string;
      display_order: number;
      created_at: string;
      media: {
        id: string;
        original_filename: string;
        file_type: string;
        mime_type: string;
        file_size: number | null;
        storage_path: string;
        storage_bucket: string;
        public_url: string | null;
        duration_seconds: number | null;
        dimensions: unknown | null;
        alt_text: string | null;
        created_at: string;
        updated_at: string;
      };
    }>;
    question_options: Array<{
      id: string;
      question_id: string;
      option_text: string;
      is_correct: boolean;
      display_order: number;
      option_media_id: string | null;
      created_at: string;
      updated_at: string;
    }>;
  };
}

interface TestSession {
  id: string;
  user_id: string;
  exam_id: string;
  session_name: string;
  session_type: string;
  is_timed: boolean;
  total_duration_minutes: number | null;
  question_count: number;
  difficulty_levels: number[];
  question_selection_mode: string;
  include_sections: string[] | null;
  include_question_types: string[] | null;
  session_config: Record<string, unknown>;
  status: 'draft' | 'active' | 'paused' | 'completed';
  started_at: string | null;
  completed_at: string | null;
  total_time_spent_seconds: number;
  total_score: number | null;
  max_possible_score: number | null;
  percentage_score: number | null;
  created_at: string;
  updated_at: string;
  exam: {
    id: string;
    name: string;
    display_name: string;
    description: string | null;
    duration_minutes: number | null;
    total_score: number | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  };
  test_session_questions: TestSessionQuestion[];
}

interface TestSessionsStore {
  // State
  sessions: TestSession[];
  selectedSession: TestSession | null;
  loading: boolean;
  error: string | null;

  // Actions
  fetchSessions: (userId: string) => Promise<void>;
  fetchSessionById: (sessionId: string) => Promise<void>;
  createSession: (
    sessionData: Omit<TestSession, 'id' | 'created_at' | 'updated_at'>
  ) => Promise<TestSession | null>;
  updateSession: (
    sessionId: string,
    sessionData: Partial<TestSession>
  ) => Promise<TestSession | null>;
  deleteSession: (sessionId: string) => Promise<void>;
  startSession: (sessionId: string) => Promise<TestSession | null>;
  pauseSession: (sessionId: string) => Promise<TestSession | null>;
  completeSession: (sessionId: string) => Promise<TestSession | null>;
  fetchSessionQuestions: (sessionId: string) => Promise<void>;
}

export const useTestSessionsStore = create<TestSessionsStore>((set, get) => ({
  // Initial state
  sessions: [],
  selectedSession: null,
  loading: false,
  error: null,

  // Fetch all sessions for a user
  fetchSessions: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const supabase = createClient();

      const { data: sessions, error } = await supabase
        .from('test_sessions')
        .select(
          `
          *,
          exams (
            id,
            name,
            display_name,
            description,
            duration_minutes,
            total_score,
            is_active,
            created_at,
            updated_at
          )
        `
        )
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      set({ sessions: sessions || [], loading: false });
    } catch (error: any) {
      console.error('Failed to fetch test sessions:', error);
      set({ error: error.message, loading: false });
    }
  },

  // Fetch single session by ID with questions
  fetchSessionById: async (sessionId: string) => {
    set({ loading: true, error: null });
    try {
      const supabase = createClient();

      const { data: session, error } = await supabase
        .from('test_sessions')
        .select(
          `
          *,
          exams (
            id,
            name,
            display_name,
            description,
            duration_minutes,
            total_score,
            is_active,
            created_at,
            updated_at
          ),
          test_session_questions (
            *,
            questions (
              *,
              question_types (
                *,
                sections (
                  *,
                  exams (
                    id,
                    name,
                    display_name,
                    description,
                    duration_minutes,
                    total_score,
                    is_active,
                    created_at,
                    updated_at
                  )
                )
              ),
              question_media (
                *,
                media (*)
              ),
              question_options (*)
            )
          )
        `
        )
        .eq('id', sessionId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('Test session not found');
        }
        throw new Error(error.message);
      }

      // Sort questions by sequence number
      if (session.test_session_questions) {
        session.test_session_questions.sort(
          (a: any, b: any) => a.sequence_number - b.sequence_number
        );
      }

      set({ selectedSession: session, loading: false });
    } catch (error: any) {
      console.error('Failed to fetch test session:', error);
      set({ error: error.message, loading: false });
    }
  },

  // Create new session
  createSession: async (sessionData) => {
    set({ loading: true, error: null });
    try {
      const supabase = createClient();

      const { data: session, error } = await supabase
        .from('test_sessions')
        .insert(sessionData)
        .select(
          `
          *,
          exams (
            id,
            name,
            display_name,
            description,
            duration_minutes,
            total_score,
            is_active,
            created_at,
            updated_at
          )
        `
        )
        .single();

      if (error) {
        throw new Error(error.message);
      }

      // Update local state
      const { sessions } = get();
      set({
        sessions: [session, ...sessions],
        selectedSession: session,
        loading: false,
      });

      return session;
    } catch (error: any) {
      console.error('Failed to create test session:', error);
      set({ error: error.message, loading: false });
      return null;
    }
  },

  // Update session
  updateSession: async (sessionId, sessionData) => {
    set({ loading: true, error: null });
    try {
      const supabase = createClient();

      const { data: session, error } = await supabase
        .from('test_sessions')
        .update(sessionData)
        .eq('id', sessionId)
        .select(
          `
          *,
          exams (
            id,
            name,
            display_name,
            description,
            duration_minutes,
            total_score,
            is_active,
            created_at,
            updated_at
          )
        `
        )
        .single();

      if (error) {
        throw new Error(error.message);
      }

      // Update local state
      const { sessions, selectedSession } = get();
      const updatedSessions = sessions.map((s) =>
        s.id === sessionId ? { ...s, ...session } : s
      );

      set({
        sessions: updatedSessions,
        selectedSession:
          selectedSession?.id === sessionId ? session : selectedSession,
        loading: false,
      });

      return session;
    } catch (error: any) {
      console.error('Failed to update test session:', error);
      set({ error: error.message, loading: false });
      return null;
    }
  },

  // Delete session
  deleteSession: async (sessionId) => {
    set({ loading: true, error: null });
    try {
      const supabase = createClient();

      const { error } = await supabase
        .from('test_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) {
        throw new Error(error.message);
      }

      // Update local state
      const { sessions, selectedSession } = get();
      const updatedSessions = sessions.filter((s) => s.id !== sessionId);

      set({
        sessions: updatedSessions,
        selectedSession:
          selectedSession?.id === sessionId ? null : selectedSession,
        loading: false,
      });
    } catch (error: any) {
      console.error('Failed to delete test session:', error);
      set({ error: error.message, loading: false });
    }
  },

  // Start session
  startSession: async (sessionId) => {
    set({ loading: true, error: null });
    try {
      const supabase = createClient();

      const { data: session, error } = await supabase
        .from('test_sessions')
        .update({
          status: 'active',
          started_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', sessionId)
        .select(
          `
          *,
          exams (
            id,
            name,
            display_name,
            description,
            duration_minutes,
            total_score,
            is_active,
            created_at,
            updated_at
          )
        `
        )
        .single();

      if (error) {
        throw new Error(error.message);
      }

      // Update local state
      const { sessions, selectedSession } = get();
      const updatedSessions = sessions.map((s) =>
        s.id === sessionId ? { ...s, ...session } : s
      );

      set({
        sessions: updatedSessions,
        selectedSession:
          selectedSession?.id === sessionId ? session : selectedSession,
        loading: false,
      });

      return session;
    } catch (error: any) {
      console.error('Failed to start test session:', error);
      set({ error: error.message, loading: false });
      return null;
    }
  },

  // Pause session
  pauseSession: async (sessionId) => {
    set({ loading: true, error: null });
    try {
      const supabase = createClient();

      const { data: session, error } = await supabase
        .from('test_sessions')
        .update({
          status: 'paused',
          updated_at: new Date().toISOString(),
        })
        .eq('id', sessionId)
        .select(
          `
          *,
          exams (
            id,
            name,
            display_name,
            description,
            duration_minutes,
            total_score,
            is_active,
            created_at,
            updated_at
          )
        `
        )
        .single();

      if (error) {
        throw new Error(error.message);
      }

      // Update local state
      const { sessions, selectedSession } = get();
      const updatedSessions = sessions.map((s) =>
        s.id === sessionId ? { ...s, ...session } : s
      );

      set({
        sessions: updatedSessions,
        selectedSession:
          selectedSession?.id === sessionId ? session : selectedSession,
        loading: false,
      });

      return session;
    } catch (error: any) {
      console.error('Failed to pause test session:', error);
      set({ error: error.message, loading: false });
      return null;
    }
  },

  // Complete session
  completeSession: async (sessionId) => {
    set({ loading: true, error: null });
    try {
      const supabase = createClient();

      const { data: session, error } = await supabase
        .from('test_sessions')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', sessionId)
        .select(
          `
          *,
          exams (
            id,
            name,
            display_name,
            description,
            duration_minutes,
            total_score,
            is_active,
            created_at,
            updated_at
          )
        `
        )
        .single();

      if (error) {
        throw new Error(error.message);
      }

      // Update local state
      const { sessions, selectedSession } = get();
      const updatedSessions = sessions.map((s) =>
        s.id === sessionId ? { ...s, ...session } : s
      );

      set({
        sessions: updatedSessions,
        selectedSession:
          selectedSession?.id === sessionId ? session : selectedSession,
        loading: false,
      });

      return session;
    } catch (error: any) {
      console.error('Failed to complete test session:', error);
      set({ error: error.message, loading: false });
      return null;
    }
  },

  // Fetch session questions
  fetchSessionQuestions: async (sessionId: string) => {
    set({ loading: true, error: null });
    try {
      const supabase = createClient();

      const { data: sessionQuestions, error } = await supabase
        .from('test_session_questions')
        .select(
          `
          *,
          questions (
            *,
            question_types (
              *,
              sections (
                *,
                exams (*)
              )
            ),
            question_media (
              *,
              media (*)
            ),
            question_options (*)
          )
        `
        )
        .eq('session_id', sessionId)
        .order('sequence_number', { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      // Update selected session with questions
      const { selectedSession } = get();
      if (selectedSession && selectedSession.id === sessionId) {
        const updatedSession = {
          ...selectedSession,
          test_session_questions: sessionQuestions || [],
        };
        set({ selectedSession: updatedSession, loading: false });
      } else {
        set({ loading: false });
      }
    } catch (error: any) {
      console.error('Failed to fetch session questions:', error);
      set({ error: error.message, loading: false });
    }
  },
}));
