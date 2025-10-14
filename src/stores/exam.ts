import { create } from 'zustand';

interface Exam {
  id: string;
  name: string;
  display_name: string;
  description: string;
  duration_minutes: number;
  total_score: number;
  is_active: boolean;
  created_at: string;
  sections?: Section[];
}

export interface Section {
  id: string;
  exam_id: string;
  name: string;
  display_name: string;
  description: string;
  duration_minutes: number;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  question_types?: QuestionType[];
}

interface QuestionType {
  id: string;
  section_id: string;
  name: string;
  display_name: string;
  description: string;
  input_type: string;
  response_type: string;
  scoring_method: string;
  time_limit_seconds: number;
  order_index: number;
  is_active: boolean;
  created_at: string;
  question_count?: number;
  questions?: Question[];
}

interface Question {
  id: string;
  question_type_id: string;
  title: string;
  content: string;
  instructions?: string;
  difficulty_level: number;
  expected_duration_seconds?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  question_media?: QuestionMedia[];
  question_options?: QuestionOption[];
}

interface QuestionMedia {
  id: string;
  question_id: string;
  media_id: string;
  media_role: string;
  display_order: number;
  media: {
    id: string;
    filename: string;
    url: string;
    content_type: string;
    file_size: number;
  };
}

interface QuestionOption {
  id: string;
  question_id: string;
  option_text: string;
  is_correct: boolean;
  display_order: number;
}

interface ExamStore {
  // State
  exams: Exam[];
  selectedExam: Exam | null;
  selectedSection: Section | null;
  selectedQuestionType: QuestionType | null;
  selectedQuestion: Question | null;
  loading: boolean;
  
  // Actions
  fetchExams: () => Promise<void>;
  fetchExam: (examId: string) => Promise<void>;
  createExam: (examData: Partial<Exam>) => Promise<void>;
  updateExam: (examId: string, examData: Partial<Exam>) => Promise<void>;
  deleteExam: (examId: string) => Promise<void>;
  
  createSection: (sectionData: Partial<Section>) => Promise<void>;
  updateSection: (sectionId: string, sectionData: Partial<Section>) => Promise<void>;
  deleteSection: (sectionId: string) => Promise<void>;
  
  createQuestionType: (questionTypeData: Partial<QuestionType>) => Promise<void>;
  updateQuestionType: (questionTypeId: string, questionTypeData: Partial<QuestionType>) => Promise<void>;
  deleteQuestionType: (questionTypeId: string) => Promise<void>;
  
  // Question management
  fetchQuestions: (questionTypeId: string) => Promise<void>;
  createQuestion: (questionData: Partial<Question>) => Promise<void>;
  updateQuestion: (questionId: string, questionData: Partial<Question>) => Promise<void>;
  deleteQuestion: (questionId: string) => Promise<void>;
  
  setSelectedExam: (exam: Exam | null) => void;
  setSelectedSection: (section: Section | null) => void;
  setSelectedQuestionType: (questionType: QuestionType | null) => void;
  setSelectedQuestion: (question: Question | null) => void;
  clearSelections: () => void;
}

export const useExamStore = create<ExamStore>((set, get) => ({
  // Initial state
  exams: [],
  selectedExam: null,
  selectedSection: null,
  selectedQuestionType: null,
  selectedQuestion: null,
  loading: false,

  // Fetch all exams
  fetchExams: async () => {
    set({ loading: true });
    try {
      const response = await fetch('/api/exams');
      if (response.ok) {
        const exams = await response.json();
        set({ exams, loading: false });
      } else {
        console.error('Failed to fetch exams');
        set({ loading: false });
      }
    } catch (error) {
      console.error('Failed to fetch exams:', error);
      set({ loading: false });
    }
  },

  // Fetch single exam with full details
  fetchExam: async (examId: string) => {
    set({ loading: true });
    try {
      const response = await fetch(`/api/exams/${examId}`);
      if (response.ok) {
        const exam = await response.json();
        set({ selectedExam: exam, loading: false });
        
        // Also update the exams array with this exam if it's not already there
        const { exams } = get();
        if (!exams.some(e => e.id === examId)) {
          set({ exams: [...exams, exam] });
        }
      } else {
        console.error('Failed to fetch exam');
        set({ loading: false });
      }
    } catch (error) {
      console.error('Failed to fetch exam:', error);
      set({ loading: false });
    }
  },

  // Create new exam (admin only)
  createExam: async (examData) => {
    try {
      const response = await fetch('/api/admin/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(examData),
      });
      
      if (response.ok) {
        const newExam = await response.json();
        const { exams } = get();
        set({ exams: [newExam, ...exams] });
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create exam');
      }
    } catch (error) {
      console.error('Failed to create exam:', error);
      throw error;
    }
  },

  // Update exam
  updateExam: async (examId, examData) => {
    try {
      const response = await fetch(`/api/admin/exams/${examId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(examData),
      });
      
      if (response.ok) {
        const updatedExam = await response.json();
        const { exams } = get();
        set({
          exams: exams.map(exam => exam.id === examId ? updatedExam : exam),
          selectedExam: updatedExam,
        });
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update exam');
      }
    } catch (error) {
      console.error('Failed to update exam:', error);
      throw error;
    }
  },

  // Delete exam
  deleteExam: async (examId) => {
    try {
      const response = await fetch(`/api/admin/exams/${examId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        const { exams } = get();
        set({ 
          exams: exams.filter(exam => exam.id !== examId),
          selectedExam: null,
        });
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete exam');
      }
    } catch (error) {
      console.error('Failed to delete exam:', error);
      throw error;
    }
  },

  // Create section
  createSection: async (sectionData) => {
    try {
      const response = await fetch('/api/admin/sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sectionData),
      });
      
      if (response.ok) {
        // Refresh the selected exam to show new section
        const { selectedExam } = get();
        if (selectedExam) {
          await get().fetchExam(selectedExam.id);
        }
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create section');
      }
    } catch (error) {
      console.error('Failed to create section:', error);
      throw error;
    }
  },

  // Update section
  updateSection: async (sectionId, sectionData) => {
    try {
      const response = await fetch(`/api/admin/sections/${sectionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sectionData),
      });
      
      if (response.ok) {
        // Refresh the selected exam
        const { selectedExam } = get();
        if (selectedExam) {
          await get().fetchExam(selectedExam.id);
        }
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update section');
      }
    } catch (error) {
      console.error('Failed to update section:', error);
      throw error;
    }
  },

  // Delete section
  deleteSection: async (sectionId) => {
    try {
      const response = await fetch(`/api/admin/sections/${sectionId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // Refresh the selected exam
        const { selectedExam } = get();
        if (selectedExam) {
          await get().fetchExam(selectedExam.id);
        }
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete section');
      }
    } catch (error) {
      console.error('Failed to delete section:', error);
      throw error;
    }
  },

  // Create question type
  createQuestionType: async (questionTypeData) => {
    try {
      const response = await fetch('/api/admin/question-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(questionTypeData),
      });
      
      if (response.ok) {
        // Refresh the selected exam
        const { selectedExam } = get();
        if (selectedExam) {
          await get().fetchExam(selectedExam.id);
        }
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create question type');
      }
    } catch (error) {
      console.error('Failed to create question type:', error);
      throw error;
    }
  },

  // Update question type
  updateQuestionType: async (questionTypeId, questionTypeData) => {
    try {
      const response = await fetch(`/api/admin/question-types/${questionTypeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(questionTypeData),
      });
      
      if (response.ok) {
        // Refresh the selected exam
        const { selectedExam } = get();
        if (selectedExam) {
          await get().fetchExam(selectedExam.id);
        }
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update question type');
      }
    } catch (error) {
      console.error('Failed to update question type:', error);
      throw error;
    }
  },

  // Delete question type
  deleteQuestionType: async (questionTypeId) => {
    try {
      const response = await fetch(`/api/admin/question-types/${questionTypeId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // Refresh the selected exam
        const { selectedExam } = get();
        if (selectedExam) {
          await get().fetchExam(selectedExam.id);
        }
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete question type');
      }
    } catch (error) {
      console.error('Failed to delete question type:', error);
      throw error;
    }
  },

  // Fetch questions for a question type
  fetchQuestions: async (questionTypeId: string) => {
    try {
      const response = await fetch(`/api/admin/questions?question_type_id=${questionTypeId}`);
      if (response.ok) {
        const data = await response.json();
        // Update the selected question type with questions
        const { selectedExam } = get();
        if (selectedExam) {
          const updatedExam = {
            ...selectedExam,
            sections: selectedExam.sections?.map(section => ({
              ...section,
              question_types: section.question_types?.map(qt => 
                qt.id === questionTypeId 
                  ? { ...qt, questions: data.questions || [] }
                  : qt
              )
            }))
          };
          set({ selectedExam: updatedExam });
        }
      }
    } catch (error) {
      console.error('Failed to fetch questions:', error);
      throw error;
    }
  },

  // Create question
  createQuestion: async (questionData) => {
    try {
      const response = await fetch('/api/admin/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(questionData),
      });
      
      if (response.ok) {
        // Refresh the selected exam to show new question
        const { selectedExam } = get();
        if (selectedExam) {
          await get().fetchExam(selectedExam.id);
        }
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create question');
      }
    } catch (error) {
      console.error('Failed to create question:', error);
      throw error;
    }
  },

  // Update question
  updateQuestion: async (questionId: string, questionData) => {
    try {
      const response = await fetch(`/api/admin/questions/${questionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(questionData),
      });
      
      if (response.ok) {
        // Refresh the selected exam
        const { selectedExam } = get();
        if (selectedExam) {
          await get().fetchExam(selectedExam.id);
        }
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update question');
      }
    } catch (error) {
      console.error('Failed to update question:', error);
      throw error;
    }
  },

  // Delete question
  deleteQuestion: async (questionId: string) => {
    try {
      const response = await fetch(`/api/admin/questions/${questionId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // Refresh the selected exam
        const { selectedExam } = get();
        if (selectedExam) {
          await get().fetchExam(selectedExam.id);
        }
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete question');
      }
    } catch (error) {
      console.error('Failed to delete question:', error);
      throw error;
    }
  },

  // Setters
  setSelectedExam: (exam) => set({ selectedExam: exam }),
  setSelectedSection: (section) => set({ selectedSection: section }),
  setSelectedQuestionType: (questionType) => set({ selectedQuestionType: questionType }),
  setSelectedQuestion: (question) => set({ selectedQuestion: question }),
  
  // Clear all selections
  clearSelections: () => set({ 
    selectedExam: null, 
    selectedSection: null, 
    selectedQuestionType: null, 
    selectedQuestion: null 
  }),
}));