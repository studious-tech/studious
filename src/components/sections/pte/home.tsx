'use client';

import { TestSessionDashboard } from '@/components/test-session/test-session-dashboard';

export function PTEHome() {
  return (
    <TestSessionDashboard 
      examId="pte-academic"
      examName="pte-academic"
      examDisplayName="PTE Academic"
    />
  );
}