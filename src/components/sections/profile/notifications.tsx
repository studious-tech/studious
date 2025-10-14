'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

export function NotificationSettings() {
  const [notifications, setNotifications] = useState({
    email: {
      newsletter: true,
      productUpdates: true,
      examTips: true,
      performanceReports: true,
      studyReminders: true
    },
    push: {
      studyReminders: true,
      examDeadlines: true,
      performanceAlerts: false,
      newFeatures: true
    },
    sms: {
      urgentAlerts: true,
      examReminders: false
    }
  });

  const toggleNotification = (category: keyof typeof notifications, type: string) => {
    setNotifications({
      ...notifications,
      [category]: {
        ...notifications[category],
        [type]: !notifications[category][type as keyof typeof notifications[typeof category]]
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Email Notifications</h3>
        <div className="space-y-4">
          {Object.entries(notifications.email).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <Label htmlFor={`email-${key}`} className="font-normal">
                {key.split(/(?=[A-Z])/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </Label>
              <Checkbox
                id={`email-${key}`}
                checked={value}
                onCheckedChange={() => toggleNotification('email', key)}
              />
            </div>
          ))}
        </div>
      </div>
      
      <Separator />
      
      <div>
        <h3 className="text-lg font-medium mb-4">Push Notifications</h3>
        <div className="space-y-4">
          {Object.entries(notifications.push).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <Label htmlFor={`push-${key}`} className="font-normal">
                {key.split(/(?=[A-Z])/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </Label>
              <Checkbox
                id={`push-${key}`}
                checked={value}
                onCheckedChange={() => toggleNotification('push', key)}
              />
            </div>
          ))}
        </div>
      </div>
      
      <Separator />
      
      <div>
        <h3 className="text-lg font-medium mb-4">SMS Notifications</h3>
        <div className="space-y-4">
          {Object.entries(notifications.sms).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <Label htmlFor={`sms-${key}`} className="font-normal">
                {key.split(/(?=[A-Z])/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </Label>
              <Checkbox
                id={`sms-${key}`}
                checked={value}
                onCheckedChange={() => toggleNotification('sms', key)}
              />
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button>Save Preferences</Button>
      </div>
    </div>
  );
}