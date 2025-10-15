'use client';

import * as React from 'react';
import { TestSession } from '@/types/test-session';
import { Clock, Flag, Pause, Play, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface EnhancedTestSessionHeaderProps {
  session: TestSession;
  currentQuestionIndex: number;
  totalQuestions: number;
  examId: string;
  timeSpent: number;
  timeRemaining?: number; // For timed tests
  isPaused?: boolean;
  isFlagged?: boolean;
  onPauseToggle?: () => void;
  onFlagToggle?: () => void;
}

export function EnhancedTestSessionHeader({
  session,
  currentQuestionIndex,
  totalQuestions,
  examId,
  timeSpent,
  timeRemaining,
  isPaused = false,
  isFlagged = false,
  onPauseToggle,
  onFlagToggle,
}: EnhancedTestSessionHeaderProps) {
  // Format time into HH:MM:SS
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const progressPercentage = Math.round(
    ((currentQuestionIndex + 1) / totalQuestions) * 100
  );

  // Time warning thresholds
  const showCriticalWarning = timeRemaining !== undefined && timeRemaining <= 60; // 1 min
  const showWarning = timeRemaining !== undefined && timeRemaining <= 300; // 5 min

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
      <div className="mx-auto px-6 py-3">
        <div className="flex items-center justify-between gap-6">
          {/* Left: Session Info */}
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {session.session_name || 'Practice Test'}
              </h3>
              <p className="text-xs text-muted-foreground">
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </p>
            </div>

            {/* Flag Button */}
            {onFlagToggle && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onFlagToggle}
                      className={isFlagged ? 'text-amber-600' : 'text-gray-500'}
                    >
                      <Flag className={`h-4 w-4 ${isFlagged ? 'fill-current' : ''}`} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isFlagged ? 'Unflag' : 'Flag'} for review</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          {/* Center: Timer Display */}
          <div className="flex items-center gap-4">
            {/* Time Spent */}
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="font-mono text-sm font-medium text-gray-900 dark:text-gray-100">
                {formatTime(timeSpent)}
              </span>
            </div>

            {/* Time Remaining (if timed test) */}
            {timeRemaining !== undefined && (
              <div className="flex items-center gap-2">
                {(showWarning || showCriticalWarning) && (
                  <AlertTriangle
                    className={`h-4 w-4 ${
                      showCriticalWarning
                        ? 'text-red-600 animate-pulse'
                        : 'text-amber-600'
                    }`}
                  />
                )}
                <Badge
                  variant={
                    showCriticalWarning
                      ? 'destructive'
                      : showWarning
                      ? 'default'
                      : 'outline'
                  }
                  className="font-mono"
                >
                  {formatTime(timeRemaining)} remaining
                </Badge>
              </div>
            )}

            {/* Pause/Resume Button */}
            {onPauseToggle && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onPauseToggle}
                    >
                      {isPaused ? (
                        <Play className="h-4 w-4" />
                      ) : (
                        <Pause className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isPaused ? 'Resume' : 'Pause'} test</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          {/* Right: Progress Bar */}
          <div className="flex-1 max-w-xs">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Progress</span>
                <span className="font-medium">{progressPercentage}%</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Warning Banner for Low Time */}
      {showCriticalWarning && (
        <div className="bg-red-50 dark:bg-red-950/20 border-t border-red-200 dark:border-red-900 px-6 py-2">
          <div className="flex items-center justify-center gap-2 text-sm text-red-800 dark:text-red-200">
            <AlertTriangle className="h-4 w-4 animate-pulse" />
            <span className="font-medium">
              Less than 1 minute remaining! Complete your responses now.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
