'use client';

import { useState } from 'react';
import { BasicInfo } from './basic-info';
import { AcademicInfo } from './academic-info';
import { NotificationSettings } from './notifications';
import { DangerZone } from './danger-zone';
import { Button } from '@/components/ui/button';

export function ProfileTabs() {
  const [activeTab, setActiveTab] = useState('basic');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic':
        return <BasicInfo />;
      case 'academic':
        return <AcademicInfo />;
      case 'notifications':
        return <NotificationSettings />;
      case 'danger':
        return <DangerZone />;
      default:
        return <BasicInfo />;
    }
  };

  return (
    <div className="w-full">
      {/* Tab Navigation - Horizontal on larger screens, vertical on mobile */}
      <div className="block sm:hidden mb-6">
        <label htmlFor="tab-select" className="block text-sm font-medium mb-2">
          Select Section
        </label>
        <select
          id="tab-select"
          value={activeTab}
          onChange={(e) => setActiveTab(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <option value="basic">Basic Information</option>
          <option value="academic">Academic Information</option>
          <option value="notifications">Notifications</option>
          <option value="danger">Danger Zone</option>
        </select>
      </div>
      
      <div className="hidden sm:block mb-6">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={activeTab === 'basic' ? 'default' : 'outline'}
            onClick={() => setActiveTab('basic')}
            className="rounded-full"
          >
            Basic
          </Button>
          <Button
            variant={activeTab === 'academic' ? 'default' : 'outline'}
            onClick={() => setActiveTab('academic')}
            className="rounded-full"
          >
            Academic
          </Button>
          <Button
            variant={activeTab === 'notifications' ? 'default' : 'outline'}
            onClick={() => setActiveTab('notifications')}
            className="rounded-full"
          >
            Notifications
          </Button>
          <Button
            variant={activeTab === 'danger' ? 'destructive' : 'outline'}
            onClick={() => setActiveTab('danger')}
            className="rounded-full"
          >
            Danger Zone
          </Button>
        </div>
      </div>
      
      {/* Tab Content */}
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border">
        {renderTabContent()}
      </div>
    </div>
  );
}