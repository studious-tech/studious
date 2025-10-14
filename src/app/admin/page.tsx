'use client';

import * as React from 'react';
import { useEffect } from 'react';
import { useAdminStore, AdminUser } from '@/stores/admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RefreshCw, Plus, Eye, Users, BookOpen, FileText, TrendingUp, ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { AdminStats } from '@/components/admin/admin-stats';
import { AdminDataTable } from '@/components/admin/data-table/admin-data-table';
import { adminUserColumns } from '@/components/admin/data-table/admin-user-columns';
import { adminQuestionColumns, AdminQuestion } from '@/components/admin/data-table/admin-question-columns';

export default function AdminDashboard() {
  const { 
    stats, 
    statsLoading, 
    fetchStats, 
    users, 
    fetchUsers, 
    questions, 
    fetchQuestions 
  } = useAdminStore();

  useEffect(() => {
    fetchStats();
    fetchUsers(0);
    fetchQuestions(0);
  }, [fetchStats, fetchUsers, fetchQuestions]);

  const recentUsers = Array.isArray(users) ? users.slice(0, 5) : [];
  const recentQuestions = Array.isArray(questions) ? questions.slice(0, 5) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your exam platform
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchStats}
            disabled={statsLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${statsLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button size="sm" asChild>
            <Link href="/admin/content/exams">
              <Plus className="h-4 w-4 mr-2" />
              Add Content
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <AdminStats stats={stats} loading={statsLoading} />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Recent Users</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/users">
                <Eye className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <AdminDataTable
              columns={adminUserColumns}
              data={recentUsers as AdminUser[]}
              title=""
              description=""
              onRowClick={(user) => {
                window.location.href = `/admin/users/${user.id}`;
              }}
            />
          </CardContent>
        </Card>

        {/* Recent Content */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Recent Content</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/content">
                <Eye className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <AdminDataTable
              columns={adminQuestionColumns}
              data={recentQuestions as AdminQuestion[]}
              title=""
              description=""
              onRowClick={(question) => {
                window.location.href = `/admin/questions/${question.id}`;
              }}
            />
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common administrative tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-20 flex flex-col space-y-2" asChild>
              <Link href="/admin/content/exams">
                <BookOpen className="h-6 w-6" />
                <span>Manage Exams</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col space-y-2" asChild>
              <Link href="/admin/content/courses">
                <FileText className="h-6 w-6" />
                <span>Manage Courses</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col space-y-2" asChild>
              <Link href="/admin/users">
                <Users className="h-6 w-6" />
                <span>Manage Users</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col space-y-2" asChild>
              <Link href="/admin/media">
                <ImageIcon className="h-6 w-6" />
                <span>Manage Media</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}