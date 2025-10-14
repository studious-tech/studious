'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  History,
  BookOpen,
  Play,
  Settings,
  BarChart3,
  Clock,
  Target,
  Award,
  Calendar
} from 'lucide-react';

interface ModernDashboardLayoutProps {
  examId: string;
  examDisplayName: string;
  children: React.ReactNode;
}

const sidebarItems = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'my-tests', label: 'My Tests', icon: BookOpen },
  { id: 'history', label: 'History', icon: History },
  { id: 'quick-start', label: 'Quick Start', icon: Play },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function ModernDashboardLayout({ examId, examDisplayName, children }: ModernDashboardLayoutProps) {
  const [activeSection, setActiveSection] = useState('overview');

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
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive 
                      ? 'bg-gray-100 text-gray-900' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="mr-3 h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <Button className="w-full" size="sm">
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
                  {sidebarItems.find(item => item.id === activeSection)?.label || 'Dashboard'}
                </h1>
                <p className="text-gray-600">Manage your practice sessions</p>
              </div>
              
              {/* Quick Stats */}
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">12</div>
                  <div className="text-xs text-gray-500">Tests</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">85%</div>
                  <div className="text-xs text-gray-500">Avg Score</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">24h</div>
                  <div className="text-xs text-gray-500">Study Time</div>
                </div>
              </div>
            </div>
          </header>

          {/* Content Area */}
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}