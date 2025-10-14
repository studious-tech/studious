'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useExamStore } from '@/stores/exam';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  HomeIcon,
  BookOpen,
  FileText,
  Settings,
  Crown,
  HelpCircle,
  ChevronRight,
  Target,
  Zap,
} from 'lucide-react';
import { Section } from '@/stores/exam';

interface SharedDashboardSidebarProps {
  examId: string;
  examDisplayName: string;
}

export function SharedDashboardSidebar({ examId, examDisplayName }: SharedDashboardSidebarProps) {
  const pathname = usePathname();
  const [currentSection, setCurrentSection] = useState<string | null>(null);
  const { selectedExam, loading, fetchExam } = useExamStore();
  
  // Extract section from URL on client side
  useEffect(() => {
    const url = new URL(window.location.href);
    const sectionParam = url.searchParams.get('section');
    if (sectionParam) {
      setCurrentSection(sectionParam);
    }
  }, []);

  // Fetch sections for the exam
  useEffect(() => {
    fetchExam(examId);
  }, [examId, fetchExam]);

  const mainNavItems = [
    {
      title: "Dashboard",
      icon: HomeIcon,
      path: `/${examId}/dashboard`,
    },
    {
      title: "My Courses",
      icon: BookOpen,
      path: `/${examId}/dashboard/courses`,
    },
  ];

  const isActive = (path: string) => {
    if (path.includes('section=')) {
      const sectionId = path.split('section=')[1];
      return currentSection === sectionId;
    }
    return pathname === path;
  };

  // Get appropriate color based on exam
  const getExamColor = () => {
    if (examId.includes('ielts')) {
      return {
        bg: 'bg-blue-100 dark:bg-blue-900',
        text: 'text-blue-600 dark:text-blue-400',
        targetBg: 'bg-blue-50 dark:bg-blue-950/50',
        targetBorder: 'border-blue-200 dark:border-blue-800',
        targetText: 'text-blue-600',
        button: 'bg-blue-600 hover:bg-blue-700',
        targetScore: '7.5'
      };
    } else {
      return {
        bg: 'bg-orange-100 dark:bg-orange-900',
        text: 'text-orange-600 dark:text-orange-400',
        targetBg: 'bg-orange-50 dark:bg-orange-950/50',
        targetBorder: 'border-orange-200 dark:border-orange-800',
        targetText: 'text-orange-600',
        button: 'bg-orange-600 hover:bg-orange-700',
        targetScore: '79'
      };
    }
  };

  const colors = getExamColor();

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <div className="flex items-center gap-3 px-2 py-2">
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${colors.bg}`}>
            <BookOpen className={`h-4 w-4 ${colors.text}`} />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">{examDisplayName}</span>
            <span className="text-xs text-muted-foreground">Dashboard</span>
          </div>
        </div>

        {/* Target Score */}
        <div className={`mx-2 p-3 ${colors.targetBg} rounded-lg border ${colors.targetBorder}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className={`h-4 w-4 ${colors.targetText}`} />
              <span className="text-sm font-medium">Target Score</span>
            </div>
            <span className={`text-lg font-bold ${colors.targetText}`}>{colors.targetScore}</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.path)}
                  >
                    <a href={item.path} className="flex items-center">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Test Management */}
        <SidebarGroup>
          <SidebarGroupLabel>Practice Tests</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === `/${examId}/dashboard`}
                >
                  <a href={`/${examId}/dashboard`} className="flex items-center">
                    <HomeIcon className="h-4 w-4" />
                    <span>Overview</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.includes('my-tests')}
                >
                  <a href={`/${examId}/dashboard?tab=my-tests`} className="flex items-center">
                    <BookOpen className="h-4 w-4" />
                    <span>My Tests</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.includes('history')}
                >
                  <a href={`/${examId}/dashboard?tab=history`} className="flex items-center">
                    <FileText className="h-4 w-4" />
                    <span>History</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="sm" isActive={isActive(`/${examId}/dashboard/settings`)}>
              <a href={`/${examId}/dashboard/settings`} className="flex items-center">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="sm" isActive={isActive(`/${examId}/dashboard/subscription`)}>
              <a href={`/${examId}/dashboard/subscription`} className="flex items-center">
                <Crown className="h-4 w-4" />
                <span>Subscription</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="sm" isActive={isActive(`/${examId}/dashboard/help`)}>
              <a href={`/${examId}/dashboard/help`} className="flex items-center">
                <HelpCircle className="h-4 w-4" />
                <span>Help</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* Start Practice Button */}
        <div className="p-2">
          <Button size="sm" className={`w-full text-white ${colors.button}`} asChild>
            <a href={`/${examId}/dashboard`}>
              <Zap className="mr-2 h-4 w-4" />
              Start Practice
            </a>
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}