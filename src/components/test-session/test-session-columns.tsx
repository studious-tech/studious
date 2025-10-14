'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TestSession, SessionType } from '@/types/test-session';
import { toast } from 'sonner';
import { Play, MoreHorizontal, Edit, Trash2, Settings, CheckCircle2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTestSession } from '@/stores/test-session-store';

const sessionTypeLabels: Record<SessionType, string> = {
  practice: 'Practice',
  mock_test: 'Mock Test',
  focused_practice: 'Focused Practice',
};

// Helper function to format duration
const formatDuration = (minutes: number | null) => {
  if (!minutes) return 'Untimed';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

// Helper function to format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const createTestSessionColumns = (examId: string) => {
  const columns: ColumnDef<TestSession>[] = [
    {
      accessorKey: 'session_name',
      header: 'Test Name',
      cell: ({ row }) => {
        const session = row.original;
        return (
          <div>
            <div className="font-medium">{session.session_name}</div>
            <div className="text-sm text-muted-foreground">
              {session.question_count} questions • {formatDuration(session.total_duration_minutes)}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'session_type',
      header: 'Type',
      cell: ({ row }) => {
        const sessionType = row.original.session_type;
        return <Badge variant="outline">{sessionTypeLabels[sessionType]}</Badge>;
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const session = row.original;
        let variant = 'outline';
        let text = session.status.charAt(0).toUpperCase() + session.status.slice(1);
        let icon = null;

        switch (session.status) {
          case 'completed':
            variant = 'default';
            icon = <CheckCircle2 className="h-4 w-4 mr-2" />;
            text = `${Math.round(session.percentage_score || 0)}%`;
            break;
          case 'active':
            variant = 'secondary';
            text = 'In Progress';
            icon = <Play className="h-4 w-4 mr-2" />;
            break;
          case 'draft':
            variant = 'outline';
            icon = <Settings className="h-4 w-4 mr-2" />;
            break;
          default:
            variant = 'outline';
        }

        return (
          <Badge variant={variant as any}>
            {icon}
            {text}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'created_at',
      header: 'Created',
      cell: ({ row }) => {
        return formatDate(row.original.created_at);
      },
    },
    {
      accessorKey: 'total_time_spent_seconds',
      header: 'Time Spent',
      cell: ({ row }) => {
        const seconds = row.original.total_time_spent_seconds;
        if (!seconds) return '0m';
        const minutes = Math.round(seconds / 60);
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const session = row.original;
        const { management } = useTestSession();
        
        const handleStartSession = async () => {
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

        const handleDeleteSession = async () => {
          if (!confirm('Are you sure you want to delete this test session?')) return;

          try {
            const response = await fetch(`/api/test-sessions/${session.id}`, {
              method: 'DELETE',
            });

            if (response.ok) {
              management.removeSession(session.id);
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

        return (
          <div className="flex items-center justify-end space-x-2">
            {session.status === 'draft' && (
              <Button onClick={handleStartSession} size="sm">
                <Play className="mr-2 h-4 w-4" />
                Start
              </Button>
            )}

            {session.status === 'active' && (
              <Button
                onClick={() => (window.location.href = `/test-session/${session.id}`)}
                size="sm"
              >
                Continue
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleDeleteSession}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  return columns;
};