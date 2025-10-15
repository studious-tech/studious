'use client';

import { useEffect, useState } from 'react';
import { Users, BookOpen, Award, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface Stats {
  totalUsers: number;
  totalTests: number;
  totalQuestions: number;
  averageScore: number;
}

export default function LiveStats() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 100000,
    totalTests: 500000,
    totalQuestions: 10000,
    averageScore: 75,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch real stats from API
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats/platform');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const statItems = [
    {
      icon: Users,
      label: 'Active Students',
      value: formatNumber(stats.totalUsers),
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20',
    },
    {
      icon: BookOpen,
      label: 'Tests Completed',
      value: formatNumber(stats.totalTests),
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950/20',
    },
    {
      icon: Award,
      label: 'Practice Questions',
      value: formatNumber(stats.totalQuestions),
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950/20',
    },
    {
      icon: TrendingUp,
      label: 'Average Score',
      value: `${stats.averageScore}%`,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950/20',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full mb-3" />
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
      {statItems.map((stat, index) => (
        <Card
          key={index}
          className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
        >
          <CardContent className="p-6">
            <div className={`${stat.bgColor} w-12 h-12 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <div className="text-3xl font-bold mb-1">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
