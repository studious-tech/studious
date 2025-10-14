'use client';

import * as React from 'react';
import { TestSession } from '@/types/test-session';
import { Clock } from 'lucide-react';

interface TestSessionHeaderProps {
  session: TestSession;
  currentQuestionIndex: number;
  totalQuestions: number;
  examId: string;
  timeSpent: number;
  isPaused?: boolean;
}

export function TestSessionHeader({
  session,
  currentQuestionIndex,
  totalQuestions,
  examId,
  timeSpent,
  isPaused = false,
}: TestSessionHeaderProps) {
  // Format time spent into HH:MM:SS
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const progressPercentage = Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100);

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="mx-auto px-6 py-2.5">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Session name */}
          <div className="flex-shrink-0">
            <span className="text-sm font-medium text-gray-700">
              {session.session_name || 'Practice Test'}
            </span>
          </div>

          {/* Center: Timer */}
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="font-mono text-sm font-medium text-gray-900">
              {formatTime(timeSpent)}
            </span>
          </div>

          {/* Right: Progress bar */}
          <div className="flex-1 max-w-xs">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <span className="text-xs font-medium text-gray-600 min-w-[3rem] text-right">
                {currentQuestionIndex + 1}/{totalQuestions}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
