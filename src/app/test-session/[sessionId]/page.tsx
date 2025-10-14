'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { TestSessionInterface } from '@/components/test-session/test-session-interface';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

import { SessionType, QuestionSelectionMode, DifficultyLevel, SessionStatus } from '@/types/test-session';

// Test Session interface matching the API response structure
interface TestSession {
  id: string;
  user_id: string;
  exam_id: string;
  session_name: string | null;
  session_type: SessionType;
  is_timed: boolean;
  total_duration_minutes: number | null;
  question_count: number;
  difficulty_levels: DifficultyLevel[];
  question_selection_mode: QuestionSelectionMode;
  include_sections: string[];
  include_question_types: string[];
  session_config: Record<string, any> | null;
  status: SessionStatus;
  started_at: string | null;
  completed_at: string | null;
  total_time_spent_seconds: number;
  total_score: number | null;
  max_possible_score: number | null;
  percentage_score: number | null;
  created_at: string;
  updated_at: string;
  exam?: {
    id: string;
    name: string;
    display_name: string;
    description: string | null;
    duration_minutes: number | null;
    total_score: number | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  };
}

export default function TestSessionPage({ params }: { params: Promise<{ sessionId: string }> }) {
  // Unwrap the params promise
  const unwrappedParams = React.use(params);
  const [session, setSession] = useState<TestSession | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Fetch test session data
  useEffect(() => {
    const fetchSession = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/test-sessions/${unwrappedParams.sessionId}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch test session');
        }

        const data: TestSession = await response.json();
        setSession(data);
      } catch (err) {
        console.error('Error fetching test session:', err);
        setError(err instanceof Error ? err.message : 'Failed to load test session');
      } finally {
        setLoading(false);
      }
    };

    if (unwrappedParams.sessionId) {
      fetchSession();
    }
  }, [unwrappedParams.sessionId]);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-muted-foreground">Loading test session...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !session) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
              <div>
                <h3 className="text-lg font-semibold">Failed to Load Test Session</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  {error || 'The test session could not be found or loaded.'}
                </p>
              </div>
              <Button
                onClick={() => router.back()}
                variant="outline"
              >
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main test session interface
  return (
    <TestSessionInterface
      sessionId={unwrappedParams.sessionId}
      session={session}
    />
  );
}