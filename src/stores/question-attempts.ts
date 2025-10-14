import { create } from 'zustand';
import { createClient } from '@/supabase/client';

interface QuestionAttempt {
  id: string;
  user_id: string;
  question_id: string;
  test_session_id: string;
  session_question_id: string;
  response_data: any;
  response_type: string;
  response_text?: string;
  selected_options?: string[];
  time_spent_seconds: number;
  ai_score?: number;
  manual_score?: number;
  final_score?: number;
  scoring_status: string;
  ai_feedback?: string;
  ai_analysis?: any;
  started_at: string;
  submitted_at: string;
  created_at: string;
  updated_at: string;
}

interface QuestionAttemptsStore {
  // State
  attempts: QuestionAttempt[];
  currentAttempt: QuestionAttempt | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchAttempts: (testSessionId: string) => Promise<void>;
  fetchAttemptById: (attemptId: string) => Promise<void>;
  createAttempt: (attemptData: Omit<QuestionAttempt, 'id' | 'created_at' | 'updated_at'>) => Promise<QuestionAttempt | null>;
  updateAttempt: (attemptId: string, attemptData: Partial<QuestionAttempt>) => Promise<QuestionAttempt | null>;
  deleteAttempt: (attemptId: string) => Promise<void>;
  saveAttempt: (attemptData: {
    questionId: string;
    sessionQuestionId: string;
    testSessionId: string;
    response: any;
    responseType: string;
    timeSpentSeconds?: number;
  }) => Promise<boolean>;
}

export const useQuestionAttemptsStore = create<QuestionAttemptsStore>((set, get) => ({
  // Initial state
  attempts: [],
  currentAttempt: null,
  loading: false,
  error: null,

  // Fetch all attempts for a test session
  fetchAttempts: async (testSessionId: string) => {
    set({ loading: true, error: null });
    try {
      const supabase = createClient();
      
      const { data: attempts, error } = await supabase
        .from('question_attempts')
        .select('*')
        .eq('test_session_id', testSessionId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      set({ attempts: attempts || [], loading: false });
    } catch (error: any) {
      console.error('Failed to fetch question attempts:', error);
      set({ error: error.message, loading: false });
    }
  },

  // Fetch single attempt by ID
  fetchAttemptById: async (attemptId: string) => {
    set({ loading: true, error: null });
    try {
      const supabase = createClient();
      
      const { data: attempt, error } = await supabase
        .from('question_attempts')
        .select('*')
        .eq('id', attemptId)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      set({ currentAttempt: attempt, loading: false });
    } catch (error: any) {
      console.error('Failed to fetch question attempt:', error);
      set({ error: error.message, loading: false });
    }
  },

  // Create new attempt
  createAttempt: async (attemptData) => {
    set({ loading: true, error: null });
    try {
      const supabase = createClient();
      
      const { data: attempt, error } = await supabase
        .from('question_attempts')
        .insert(attemptData)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      // Update local state
      const { attempts } = get();
      set({ 
        attempts: [attempt, ...attempts], 
        currentAttempt: attempt,
        loading: false 
      });
      
      return attempt;
    } catch (error: any) {
      console.error('Failed to create question attempt:', error);
      set({ error: error.message, loading: false });
      return null;
    }
  },

  // Update existing attempt
  updateAttempt: async (attemptId, attemptData) => {
    set({ loading: true, error: null });
    try {
      const supabase = createClient();
      
      const { data: attempt, error } = await supabase
        .from('question_attempts')
        .update(attemptData)
        .eq('id', attemptId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      // Update local state
      const { attempts, currentAttempt } = get();
      const updatedAttempts = attempts.map(a => 
        a.id === attemptId ? { ...a, ...attempt } : a
      );
      
      set({ 
        attempts: updatedAttempts,
        currentAttempt: currentAttempt?.id === attemptId ? attempt : currentAttempt,
        loading: false 
      });
      
      return attempt;
    } catch (error: any) {
      console.error('Failed to update question attempt:', error);
      set({ error: error.message, loading: false });
      return null;
    }
  },

  // Delete attempt
  deleteAttempt: async (attemptId) => {
    set({ loading: true, error: null });
    try {
      const supabase = createClient();
      
      const { error } = await supabase
        .from('question_attempts')
        .delete()
        .eq('id', attemptId);

      if (error) {
        throw new Error(error.message);
      }

      // Update local state
      const { attempts, currentAttempt } = get();
      const updatedAttempts = attempts.filter(a => a.id !== attemptId);
      
      set({ 
        attempts: updatedAttempts,
        currentAttempt: currentAttempt?.id === attemptId ? null : currentAttempt,
        loading: false 
      });
    } catch (error: any) {
      console.error('Failed to delete question attempt:', error);
      set({ error: error.message, loading: false });
    }
  },

  // Save attempt (create or update)
  saveAttempt: async ({
    questionId,
    sessionQuestionId,
    testSessionId,
    response,
    responseType,
    timeSpentSeconds = 0,
  }) => {
    set({ loading: true, error: null });
    try {
      const supabase = createClient();
      
      // Check if an attempt already exists for this session question
      const { data: existingAttempt, error: existingError } = await supabase
        .from('question_attempts')
        .select('id')
        .eq('session_question_id', sessionQuestionId)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .maybeSingle();

      let success = false;
      let attemptId: string;

      if (existingAttempt) {
        // Update existing attempt
        const updateData: any = {
          response_data: response,
          response_type: responseType,
          time_spent_seconds: timeSpentSeconds,
          updated_at: new Date().toISOString(),
        };

        // Handle different response types
        if (responseType === 'text') {
          updateData.response_text = typeof response === 'string' ? response : JSON.stringify(response);
        } else if (responseType === 'selection') {
          updateData.selected_options = response;
        }

        const { error: updateError } = await supabase
          .from('question_attempts')
          .update(updateData)
          .eq('id', existingAttempt.id);

        if (updateError) {
          throw new Error(updateError.message);
        }

        attemptId = existingAttempt.id;
        success = true;
      } else {
        // Create new attempt
        const insertData: any = {
          user_id: (await supabase.auth.getUser()).data.user?.id,
          question_id: questionId,
          test_session_id: testSessionId,
          session_question_id: sessionQuestionId,
          response_data: response,
          response_type: responseType,
          time_spent_seconds: timeSpentSeconds,
          started_at: new Date().toISOString(),
          submitted_at: new Date().toISOString(),
        };

        // Handle different response types
        if (responseType === 'text') {
          insertData.response_text = typeof response === 'string' ? response : JSON.stringify(response);
        } else if (responseType === 'selection') {
          insertData.selected_options = response;
        }

        const { data: newAttempt, error: insertError } = await supabase
          .from('question_attempts')
          .insert(insertData)
          .select('id')
          .single();

        if (insertError) {
          throw new Error(insertError.message);
        }

        attemptId = newAttempt.id;
        success = true;

        // Update session question to link to the attempt
        const { error: sessionQuestionError } = await supabase
          .from('test_session_questions')
          .update({
            question_attempt_id: attemptId,
            is_attempted: true,
            time_spent_seconds: timeSpentSeconds,
            updated_at: new Date().toISOString(),
          })
          .eq('id', sessionQuestionId);

        if (sessionQuestionError) {
          console.error('Error updating session question:', sessionQuestionError);
          // Don't fail the whole operation, but log the error
        }
      }

      // Refresh attempts list
      await get().fetchAttempts(testSessionId);
      
      set({ loading: false });
      return success;
    } catch (error: any) {
      console.error('Failed to save question attempt:', error);
      set({ error: error.message, loading: false });
      return false;
    }
  },
}));