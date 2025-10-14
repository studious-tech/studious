'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, FileText, Grid3X3, List } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const tabs = [
  {
    name: 'Exams',
    href: '/admin/content/exams',
    icon: BookOpen,
  },
  {
    name: 'Courses',
    href: '/admin/content/courses',
    icon: FileText,
  },
];

export default function ContentPage() {
  const pathname = usePathname();
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Content Management</h1>
        <p className="text-muted-foreground">
          Create and manage exams, courses, and learning materials
        </p>
      </div>

      <div className="border-b">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={cn(
                  'flex items-center whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium',
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:border-muted-foreground hover:text-foreground'
                )}
              >
                <tab.icon className={cn(
                  'mr-2 h-5 w-5',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )} />
                {tab.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card 
          className="hover:shadow-md transition-shadow cursor-pointer" 
          onClick={() => window.location.href = '/admin/content/exams'}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-primary" />
                Exams
              </CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/content/exams">
                  Manage
                </Link>
              </Button>
            </div>
            <CardDescription>
              Create and manage exam structures
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Organize your exams with sections and question types for practice tests.
            </p>
          </CardContent>
        </Card>

        <Card 
          className="hover:shadow-md transition-shadow cursor-pointer" 
          onClick={() => window.location.href = '/admin/content/courses'}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-primary" />
                Courses
              </CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/content/courses">
                  Manage
                </Link>
              </Button>
            </div>
            <CardDescription>
              Create and manage learning courses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Organize courses with modules, videos, and materials for structured learning.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}