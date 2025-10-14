// components/exam/subscription-status.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExamService } from '@/lib/exam-service';
import { UserSubscription, SubscriptionPlan } from '@/lib/interfaces';

export function SubscriptionStatus({ userId }: { userId: string }) {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userSubscription, subscriptionPlans] = await Promise.all([
          ExamService.getSubscriptionForUser(userId),
          ExamService.getSubscriptionPlans()
        ]);
        
        setSubscription(userSubscription);
        setPlans(subscriptionPlans);
      } catch (error) {
        console.error('Failed to fetch subscription data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  if (loading) {
    return <div className="flex justify-center items-center h-32">Loading subscription status...</div>;
  }

  const currentPlan = subscription 
    ? plans.find(plan => plan.id === subscription.plan_id)
    : plans.find(plan => plan.name === 'free');

  const isPremium = currentPlan?.name.includes('premium') || false;

  return (
    <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Subscription Status</span>
          {isPremium ? (
            <Badge className="bg-green-100 text-green-800">Premium</Badge>
          ) : (
            <Badge className="bg-blue-100 text-blue-800">Free</Badge>
          )}
        </CardTitle>
        <CardDescription className="text-gray-500 dark:text-gray-400">
          {currentPlan?.display_name || 'Free Plan'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {subscription ? (
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Status</span>
              <span className="font-medium">
                {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Expires</span>
              <span className="font-medium">
                {new Date(subscription.expires_at).toLocaleDateString()}
              </span>
            </div>
            {!isPremium && (
              <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
                Upgrade to Premium
              </Button>
            )}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              No active subscription
            </p>
            <Button className="bg-blue-600 hover:bg-blue-700">
              Get Started
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}