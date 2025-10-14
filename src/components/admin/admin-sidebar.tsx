'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  BarChart3,
  Users,
  BookOpen,
  Image,
  Settings,
  Home,
  FileText,
  Shield,
  LogOut,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import { useState } from 'react';

const navigation = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: BarChart3,
  },
  {
    name: 'Users',
    href: '/admin/users',
    icon: Users,
  },
  {
    name: 'Questions',
    href: '/admin/questions',
    icon: BookOpen,
  },
  {
    name: 'Media',
    href: '/admin/media',
    icon: Image,
  },
  {
    name: 'Content',
    href: '/admin/content',
    icon: FileText,
    children: [
      {
        name: 'Exams',
        href: '/admin/content/exams',
      },
      {
        name: 'Courses',
        href: '/admin/content/courses',
      },
    ],
  },
];

const secondaryNavigation = [
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: Settings,
  },
  {
    name: 'Security',
    href: '/admin/security',
    icon: Shield,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    '/admin/content': pathname.startsWith('/admin/content'),
  });

  const toggleSection = (href: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [href]: !prev[href]
    }));
  };

  return (
    <div className="flex w-64 flex-col bg-white border-r border-gray-200">
      <div className="flex h-16 shrink-0 items-center px-6">
        <Link href="/admin" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
            <Home className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-semibold text-gray-900">
            Admin Panel
          </span>
        </Link>
      </div>
      
      <Separator />
      
      <ScrollArea className="flex-1">
        <div className="px-3 py-4">
          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== '/admin' && pathname.startsWith(item.href));
              
              const isExpanded = expandedSections[item.href] || false;
              
              return (
                <div key={item.name}>
                  <Link
                    href={item.children ? '#' : item.href}
                    className={cn(
                      'flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors w-full',
                      isActive && !item.children
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    )}
                    onClick={(e) => {
                      if (item.children) {
                        e.preventDefault();
                        toggleSection(item.href);
                      }
                    }}
                  >
                    <div className="flex items-center">
                      <item.icon className={cn(
                        'mr-3 h-5 w-5',
                        isActive ? 'text-blue-500' : 'text-gray-500'
                      )} />
                      {item.name}
                    </div>
                    {item.children && (
                      <div>
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </div>
                    )}
                  </Link>
                  
                  {item.children && isExpanded && (
                    <div className="ml-8 mt-1 space-y-1">
                      {item.children.map((child) => {
                        const isChildActive = pathname === child.href;
                        return (
                          <Link
                            key={child.name}
                            href={child.href}
                            className={cn(
                              'flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                              isChildActive
                                ? 'bg-blue-100 text-blue-700'
                                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                            )}
                          >
                            {child.name}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
        
        <Separator className="mx-3" />
        
        <div className="px-3 py-4">
          <nav className="space-y-1">
            {secondaryNavigation.map((item) => {
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  )}
                >
                  <item.icon className={cn(
                    'mr-3 h-5 w-5',
                    isActive ? 'text-blue-500' : 'text-gray-500'
                  )} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </ScrollArea>
      
      <div className="p-4 border-t border-gray-200">
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-700 hover:text-gray-900"
          onClick={() => {
            // Add logout functionality
            window.location.href = '/';
          }}
        >
          <LogOut className="mr-3 h-5 w-5" />
          Exit Admin
        </Button>
      </div>
    </div>
  );
}