import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import {
  TestSession,
  TestSessionQuestion,
  ActiveTestSession,
  TestConfigurationForm,
  SectionSelection,
  AvailableQuestionsResponse,
  SessionCompletionSummary,
  CreateTestSessionResponse,
} from '@/types/test-session';

// Test Configuration Store
interface TestConfigurationState {
  // Available data
  availableQuestions: AvailableQuestionsResponse | null;
  isLoadingAvailableQuestions: boolean;

  // Form state
  configuration: TestConfigurationForm;
  isFormValid: boolean;

  // Actions
  setAvailableQuestions: (data: AvailableQuestionsResponse | null) => void;
  setLoadingAvailableQuestions: (loading: boolean) => void;
  updateConfiguration: (updates: Partial<TestConfigurationForm>) => void;
  updateSectionSelection: (
    sectionId: string,
    updates: Partial<SectionSelection>
  ) => void;
  updateQuestionTypeSelection: (
    sectionId: string,
    questionTypeId: string,
    isSelected: boolean
  ) => void;
  resetConfiguration: (examId?: string) => void;
  validateConfiguration: () => boolean;
  getEstimatedDuration: () => number;
  getSelectedQuestionCount: () => number;
}

// Generate random session name
const generateSessionName = (): string => {
  const adjectives = ['Quick', 'Practice', 'Full', 'Focus', 'Mock', 'Speed', 'Smart'];
  const nouns = ['Test', 'Session', 'Practice', 'Drill', 'Quiz', 'Challenge'];
  const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${randomAdj} ${randomNoun} - ${date}`;
};

// Default configuration
const getDefaultConfiguration = (examId?: string): TestConfigurationForm => ({
  session_name: generateSessionName(),
  session_type: 'practice',
  is_timed: true,
  total_duration_minutes: null,
  question_count: 20,
  question_selection_mode: 'mixed',
  difficulty_levels: [1, 2, 3, 4, 5],
  selected_sections: [],
  custom_time_limits: {},
});

export const useTestConfigurationStore = create<TestConfigurationState>()(
  subscribeWithSelector((set, get) => ({
    availableQuestions: null,
    isLoadingAvailableQuestions: false,
    configuration: getDefaultConfiguration(),
    isFormValid: false,

    setAvailableQuestions: (data) => {
      set({ availableQuestions: data });

      if (data) {
        // Initialize section selections based on available data
        const selectedSections: SectionSelection[] = data.sections.map(
          (section) => ({
            section_id: section.id,
            section_name: section.display_name,
            is_selected: false,
            estimated_time_minutes: section.duration_minutes || 0,
            weight: 1.0 / data.sections.length,
            question_types: section.question_types.map((qt) => ({
              question_type_id: qt.id,
              question_type_name: qt.display_name,
              is_selected: false,
              available_count: qt.total_questions,
              difficulty_distribution: qt.difficulty_distribution,
              estimated_time_per_question: Math.ceil(
                qt.average_completion_time_seconds / 60
              ),
            })),
          })
        );

        set((state) => ({
          configuration: {
            ...state.configuration,
            selected_sections: selectedSections,
          },
        }));
      }
    },

    setLoadingAvailableQuestions: (loading) =>
      set({ isLoadingAvailableQuestions: loading }),

    updateConfiguration: (updates) => {
      set((state) => ({
        configuration: { ...state.configuration, ...updates },
      }));

      // Validate after update
      setTimeout(() => {
        const isValid = get().validateConfiguration();
        set({ isFormValid: isValid });
      }, 0);
    },

    updateSectionSelection: (sectionId, updates) => {
      set((state) => ({
        configuration: {
          ...state.configuration,
          selected_sections: state.configuration.selected_sections.map(
            (section) =>
              section.section_id === sectionId
                ? { ...section, ...updates }
                : section
          ),
        },
      }));

      // Auto-update weights if sections are selected/deselected
      const { configuration } = get();
      const selectedSections = configuration.selected_sections.filter(
        (s) => s.is_selected
      );

      if (selectedSections.length > 0) {
        const equalWeight = 1.0 / selectedSections.length;
        get().updateConfiguration({
          selected_sections: configuration.selected_sections.map((section) => ({
            ...section,
            weight: section.is_selected ? equalWeight : 0,
          })),
        });
      }
    },

    updateQuestionTypeSelection: (sectionId, questionTypeId, isSelected) => {
      set((state) => {
        const updatedSections = state.configuration.selected_sections.map(
          (section) => {
            if (section.section_id === sectionId) {
              const updatedQuestionTypes = section.question_types.map((qt) =>
                qt.question_type_id === questionTypeId
                  ? { ...qt, is_selected: isSelected }
                  : qt
              );

              // Auto-select section if any question type is selected
              const hasSelectedQuestionTypes = updatedQuestionTypes.some(
                (qt) => qt.is_selected
              );

              return {
                ...section,
                is_selected: hasSelectedQuestionTypes,
                question_types: updatedQuestionTypes,
              };
            }
            return section;
          }
        );

        return {
          configuration: {
            ...state.configuration,
            selected_sections: updatedSections,
          },
        };
      });

      // Auto-update weights for selected sections
      const { configuration } = get();
      const selectedSections = configuration.selected_sections.filter(
        (s) => s.is_selected
      );

      if (selectedSections.length > 0) {
        const equalWeight = 1.0 / selectedSections.length;
        get().updateConfiguration({
          selected_sections: configuration.selected_sections.map((section) => ({
            ...section,
            weight: section.is_selected ? equalWeight : 0,
          })),
        });
      }
    },

    resetConfiguration: (examId) => {
      set({
        configuration: getDefaultConfiguration(examId),
        isFormValid: false,
      });
    },

    validateConfiguration: () => {
      const { configuration } = get();

      const hasSelectedSections = configuration.selected_sections.some(
        (s) => s.is_selected
      );
      const hasSelectedQuestionTypes = configuration.selected_sections.some(
        (s) => s.question_types.some((qt) => qt.is_selected)
      );
      const hasValidQuestionCount =
        configuration.question_count > 0 && configuration.question_count <= 100;
      const hasValidDuration =
        !configuration.is_timed ||
        (configuration.total_duration_minutes !== null &&
          configuration.total_duration_minutes > 0);

      return (
        hasSelectedSections &&
        hasSelectedQuestionTypes &&
        hasValidQuestionCount &&
        hasValidDuration
      );
    },

    getEstimatedDuration: () => {
      const { configuration } = get();

      if (!configuration.is_timed) return 0;

      // Calculate based on selected question types and their time limits
      let totalTime = 0;
      for (const section of configuration.selected_sections) {
        if (!section.is_selected) continue;

        for (const qt of section.question_types) {
          if (!qt.is_selected) continue;

          const questionsFromThisType = Math.ceil(
            configuration.question_count *
              section.weight *
              (qt.available_count / section.question_types.length)
          );
          totalTime += questionsFromThisType * qt.estimated_time_per_question;
        }
      }

      return Math.ceil(totalTime);
    },

    getSelectedQuestionCount: () => {
      const { configuration, availableQuestions } = get();

      if (!availableQuestions) return 0;

      const selectedSections = configuration.selected_sections.filter(
        (s) => s.is_selected
      );
      const totalAvailable = selectedSections.reduce((sum, section) => {
        const selectedQTypes = section.question_types.filter(
          (qt) => qt.is_selected
        );
        return (
          sum +
          selectedQTypes.reduce((qtSum, qt) => qtSum + qt.available_count, 0)
        );
      }, 0);

      return Math.min(configuration.question_count, totalAvailable);
    },
  }))
);

// Active Test Session Store
interface ActiveTestSessionState {
  // Session state
  activeSession: ActiveTestSession | null;
  isLoading: boolean;
  error: string | null;

  // Current question state
  currentQuestionIndex: number;
  timeRemaining: number | null; // seconds remaining for current question
  sessionTimeRemaining: number | null; // seconds remaining for entire session
  isPaused: boolean;

  // Progress
  answeredQuestions: Set<string>;
  flaggedQuestions: Set<string>;

  // Actions
  setActiveSession: (session: ActiveTestSession | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  navigateToQuestion: (index: number) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  markQuestionAnswered: (questionId: string) => void;
  toggleQuestionFlag: (questionId: string) => void;
  updateTimeRemaining: (
    questionTime: number | null,
    sessionTime: number | null
  ) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  resetSession: () => void;
}

export const useActiveTestSessionStore = create<ActiveTestSessionState>()(
  subscribeWithSelector((set, get) => ({
    activeSession: null,
    isLoading: false,
    error: null,
    currentQuestionIndex: 0,
    timeRemaining: null,
    sessionTimeRemaining: null,
    isPaused: false,
    answeredQuestions: new Set(),
    flaggedQuestions: new Set(),

    setActiveSession: (session) => {
      set({
        activeSession: session,
        currentQuestionIndex: 0,
        answeredQuestions: new Set(),
        flaggedQuestions: new Set(),
        isPaused: false,
        error: null,
      });
    },

    setLoading: (loading) => set({ isLoading: loading }),
    setError: (error) => set({ error }),

    navigateToQuestion: (index) => {
      const { activeSession } = get();
      if (
        activeSession &&
        index >= 0 &&
        index < activeSession.questions.length
      ) {
        set({ currentQuestionIndex: index });
      }
    },

    nextQuestion: () => {
      const { activeSession, currentQuestionIndex } = get();
      if (
        activeSession &&
        currentQuestionIndex < activeSession.questions.length - 1
      ) {
        set({ currentQuestionIndex: currentQuestionIndex + 1 });
      }
    },

    previousQuestion: () => {
      const { currentQuestionIndex } = get();
      if (currentQuestionIndex > 0) {
        set({ currentQuestionIndex: currentQuestionIndex - 1 });
      }
    },

    markQuestionAnswered: (questionId) => {
      set((state) => ({
        answeredQuestions: new Set(state.answeredQuestions).add(questionId),
      }));
    },

    toggleQuestionFlag: (questionId) => {
      set((state) => {
        const newFlagged = new Set(state.flaggedQuestions);
        if (newFlagged.has(questionId)) {
          newFlagged.delete(questionId);
        } else {
          newFlagged.add(questionId);
        }
        return { flaggedQuestions: newFlagged };
      });
    },

    updateTimeRemaining: (questionTime, sessionTime) => {
      set({
        timeRemaining: questionTime,
        sessionTimeRemaining: sessionTime,
      });
    },

    pauseSession: () => set({ isPaused: true }),
    resumeSession: () => set({ isPaused: false }),

    resetSession: () => {
      set({
        activeSession: null,
        isLoading: false,
        error: null,
        currentQuestionIndex: 0,
        timeRemaining: null,
        sessionTimeRemaining: null,
        isPaused: false,
        answeredQuestions: new Set(),
        flaggedQuestions: new Set(),
      });
    },
  }))
);

// Test Session Management Store
interface TestSessionManagementState {
  // Session lists
  userSessions: TestSession[];
  isLoadingSessions: boolean;

  // Session details
  currentSession: TestSession | null;
  sessionQuestions: TestSessionQuestion[];
  isLoadingSessionDetails: boolean;

  // Completion data
  completionSummary: SessionCompletionSummary | null;

  // Actions
  setUserSessions: (sessions: TestSession[]) => void;
  setLoadingSessions: (loading: boolean) => void;
  setCurrentSession: (session: TestSession | null) => void;
  setSessionQuestions: (questions: TestSessionQuestion[]) => void;
  setLoadingSessionDetails: (loading: boolean) => void;
  setCompletionSummary: (summary: SessionCompletionSummary | null) => void;
  addSession: (session: TestSession) => void;
  updateSession: (sessionId: string, updates: Partial<TestSession>) => void;
  removeSession: (sessionId: string) => void;
  clearSessionDetails: () => void;
}

export const useTestSessionManagementStore =
  create<TestSessionManagementState>()((set, get) => ({
    userSessions: [],
    isLoadingSessions: false,
    currentSession: null,
    sessionQuestions: [],
    isLoadingSessionDetails: false,
    completionSummary: null,

    setUserSessions: (sessions) => set({ userSessions: sessions }),
    setLoadingSessions: (loading) => set({ isLoadingSessions: loading }),

    setCurrentSession: (session) => set({ currentSession: session }),
    setSessionQuestions: (questions) => set({ sessionQuestions: questions }),
    setLoadingSessionDetails: (loading) =>
      set({ isLoadingSessionDetails: loading }),

    setCompletionSummary: (summary) => set({ completionSummary: summary }),

    addSession: (session) => {
      set((state) => ({
        userSessions: [session, ...state.userSessions],
      }));
    },

    updateSession: (sessionId, updates) => {
      set((state) => ({
        userSessions: state.userSessions.map((session) =>
          session.id === sessionId ? { ...session, ...updates } : session
        ),
        currentSession:
          state.currentSession?.id === sessionId
            ? { ...state.currentSession, ...updates }
            : state.currentSession,
      }));
    },

    removeSession: (sessionId) => {
      set((state) => ({
        userSessions: state.userSessions.filter(
          (session) => session.id !== sessionId
        ),
        currentSession:
          state.currentSession?.id === sessionId ? null : state.currentSession,
      }));
    },

    clearSessionDetails: () => {
      set({
        currentSession: null,
        sessionQuestions: [],
        completionSummary: null,
        isLoadingSessionDetails: false,
      });
    },
  }));

// Combined hook for easier access
export const useTestSession = () => {
  const configuration = useTestConfigurationStore();
  const activeSession = useActiveTestSessionStore();
  const management = useTestSessionManagementStore();

  return {
    configuration,
    activeSession,
    management,
  };
};
