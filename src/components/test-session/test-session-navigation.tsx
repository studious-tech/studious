'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

interface TestSessionNavigationProps {
  currentIndex: number;
  totalQuestions: number;
  onNext: () => void;
  onPrevious: () => void;
  examId: string;
  canGoNext: boolean;
  canGoPrevious: boolean;
  isSaving?: boolean;
  onSave?: () => void;
  onFlag?: () => void;
  onPause?: () => void;
  onRestart?: () => void;
  onFinish?: () => void;
}

export function TestSessionNavigation({
  currentIndex,
  totalQuestions,
  onNext,
  onPrevious,
  examId,
  canGoNext,
  canGoPrevious,
  isSaving = false,
  onSave,
  onFlag,
  onPause,
  onRestart,
  onFinish,
}: TestSessionNavigationProps) {
  // Handle keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if typing in an input/textarea
      const activeElement = document.activeElement;
      if (
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.key) {
        case 'ArrowRight':
          if (canGoNext) {
            onNext();
          }
          break;
        case 'ArrowLeft':
          if (canGoPrevious) {
            onPrevious();
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canGoNext, canGoPrevious, onNext, onPrevious]);

  const isLastQuestion = currentIndex === totalQuestions - 1;

  return (
    <div className="bg-white/80 backdrop-blur-sm border-t border-gray-200">
      <div className="mx-auto px-6 py-3">
        <div className="flex items-center justify-end">
          {isLastQuestion ? (
            <Button
              onClick={onFinish}
              disabled={isSaving}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-medium transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : 'Finish'}
            </Button>
          ) : (
            <Button
              onClick={onNext}
              disabled={!canGoNext || isSaving}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSaving ? 'Saving...' : 'Next'}
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}