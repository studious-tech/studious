'use client';

import { Calendar, CreditCard, Settings, Crown } from 'lucide-react';
import { useSubscriptionStatus, useCustomerPortal } from '@/hooks/use-subscription';

interface SubscriptionStatusProps {
  examId: string;
}

export function SubscriptionStatus({ examId }: SubscriptionStatusProps) {
  const { data: subscription, isLoading } = useSubscriptionStatus(examId);
  const customerPortal = useCustomerPortal();

  // Color scheme based on exam
  const colorScheme = examId === 'pte-academic' ? 'blue' : 'green';
  const colors = {
    blue: {
      primary: 'bg-blue-600 hover:bg-blue-700 text-white',
      secondary: 'bg-blue-50 text-blue-600 border-blue-200',
      accent: 'text-blue-600',
      badge: 'bg-blue-100 text-blue-800',
    },
    green: {
      primary: 'bg-green-600 hover:bg-green-700 text-white',
      secondary: 'bg-green-50 text-green-600 border-green-200',
      accent: 'text-green-600',
      badge: 'bg-green-100 text-green-800',
    }
  };

  const currentColors = colors[colorScheme];

  const handleManageSubscription = () => {
    customerPortal.mutate(window.location.href);
  };

  if (isLoading) {
    return (
      <div className="animate-pulse bg-gray-100 rounded-lg p-6 h-32"></div>
    );
  }

  if (!subscription) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-600">Failed to load subscription status</p>
      </div>
    );
  }

  const isPro = subscription.plan_type === 'pro';
  const isFree = subscription.plan_type === 'free';

  return (
    <div className={`rounded-lg border-2 p-6 ${isPro ? currentColors.secondary : 'bg-gray-50 border-gray-200'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          {isPro ? (
            <Crown className={`h-6 w-6 ${currentColors.accent} mr-2`} />
          ) : (
            <CreditCard className="h-6 w-6 text-gray-400 mr-2" />
          )}
          <div>
            <h3 className="font-semibold text-gray-900">
              {isPro ? 'Pro Plan' : 'Free Plan'}
            </h3>
            <p className="text-sm text-gray-600">
              {examId.toUpperCase().replace('-', ' ')} Subscription
            </p>
          </div>
        </div>

        {isPro && (
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${currentColors.badge}`}>
            Active
          </span>
        )}
      </div>

      {/* Plan Details */}
      <div className="space-y-3 mb-6">
        {isPro ? (
          <>
            <div className="flex items-center text-sm">
              <Calendar className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-gray-600">
                {subscription.plan_name === 'yearly' ? 'Annual Plan' : 'Monthly Plan'}
              </span>
            </div>

            {subscription.expires_at && (
              <div className="flex items-center text-sm">
                <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-gray-600">
                  Renews on {new Date(subscription.expires_at).toLocaleDateString()}
                </span>
              </div>
            )}

            <div className="mt-4 p-3 bg-white rounded border">
              <h4 className="font-medium text-gray-900 mb-2">Your Benefits</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>✓ Unlimited mock tests</li>
                <li>✓ Unlimited practice questions</li>
                <li>✓ AI-powered feedback</li>
                <li>✓ Performance analytics</li>
                <li>✓ Priority support</li>
              </ul>
            </div>
          </>
        ) : (
          <>
            <div className="p-3 bg-white rounded border">
              <h4 className="font-medium text-gray-900 mb-2">Current Limits</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• {subscription.limits.mock_tests} mock tests</li>
                <li>• {subscription.limits.practice_questions} practice questions</li>
                <li>• Basic feedback</li>
              </ul>
            </div>

            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600 mb-3">
                Upgrade to Pro for unlimited access
              </p>
            </div>
          </>
        )}
      </div>

      {/* Actions */}
      {isPro && subscription.stripe_customer_id && (
        <button
          onClick={handleManageSubscription}
          disabled={customerPortal.isPending}
          className={`w-full flex items-center justify-center py-2 px-4 rounded-lg font-medium transition-colors ${currentColors.primary}`}
        >
          <Settings className="h-4 w-4 mr-2" />
          {customerPortal.isPending ? 'Loading...' : 'Manage Subscription'}
        </button>
      )}
    </div>
  );
}