'use client';

import { useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { useSubscriptionPlans, useCreateCheckout, useHasSubscription } from '@/hooks/use-subscription';

interface SubscriptionPlansProps {
  examId: string;
  currentPath?: string;
}

export function SubscriptionPlans({ examId, currentPath = '/' }: SubscriptionPlansProps) {
  const { data: plans, isLoading } = useSubscriptionPlans(examId);
  const { hasSubscription } = useHasSubscription(examId);
  const createCheckout = useCreateCheckout();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

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

  const handleSubscribe = async (planId: string) => {
    setSelectedPlan(planId);
    try {
      await createCheckout.mutateAsync({
        planId,
        examId,
        successUrl: `${window.location.origin}/subscription/success?exam_id=${examId}`,
        cancelUrl: `${window.location.origin}${currentPath}`,
      });
    } catch (error) {
      console.error('Checkout error:', error);
      setSelectedPlan(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
      </div>
    );
  }

  if (!plans || plans.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No subscription plans available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Choose Your Plan
        </h2>
        <p className="text-gray-600">
          Unlock unlimited access to all {examId.toUpperCase().replace('-', ' ')} features
        </p>
      </div>

      {/* Plans Grid */}
      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative rounded-lg border-2 p-6 ${
              plan.billing_interval === 'year'
                ? `border-2 ${currentColors.secondary.replace('bg-', 'border-').replace('text-', '').replace(' border-', ' border-')}`
                : 'border-gray-200'
            }`}
          >
            {/* Popular Badge for Yearly */}
            {plan.billing_interval === 'year' && plan.savings > 0 && (
              <div className={`absolute -top-3 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full text-sm font-medium ${currentColors.badge}`}>
                Save {plan.savings}%
              </div>
            )}

            {/* Plan Header */}
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {plan.display_name}
              </h3>
              <div className="mb-2">
                <span className="text-3xl font-bold text-gray-900">
                  {plan.price.formatted}
                </span>
                <span className="text-gray-600 ml-1">
                  /{plan.billing_interval}
                </span>
              </div>
              {plan.description && (
                <p className="text-sm text-gray-600">{plan.description}</p>
              )}
            </div>

            {/* Features */}
            <div className="space-y-3 mb-6">
              {plan.features.map((feature, index) => (
                <div key={index} className="flex items-center">
                  <Check className={`h-5 w-5 ${currentColors.accent} mr-3 flex-shrink-0`} />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            {/* Subscribe Button */}
            <button
              onClick={() => handleSubscribe(plan.id)}
              disabled={hasSubscription || createCheckout.isPending}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                hasSubscription
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : plan.billing_interval === 'year'
                  ? currentColors.primary
                  : `border-2 ${currentColors.secondary}`
              }`}
            >
              {createCheckout.isPending && selectedPlan === plan.id ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processing...
                </div>
              ) : hasSubscription ? (
                'Current Plan'
              ) : (
                'Subscribe Now'
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Trust Indicators */}
      <div className="text-center text-sm text-gray-500 space-y-1">
        <p>✓ Cancel anytime</p>
        <p>✓ Secure payment with Stripe</p>
        <p>✓ Instant access after payment</p>
      </div>
    </div>
  );
}