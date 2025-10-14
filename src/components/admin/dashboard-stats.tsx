'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Users, 
  BookOpen, 
  Activity, 
  DollarSign, 
  TrendingUp,
  UserCheck,
  Target
} from 'lucide-react';

interface StatsProps {
  stats: {
    total_users: number;
    active_users_today: number;
    total_questions: number;
    total_attempts_today: number;
    active_subscriptions: number;
    revenue_this_month: number;
    average_score_today: number;
    growth_metrics: {
      new_users_this_week: number;
      retention_rate: number;
      conversion_rate: number;
    };
  } | null;
  loading: boolean;
}

export function DashboardStats({ stats, loading }: StatsProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-5" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      title: 'Total Users',
      value: stats.total_users.toLocaleString(),
      icon: Users,
      description: 'Registered users',
      color: 'text-blue-600',
    },
    {
      title: 'Active Today',
      value: stats.active_users_today.toLocaleString(),
      icon: UserCheck,
      description: 'Users active today',
      color: 'text-green-600',
    },
    {
      title: 'Questions',
      value: stats.total_questions.toLocaleString(),
      icon: BookOpen,
      description: 'Total questions',
      color: 'text-purple-600',
    },
    {
      title: 'Attempts Today',
      value: stats.total_attempts_today.toLocaleString(),
      icon: Activity,
      description: 'Practice attempts today',
      color: 'text-orange-600',
    },
    {
      title: 'Subscriptions',
      value: stats.active_subscriptions.toLocaleString(),
      icon: TrendingUp,
      description: 'Active subscriptions',
      color: 'text-indigo-600',
    },
    {
      title: 'Revenue',
      value: `$${stats.revenue_this_month.toLocaleString()}`,
      icon: DollarSign,
      description: 'This month',
      color: 'text-emerald-600',
    },
    {
      title: 'Avg Score',
      value: `${stats.average_score_today.toFixed(1)}`,
      icon: Target,
      description: 'Average score today',
      color: 'text-rose-600',
    },
    {
      title: 'Growth',
      value: `${stats.growth_metrics.new_users_this_week}`,
      icon: TrendingUp,
      description: 'New users this week',
      color: 'text-cyan-600',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-5 w-5 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {stat.value}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}