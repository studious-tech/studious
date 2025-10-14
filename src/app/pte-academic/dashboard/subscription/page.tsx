'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SubscriptionPlans, SubscriptionStatus } from '@/components/subscription';

export default function PTESubscriptionPage() {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <Tabs defaultValue="plans" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="plans">Subscription Plans</TabsTrigger>
            <TabsTrigger value="status">My Subscription</TabsTrigger>
          </TabsList>

          <TabsContent value="plans" className="mt-6">
            <SubscriptionPlans
              examId="pte-academic"
            />
          </TabsContent>

          <TabsContent value="status" className="mt-6">
            <SubscriptionStatus
              examId="pte-academic"
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}