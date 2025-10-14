'use client';

import { useState, useEffect } from 'react';

export interface QuestionTypeNav {
  id: string;
  name: string;
  displayName: string;
  description: string;
}

export interface SectionNav {
  id: string;
  name: string;
  displayName: string;
  description: string;
  questionTypes: QuestionTypeNav[];
}

export interface ExamNav {
  id: string;
  name: string;
  displayName: string;
  description: string;
  href: string;
  sections: SectionNav[];
}

export function useExamNavigation() {
  const [exams, setExams] = useState<ExamNav[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNavigation() {
      try {
        const response = await fetch('/api/navigation/exams');

        if (!response.ok) {
          throw new Error('Failed to fetch navigation data');
        }

        const data = await response.json();
        setExams(data);
      } catch (err) {
        console.error('Error fetching navigation:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    }

    fetchNavigation();
  }, []);

  return { exams, isLoading, error };
}
