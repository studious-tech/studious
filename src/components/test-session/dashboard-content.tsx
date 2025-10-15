'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Play,
  Clock,
  Target,
  BookOpen,
  CheckCircle2,
  Settings,
  Edit,
  Trash2,
  MoreVertical,
  History,
  TrendingUp,
  Crown,
  Zap,
  Award,
  AlertCircle,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CompactTestConfigurationForm } from './compact-test-configuration-form';
import { useTestSession } from '@/stores/test-session-store';
import {
  TestSession,
  TestConfigurationForm as TestConfigFormType,
  CreateTestSessionRequest,
  CreateTestSessionResponse,
  SessionType,
} from '@/types/test-session';
import { toast } from 'sonner';
import { useSearchParams } from 'next/navigation';
import { DataTable } from '@/components/admin/data-table/data-table';
import { createTestSessionColumns } from '@/components/test-session/test-session-columns';
import { ActivityCalendar } from './activity-calendar';
import { PerformanceCharts } from './performance-charts';
import CoursesSection from '../dashboard/courses-section';

interface DashboardContentProps {
  examId: string;
  examDisplayName: string;
}

const sessionTypeLabels: Record<SessionType, string> = {
  practice: 'Practice',
  mock_test: 'Mock Test',
  focused_practice: 'Focused Practice',
};

export function DashboardContent({
  examId,
  examDisplayName,
}: DashboardContentProps) {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeView, setActiveView] = useState<
    'overview' | 'create-test' | 'my-tests' | 'history'
  >((tabParam as any) || 'overview');
  const [isLoadingCreate, setIsLoadingCreate] = useState(false);
  const { management } = useTestSession();

  // Update view when URL changes
  useEffect(() => {
    if (tabParam) {
      setActiveView(tabParam as any);
    } else {
      setActiveView('overview');
    }
  }, [tabParam]);

  // Load user's test sessions on mount
  useEffect(() => {
    loadUserSessions();
  }, [examId]);

  const loadUserSessions = async () => {
    management.setLoadingSessions(true);
    try {
      const response = await fetch(
        `/api/test-sessions?exam_id=${examId}&per_page=50`
      );
      if (response.ok) {
        const data = await response.json();
        management.setUserSessions(data.data || []);
      } else {
        console.error('Failed to load user sessions');
        toast.error('Failed to load your test sessions');
      }
    } catch (error) {
      console.error('Error loading user sessions:', error);
      toast.error('Error loading test sessions');
    } finally {
      management.setLoadingSessions(false);
    }
  };

  const handleCreateTest = async (configuration: TestConfigFormType) => {
    setIsLoadingCreate(true);
    try {
      const request: CreateTestSessionRequest = {
        exam_id: examId,
        configuration,
      };

      const response = await fetch('/api/test-sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (response.ok) {
        const result: CreateTestSessionResponse = await response.json();
        management.addSession(result.session);

        // Show success message with details
        let successMessage = `Test session "${configuration.session_name}" created successfully!`;
        if (result.selection_summary) {
          const { actual_questions, requested_questions } =
            result.selection_summary;
          if (actual_questions !== requested_questions) {
            successMessage += ` (${actual_questions} questions available)`;
          }
        }
        toast.success(successMessage);

        // Show warnings if any
        if (result.warnings && result.warnings.length > 0) {
          result.warnings.forEach((warning) => {
            toast.warning(warning, { duration: 6000 });
          });
        }

        setActiveView('my-tests');
        // Update URL without causing page refresh
        window.history.pushState({}, '', `/${examId}/dashboard?tab=my-tests`);
      } else {
        const error = await response.json();

        // Show detailed error message with suggestions
        if (error.message && error.suggestions) {
          toast.error(error.message, { duration: 8000 });
          setTimeout(() => {
            toast.info(`Suggestions: ${error.suggestions.join(' • ')}`, {
              duration: 10000,
            });
          }, 1000);
        } else {
          toast.error(
            error.error || error.message || 'Failed to create test session'
          );
        }
      }
    } catch (error) {
      console.error('Error creating test session:', error);
      toast.error('Error creating test session');
    } finally {
      setIsLoadingCreate(false);
    }
  };

  const handleStartSession = async (session: TestSession) => {
    try {
      const response = await fetch(`/api/test-sessions/${session.id}/start`, {
        method: 'POST',
      });

      if (response.ok) {
        const result = await response.json();
        management.updateSession(session.id, result.session);
        toast.success('Test session started!');
        window.location.href = `/test-session/${session.id}`;
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to start test session');
      }
    } catch (error) {
      console.error('Error starting session:', error);
      toast.error('Error starting test session');
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to delete this test session?')) return;

    try {
      const response = await fetch(`/api/test-sessions/${sessionId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        management.removeSession(sessionId);
        toast.success('Test session deleted');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete test session');
      }
    } catch (error) {
      console.error('Error deleting session:', error);
      toast.error('Error deleting test session');
    }
  };

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return 'Untimed';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Calculate dashboard statistics
  const draftSessions = management.userSessions.filter(
    (s) => s.status === 'draft'
  ).length;
  const completedSessions = management.userSessions.filter(
    (s) => s.status === 'completed'
  ).length;
  const averageScore =
    management.userSessions
      .filter((s) => s.status === 'completed' && s.percentage_score)
      .reduce((sum, s) => sum + (s.percentage_score || 0), 0) /
    (management.userSessions.filter(
      (s) => s.status === 'completed' && s.percentage_score
    ).length || 1);

  // Create Test View
  if (activeView === 'create-test') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Create New Test</h1>
            <p className="text-gray-600">
              Configure your custom {examDisplayName} practice test
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setActiveView('overview');
              window.history.pushState({}, '', `/${examId}/dashboard`);
            }}
          >
            Cancel
          </Button>
        </div>

        <CompactTestConfigurationForm
          examId={examId}
          examName={examDisplayName}
          onSubmit={handleCreateTest}
          isLoading={isLoadingCreate}
        />
      </div>
    );
  }

  // Overview View
  if (activeView === 'overview') {
    // User subscription status (TODO: Get from actual user data)
    const isSubscribed = false; // Replace with actual subscription check
    const subscriptionPlan = 'free'; // free, basic, pro, premium

    // Calculate stats
    const inProgress = management.userSessions.filter(
      (s) => s.status === 'active'
    );
    const recentCompleted = management.userSessions
      .filter((s) => s.status === 'completed')
      .sort(
        (a, b) =>
          new Date(b.completed_at || '').getTime() -
          new Date(a.completed_at || '').getTime()
      )
      .slice(0, 2);

    // Prepare activity calendar data
    const activityData = management.userSessions
      .filter((s) => s.status === 'completed')
      .reduce((acc, session) => {
        const date = new Date(session.completed_at || session.created_at)
          .toISOString()
          .split('T')[0];
        const existing = acc.find((a) => a.date === date);
        if (existing) {
          existing.count++;
          existing.score =
            ((existing.score || 0) + (session.percentage_score || 0)) / 2;
        } else {
          acc.push({ date, count: 1, score: session.percentage_score || 0 });
        }
        return acc;
      }, [] as { date: string; count: number; score?: number }[]);

    // Prepare chart data (last 7 completed tests)
    const chartData = management.userSessions
      .filter((s) => s.status === 'completed' && s.percentage_score)
      .sort(
        (a, b) =>
          new Date(a.completed_at || '').getTime() -
          new Date(b.completed_at || '').getTime()
      )
      .slice(-7)
      .map((s) => ({
        date: s.completed_at || s.created_at,
        score: s.percentage_score || 0,
        time: s.total_time_spent_seconds || 0,
      }));

    // Calculate streak
    let currentStreak = 0;
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      if (activityData.find((a) => a.date === dateStr)) {
        currentStreak++;
      } else {
        break;
      }
    }

    return (
      <div className="space-y-4">
        {/* Subscription Banner */}
        {!isSubscribed && (
          <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-800">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <Crown className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-sm mb-1">
                      Upgrade to Premium
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Unlock unlimited tests, detailed analytics, and
                      personalized study plans
                    </p>
                  </div>
                </div>
                <Button size="sm" className="bg-amber-600 hover:bg-amber-700">
                  Upgrade Now
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Row with Interactive Elements and Subtle Indicators */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div 
            className="bg-white dark:bg-gray-900 rounded-lg p-3 border cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            onClick={() => {
              setActiveView('history');
              window.history.pushState({}, '', `/${examId}/dashboard?tab=history`);
            }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-600">Total Tests</span>
              <BookOpen className="h-4 w-4 text-gray-400" />
            </div>
            <div className="text-2xl font-bold">
              {management.userSessions.length}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {completedSessions} completed
            </div>
            <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div 
                className="bg-gray-500 h-1.5 rounded-full" 
                style={{ width: `${Math.min(100, (management.userSessions.length / 20) * 10)}%` }}
              ></div>
            </div>
          </div>
          <div 
            className="bg-white dark:bg-gray-900 rounded-lg p-3 border cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            onClick={() => {
              setActiveView('history');
              window.history.pushState({}, '', `/${examId}/dashboard?tab=history`);
            }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-600">Avg Score</span>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-600">
              {Math.round(averageScore)}%
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {completedSessions > 0 ? '+2% this week' : 'No data yet'}
            </div>
            <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div 
                className="bg-green-500 h-1.5 rounded-full" 
                style={{ width: `${Math.min(100, averageScore)}%` }}
              ></div>
            </div>
          </div>
          <div 
            className="bg-white dark:bg-gray-900 rounded-lg p-3 border cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            onClick={() => {
              setActiveView('overview'); // Keep on overview but scroll to activity section
            }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-600">Streak</span>
              <Zap className="h-4 w-4 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-orange-600">
              {currentStreak}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              day{currentStreak !== 1 ? 's' : ''} active
            </div>
            <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div 
                className="bg-orange-500 h-1.5 rounded-full" 
                style={{ width: `${Math.min(100, currentStreak > 0 ? currentStreak * 5 : 0)}%` }}
              ></div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-lg p-3 border">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-600">Plan</span>
              <Crown className="h-4 w-4 text-amber-600" />
            </div>
            <Badge
              variant={isSubscribed ? 'default' : 'outline'}
              className="font-semibold"
            >
              {isSubscribed ? 'PRO' : 'FREE'}
            </Badge>
            <div className="text-xs text-gray-500 mt-1">
              {isSubscribed ? 'Active' : '5 tests limit'}
            </div>
            <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div 
                className="bg-amber-500 h-1.5 rounded-full" 
                style={{ width: isSubscribed ? '100%' : '30%' }}
              ></div>
            </div>
          </div>
        </div>

        {/* Charts */}
        {chartData.length > 2 && <PerformanceCharts data={chartData} />}

        {/* Courses Section */}
        <CoursesSection examId={examId} isCompact={true} />

        {/* Activity & Quick Actions Row */}
        <div className="flex gap-4">
          {/* Activity Calendar - takes 2/3 width on all screen sizes */}
          <div className="w-2/3">
            <Card className="h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <ActivityCalendar activities={activityData} />
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions - takes 1/3 width on all screen sizes */}
          <div className="w-1/3">
            <Card className="h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
              <Button
                className="w-full justify-start h-auto py-3"
                onClick={() => {
                  setActiveView('create-test');
                  window.history.pushState(
                    {},
                    '',
                    `/${examId}/dashboard?tab=create-test`
                  );
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                <div className="text-left">
                  <div className="font-medium">Create New Test</div>
                  <div className="text-xs font-normal opacity-80">
                    Start practicing now
                  </div>
                </div>
              </Button>
              {inProgress.length > 0 && (
                <Button
                  className="w-full justify-start h-auto py-3"
                  variant="outline"
                  onClick={() =>
                    (window.location.href = `/test-session/${inProgress[0].id}`)
                  }
                >
                  <Play className="mr-2 h-4 w-4" />
                  <div className="text-left">
                    <div className="font-medium">Resume Test</div>
                    <div className="text-xs font-normal opacity-80 truncate">
                      {inProgress[0].session_name}
                    </div>
                  </div>
                </Button>
              )}
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => {
                  setActiveView('my-tests');
                  window.history.pushState(
                    {},
                    '',
                    `/${examId}/dashboard?tab=my-tests`
                  );
                }}
              >
                <BookOpen className="mr-2 h-4 w-4" />
                View All Tests
              </Button>
            </CardContent>
            </Card>
          </div>
        </div>

        {/* In Progress & Recent Results */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* In Progress Tests */}
          {inProgress.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center">
                    <Play className="mr-2 h-4 w-4 text-blue-600" />
                    In Progress
                  </CardTitle>
                  <Badge variant="secondary">{inProgress.length}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {inProgress.slice(0, 2).map((session) => (
                  <div
                    key={session.id}
                    className="p-3 border rounded bg-blue-50/50 dark:bg-blue-950/20"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-sm font-medium truncate">
                        {session.session_name}
                      </p>
                      <Button
                        size="sm"
                        onClick={() =>
                          (window.location.href = `/test-session/${session.id}`)
                        }
                      >
                        Resume
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                        <div
                          className="bg-blue-600 h-1.5 rounded-full"
                          style={{
                            width: `${Math.round(
                              (((session as any).questions_answered || 0) /
                                session.question_count) *
                                100
                            )}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {(session as any).questions_answered || 0}/
                        {session.question_count}
                      </span>
                    </div>
                  </div>
                ))}
                {inProgress.length > 2 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setActiveView('my-tests');
                      window.history.pushState(
                        {},
                        '',
                        `/${examId}/dashboard?tab=my-tests`
                      );
                    }}
                  >
                    View {inProgress.length - 2} More
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Recent Results */}
          {recentCompleted.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center">
                    <Award className="mr-2 h-4 w-4 text-green-600" />
                    Recent Results
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setActiveView('history');
                      window.history.pushState(
                        {},
                        '',
                        `/${examId}/dashboard?tab=history`
                      );
                    }}
                  >
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {recentCompleted.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-3 border rounded hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">
                        {session.session_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(
                          session.completed_at || session.created_at
                        ).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="text-right ml-2">
                      <p className="text-lg font-bold text-green-600">
                        {Math.round(session.percentage_score || 0)}%
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {Math.round(
                          (session.total_time_spent_seconds || 0) / 60
                        )}
                        m
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Draft Tests (if exists) */}
          {draftSessions > 0 && !inProgress.length && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    Draft Tests
                  </CardTitle>
                  <Badge variant="secondary">{draftSessions}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {management.userSessions
                  .filter((s) => s.status === 'draft')
                  .slice(0, 2)
                  .map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-2 border rounded hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">
                          {session.session_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {session.question_count} questions
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleStartSession(session)}
                      >
                        Start
                      </Button>
                    </div>
                  ))}
                {draftSessions > 2 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setActiveView('my-tests');
                      window.history.pushState(
                        {},
                        '',
                        `/${examId}/dashboard?tab=my-tests`
                      );
                    }}
                  >
                    View {draftSessions - 2} More
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  // My Tests View
  if (activeView === 'my-tests') {
    const columns = createTestSessionColumns(examId);

    return (
      <div className="space-y-4">
        {management.isLoadingSessions ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span>Loading your tests...</span>
              </div>
            </CardContent>
          </Card>
        ) : management.userSessions.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No tests yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first custom practice test to get started.
              </p>
              <Button
                onClick={() => {
                  setActiveView('create-test');
                  window.history.pushState(
                    {},
                    '',
                    `/${examId}/dashboard?tab=create-test`
                  );
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Test
              </Button>
            </CardContent>
          </Card>
        ) : (
          <DataTable
            columns={columns}
            data={management.userSessions}
            title="My Tests"
            description="Manage your practice tests"
            filterPlaceholder="Search tests..."
            filterKey="session_name"
            actionButton={
              <Button
                onClick={() => {
                  setActiveView('create-test');
                  window.history.pushState(
                    {},
                    '',
                    `/${examId}/dashboard?tab=create-test`
                  );
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Test
              </Button>
            }
          />
        )}
      </div>
    );
  }

  // History View
  if (activeView === 'history') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Test History</CardTitle>
        </CardHeader>
        <CardContent>
          {management.userSessions.filter((s) => s.status === 'completed')
            .length === 0 ? (
            <div className="text-center py-8">
              <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-muted-foreground">
                No completed tests yet. Start practicing to see your history!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {management.userSessions
                .filter((s) => s.status === 'completed')
                .sort(
                  (a, b) =>
                    new Date(b.completed_at || '').getTime() -
                    new Date(a.completed_at || '').getTime()
                )
                .map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <h4 className="font-medium">{session.session_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Completed{' '}
                        {formatDate(session.completed_at || session.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <div className="text-lg font-bold">
                          {Math.round(session.percentage_score || 0)}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Score
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold">
                          {Math.round(
                            (session.total_time_spent_seconds || 0) / 60
                          )}
                          m
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Time
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return null;
}
