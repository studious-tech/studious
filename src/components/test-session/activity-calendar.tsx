'use client';

import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ActivityDay {
  date: string;
  count: number;
  score?: number;
}

interface ActivityCalendarProps {
  activities: ActivityDay[];
  className?: string;
}

export function ActivityCalendar({ activities, className = '' }: ActivityCalendarProps) {
  // Generate last 90 days
  const today = new Date();
  const days: ActivityDay[] = [];

  for (let i = 179; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    const activity = activities.find((a) => a.date === dateStr);
    days.push({
      date: dateStr,
      count: activity?.count || 0,
      score: activity?.score,
    });
  }

  // Group by weeks
  const weeks: ActivityDay[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const getColor = (count: number) => {
    if (count === 0) return 'bg-gray-100 dark:bg-gray-800';
    if (count === 1) return 'bg-green-200 dark:bg-green-900';
    if (count === 2) return 'bg-green-400 dark:bg-green-700';
    return 'bg-green-600 dark:bg-green-500';
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <TooltipProvider>
      <div className={`${className}`}>
        <div className="flex">
          <div className="w-full">
            <div className="flex justify-between">
              {weeks.map((week, weekIdx) => (
                <div key={weekIdx} className="flex flex-col gap-1">
                  {week.map((day) => (
                    <Tooltip key={day.date}>
                      <TooltipTrigger asChild>
                        <div
                          className={`w-3 h-3 ${getColor(day.count)} transition-colors cursor-pointer hover:ring-2 hover:ring-gray-400`}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-xs">
                          <p className="font-semibold">{formatDate(day.date)}</p>
                          <p>{day.count} test{day.count !== 1 ? 's' : ''}</p>
                          {day.score !== undefined && (
                            <p className="text-green-600">Avg: {Math.round(day.score)}%</p>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 mt-3 text-xs text-gray-600">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-sm bg-gray-100 dark:bg-gray-800" />
            <div className="w-3 h-3 rounded-sm bg-green-200 dark:bg-green-900" />
            <div className="w-3 h-3 rounded-sm bg-green-400 dark:bg-green-700" />
            <div className="w-3 h-3 rounded-sm bg-green-600 dark:bg-green-500" />
          </div>
          <span>More</span>
        </div>
      </div>
    </TooltipProvider>
  );
}
