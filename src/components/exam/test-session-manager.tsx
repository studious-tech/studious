// components/exam/test-session-manager.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DatabaseService } from '@/lib/database-service';
import { TestSession } from '@/lib/interfaces';

export function TestSessionManager({ 
  userId, 
  examId 
}: { 
  userId: string; 
  examId: string;
}) {
  const [session, setSession] = useState<TestSession | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const startNewSession = async () => {
    setLoading(true);
    try {
      const newSession = await DatabaseService.createTestSession({
        user_id: userId,
        exam_id: examId,
        session_type: 'practice',
        session_name: `Practice Session ${new Date().toLocaleString()}`,
        started_at: new Date().toISOString(),
        completed_at: null,
        status: 'in_progress',
        overall_score: null,
        section_scores: null,
        time_remaining_seconds: null,
        metadata: {}
      });
      
      setSession(newSession);
    } catch (error) {
      console.error('Failed to start session:', error);
    } finally {
      setLoading(false);
    }
  };

  const completeSession = async () => {
    if (!session) return;
    
    setLoading(true);
    try {
      const updatedSession = await DatabaseService.updateTestSession(session.id, {
        completed_at: new Date().toISOString(),
        status: 'completed'
      });
      
      setSession(updatedSession);
    } catch (error) {
      console.error('Failed to complete session:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle>Test Session</CardTitle>
        <CardDescription>Manage your practice sessions</CardDescription>
      </CardHeader>
      <CardContent>
        {session ? (
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Status</span>
              <span className="font-medium capitalize">{session.status.replace('_', ' ')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Started</span>
              <span className="font-medium">
                {new Date(session.started_at).toLocaleTimeString()}
              </span>
            </div>
            {session.completed_at && (
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Completed</span>
                <span className="font-medium">
                  {new Date(session.completed_at).toLocaleTimeString()}
                </span>
              </div>
            )}
            {session.status === 'in_progress' && (
              <Button 
                onClick={completeSession} 
                className="w-full mt-4 bg-green-600 hover:bg-green-700"
                disabled={loading}
              >
                {loading ? 'Completing...' : 'Complete Session'}
              </Button>
            )}
          </div>
        ) : (
          <Button 
            onClick={startNewSession} 
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? 'Starting...' : 'Start Practice Session'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}