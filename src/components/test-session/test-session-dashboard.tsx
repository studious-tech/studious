'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Play, 
  Clock, 
  Target,
  BarChart3,
  Settings,
  History,
  BookOpen,
  CheckCircle2,
  Trash2,
  Edit,
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

interface TestSessionDashboardProps {
  examId: string;
  examName: string;
  examDisplayName: string;
}

const sessionTypeLabels: Record<SessionType, string> = {
  practice: 'Practice',
  mock_test: 'Mock Test',
  focused_practice: 'Focused Practice'
};

const sessionTypeColors: Record<SessionType, string> = {
  practice: 'border border-gray-300 text-gray-700',
  mock_test: 'border border-gray-300 text-gray-700',
  focused_practice: 'border border-gray-300 text-gray-700'
};

export function TestSessionDashboard({ examId, examDisplayName }: TestSessionDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isCreatingTest, setIsCreatingTest] = useState(false);
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
        setIsCreatingTest(false);
        setActiveTab('sessions');
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
        // Navigate to test session (you'll implement this based on your routing)
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

  if (isCreatingTest) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Create New Test</h1>
            <p className="text-muted-foreground">Configure your custom {examDisplayName} practice test</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setIsCreatingTest(false)}
          >
            Cancel
          </Button>
        </div>

        {/* Configuration Form */}
        <CompactTestConfigurationForm
          examId={examId}
          examName={examDisplayName}
          onSubmit={handleCreateTest}
          isLoading={isLoadingCreate}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{examDisplayName} Dashboard</h1>
          <p className="text-muted-foreground">Create and manage your personalized practice tests</p>
        </div>
        <Button onClick={() => setIsCreatingTest(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create New Test
        </Button>
      </div>

      {/* Dashboard Statistics */}
      <Card>
        <CardContent className="py-4">
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-xl font-semibold">{draftSessions}</div>
              <div className="text-xs text-muted-foreground">Draft</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-semibold">{completedSessions}</div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-semibold">{Math.round(averageScore)}%</div>
              <div className="text-xs text-muted-foreground">Avg Score</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-semibold">{management.userSessions.length}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center">
            <BarChart3 className="mr-2 h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="sessions" className="flex items-center">
            <BookOpen className="mr-2 h-4 w-4" />
            My Tests
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center">
            <History className="mr-2 h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Start</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-3">
                <Button 
                  variant="outline" 
                  className="flex-1" 
                  onClick={() => setIsCreatingTest(true)}
                >
                  <Target className="h-4 w-4 mr-2" />
                  Full Mock Test
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1" 
                  onClick={() => setIsCreatingTest(true)}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Quick Practice
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1" 
                  onClick={() => setIsCreatingTest(true)}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Weak Areas
                </Button>
              </div>
            </CardContent>
          </Card>

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
                    <Badge className={sessionTypeColors[session.session_type]}>
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
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
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
                <Button onClick={() => setIsCreatingTest(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Test
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {management.userSessions.map((session) => (
                <Card key={session.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold">{session.session_name}</h3>
                          <Badge className={sessionTypeColors[session.session_type]}>
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
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Test History</CardTitle>
              <CardDescription>
                Your completed test sessions and performance trends
              </CardDescription>
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
        </TabsContent>
      </Tabs>
    </div>
  );
}