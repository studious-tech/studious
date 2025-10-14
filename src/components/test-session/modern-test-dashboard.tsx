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
  BarChart3,
  History,
  BookOpen,
  CheckCircle2,
  Settings,
  Edit,
  Trash2,
  MoreVertical
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
  SessionType
} from '@/types/test-session';
import { toast } from 'sonner';

interface ModernTestDashboardProps {
  examId: string;
  examDisplayName: string;
}

const sessionTypeLabels: Record<SessionType, string> = {
  practice: 'Practice',
  mock_test: 'Mock Test',
  focused_practice: 'Focused Practice'
};

export function ModernTestDashboard({ examId, examDisplayName }: ModernTestDashboardProps) {
  const [activeView, setActiveView] = useState<'overview' | 'create-test' | 'my-tests' | 'history'>('overview');
  const [isLoadingCreate, setIsLoadingCreate] = useState(false);
  const { management } = useTestSession();

  // Load user's test sessions on mount
  useEffect(() => {
    loadUserSessions();
  }, [examId]);

  const loadUserSessions = async () => {
    management.setLoadingSessions(true);
    try {
      const response = await fetch(`/api/test-sessions?exam_id=${examId}&per_page=50`);
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
        configuration
      };

      const response = await fetch('/api/test-sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      });

      if (response.ok) {
        const result: CreateTestSessionResponse = await response.json();
        management.addSession(result.session);
        toast.success(`Test session "${configuration.session_name}" created successfully!`);
        setActiveView('my-tests');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create test session');
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
        method: 'POST'
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
        method: 'DELETE'
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
      minute: '2-digit'
    });
  };

  // Calculate dashboard statistics
  const draftSessions = management.userSessions.filter(s => s.status === 'draft').length;
  const completedSessions = management.userSessions.filter(s => s.status === 'completed').length;
  const averageScore = management.userSessions
    .filter(s => s.status === 'completed' && s.percentage_score)
    .reduce((sum, s) => sum + (s.percentage_score || 0), 0) / 
    (management.userSessions.filter(s => s.status === 'completed' && s.percentage_score).length || 1);

  // Create Test View
  if (activeView === 'create-test') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Create New Test</h1>
                <p className="text-gray-600">Configure your custom {examDisplayName} practice test</p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setActiveView('overview')}
              >
                Cancel
              </Button>
            </div>
          </div>

          {/* Form Content - Full Width */}
          <div className="p-6">
            <div className="w-full">
              <CompactTestConfigurationForm
                examId={examId}
                examName={examDisplayName}
                onSubmit={handleCreateTest}
                isLoading={isLoadingCreate}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">{examDisplayName}</h2>
            <p className="text-sm text-gray-600">Practice Dashboard</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            <button
              onClick={() => setActiveView('overview')}
              className={`w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeView === 'overview'
                  ? 'bg-gray-100 text-gray-900' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <BarChart3 className="mr-3 h-4 w-4" />
              Overview
            </button>
            
            <button
              onClick={() => setActiveView('my-tests')}
              className={`w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeView === 'my-tests'
                  ? 'bg-gray-100 text-gray-900' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <BookOpen className="mr-3 h-4 w-4" />
              My Tests
            </button>
            
            <button
              onClick={() => setActiveView('history')}
              className={`w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeView === 'history'
                  ? 'bg-gray-100 text-gray-900' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <History className="mr-3 h-4 w-4" />
              History
            </button>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <Button 
              className="w-full" 
              size="sm"
              onClick={() => setActiveView('create-test')}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create New Test
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar */}
          <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {activeView === 'overview' && 'Overview'}
                  {activeView === 'my-tests' && 'My Tests'}
                  {activeView === 'history' && 'History'}
                </h1>
                <p className="text-gray-600">Manage your practice sessions</p>
              </div>
              
              {/* Quick Stats */}
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">{draftSessions}</div>
                  <div className="text-xs text-gray-500">Draft</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">{completedSessions}</div>
                  <div className="text-xs text-gray-500">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">{Math.round(averageScore)}%</div>
                  <div className="text-xs text-gray-500">Avg Score</div>
                </div>
              </div>
            </div>
          </header>

          {/* Content Area */}
          <main className="flex-1 overflow-auto p-6">
            {activeView === 'overview' && (
              <div className="space-y-6">
                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveView('create-test')}>
                    <CardContent className="flex items-center p-6">
                      <div className="p-3 bg-blue-50 rounded-lg mr-4">
                        <Target className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Full Mock Test</h3>
                        <p className="text-sm text-gray-600">Complete practice exam</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveView('create-test')}>
                    <CardContent className="flex items-center p-6">
                      <div className="p-3 bg-green-50 rounded-lg mr-4">
                        <Clock className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Quick Practice</h3>
                        <p className="text-sm text-gray-600">Short practice session</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveView('create-test')}>
                    <CardContent className="flex items-center p-6">
                      <div className="p-3 bg-orange-50 rounded-lg mr-4">
                        <BookOpen className="h-6 w-6 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Weak Areas</h3>
                        <p className="text-sm text-gray-600">Focus on improvement</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {management.userSessions.slice(0, 5).map((session) => (
                      <div key={session.id} className="flex items-center justify-between py-3 border-b last:border-b-0">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 rounded border border-gray-300 text-gray-600">
                            {session.status === 'completed' ? <CheckCircle2 className="h-4 w-4" /> :
                             session.status === 'active' ? <Play className="h-4 w-4" /> :
                             <Settings className="h-4 w-4" />}
                          </div>
                          <div>
                            <h4 className="font-medium">{session.session_name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(session.created_at)} • {session.question_count} questions
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">
                            {sessionTypeLabels[session.session_type]}
                          </Badge>
                          {session.status === 'completed' && session.percentage_score && (
                            <Badge variant="outline">
                              {Math.round(session.percentage_score)}%
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            )}

            {activeView === 'my-tests' && (
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
                      <p className="text-muted-foreground mb-4">Create your first custom practice test to get started.</p>
                      <Button onClick={() => setActiveView('create-test')}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Test
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {management.userSessions.map((session) => (
                      <Card key={session.id}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className="text-lg font-semibold">{session.session_name}</h3>
                                <Badge variant="outline">
                                  {sessionTypeLabels[session.session_type]}
                                </Badge>
                                {session.status === 'active' && (
                                  <Badge variant="outline" className="text-orange-600 border-orange-300">
                                    <Play className="mr-1 h-3 w-3" />
                                    In Progress
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                                <span>{session.question_count} questions</span>
                                <span>{formatDuration(session.total_duration_minutes)}</span>
                                <span>Created {formatDate(session.created_at)}</span>
                              </div>

                              {session.status === 'completed' && (
                                <div className="flex items-center space-x-4">
                                  <div className="flex items-center space-x-2">
                                    <span className="text-sm">Score:</span>
                                    <Badge variant="outline">
                                      {Math.round(session.percentage_score || 0)}%
                                    </Badge>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Clock className="h-4 w-4" />
                                    <span className="text-sm">
                                      {Math.round((session.total_time_spent_seconds || 0) / 60)}m
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center space-x-2">
                              {session.status === 'draft' && (
                                <Button onClick={() => handleStartSession(session)}>
                                  <Play className="mr-2 h-4 w-4" />
                                  Start
                                </Button>
                              )}
                              
                              {session.status === 'active' && (
                                <Button onClick={() => window.location.href = `/test-session/${session.id}`}>
                                  Continue
                                </Button>
                              )}

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleDeleteSession(session.id)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeView === 'history' && (
              <Card>
                <CardHeader>
                  <CardTitle>Test History</CardTitle>
                </CardHeader>
                <CardContent>
                  {management.userSessions.filter(s => s.status === 'completed').length === 0 ? (
                    <div className="text-center py-8">
                      <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-muted-foreground">No completed tests yet. Start practicing to see your history!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {management.userSessions
                        .filter(s => s.status === 'completed')
                        .sort((a, b) => new Date(b.completed_at || '').getTime() - new Date(a.completed_at || '').getTime())
                        .map((session) => (
                          <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <h4 className="font-medium">{session.session_name}</h4>
                              <p className="text-sm text-muted-foreground">
                                Completed {formatDate(session.completed_at || session.created_at)}
                              </p>
                            </div>
                            <div className="flex items-center space-x-4">
                              <div className="text-center">
                                <div className="text-lg font-bold">{Math.round(session.percentage_score || 0)}%</div>
                                <div className="text-xs text-muted-foreground">Score</div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-bold">
                                  {Math.round((session.total_time_spent_seconds || 0) / 60)}m
                                </div>
                                <div className="text-xs text-muted-foreground">Time</div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}