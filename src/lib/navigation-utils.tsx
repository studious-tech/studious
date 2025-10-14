import { BookOpen, Headphones, Mic, PenTool } from 'lucide-react';
import React from 'react';

/**
 * Maps section names to icons
 */
export function getSectionIcon(sectionName: string): React.ReactNode {
  const normalizedName = sectionName.toLowerCase();

  if (normalizedName.includes('reading')) {
    return <BookOpen className="w-4 h-4" />;
  }
  if (normalizedName.includes('listening')) {
    return <Headphones className="w-4 h-4" />;
  }
  if (normalizedName.includes('speaking')) {
    return <Mic className="w-4 h-4" />;
  }
  if (normalizedName.includes('writing')) {
    return <PenTool className="w-4 h-4" />;
  }

  return <BookOpen className="w-4 h-4" />;
}

/**
 * Maps exam IDs to emoji icons
 */
export function getExamIcon(examId: string): string {
  if (examId.includes('ielts')) {
    return '📚';
  }
  if (examId.includes('pte')) {
    return '💻';
  }
  if (examId.includes('ucat')) {
    return '🧠';
  }

  return '📖';
}

/**
 * Generates the navigation URL for a question type click
 * Routes to dashboard create-test tab with pre-selected question type
 */
export function getQuestionTypeNavUrl(
  examId: string,
  questionTypeId: string
): string {
  return `/${examId}/dashboard?tab=create-test&questionType=${questionTypeId}`;
}

/**
 * Generates the landing page URL for an exam
 */
export function getExamLandingUrl(examId: string): string {
  return `/${examId}`;
}
