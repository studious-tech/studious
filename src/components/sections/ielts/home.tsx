'use client';

import { TestSessionDashboard } from '@/components/test-session/test-session-dashboard';

export function IELTSHome() {
  return (
    <TestSessionDashboard 
      examId="ielts-academic"
      examName="ielts-academic"
      examDisplayName="IELTS Academic"
    />
  );
}