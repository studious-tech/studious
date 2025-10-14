'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/supabase/client';
import { getStripe } from '@/lib/stripe';

// Clean subscription types matching new schema
export interface SubscriptionPlan {
  id: string;
  name: string; // 'monthly' or 'yearly'
  display_name: string;
  description: string;
  billing_interval: 'month' | 'year';
  price: {
    amount: number; // in cents
    currency: string;
    formatted: string;
  };
  stripe_price_id: string;
  savings: number; // percentage for yearly
  features: string[];
}

export interface UserSubscription {
  has_subscription: boolean;
  plan_type: 'free' | 'pro';
  plan_name: string | null;
  status: string;
  expires_at: string | null;
  stripe_customer_id: string | null;
  limits: {
    mock_tests: number | 'unlimited';
    practice_questions: number | 'unlimited';
  };
}

// Get subscription plans for an exam
export function useSubscriptionPlans(examId: string) {
  return useQuery({
    queryKey: ['subscription-plans', examId],
    queryFn: async () => {
      const response = await fetch(`/api/subscription/plans?exam_id=${examId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch subscription plans');
      }
      const data = await response.json();
      return data.plans as SubscriptionPlan[];
    },
    enabled: !!examId,
  });
}

// Get current user's subscription status
export function useSubscriptionStatus(examId: string) {
  return useQuery({
    queryKey: ['subscription-status', examId],
    queryFn: async () => {
      const response = await fetch(`/api/subscription?exam_id=${examId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch subscription status');
      }
      return response.json() as Promise<UserSubscription>;
    },
    enabled: !!examId,
  });
}

// Create checkout session for subscription
export function useCreateCheckout() {
  return useMutation({
    mutationFn: async (params: {
      planId: string;
      examId: string;
      successUrl: string;
      cancelUrl: string;
    }) => {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create checkout session');
      }

      const { sessionId } = await response.json();

      // Redirect to Stripe Checkout
      const stripe = await getStripe();
      const { error } = await stripe!.redirectToCheckout({ sessionId });

      if (error) {
        throw new Error(error.message);
      }
    },
  });
}

// Create customer portal session
export function useCustomerPortal() {
  return useMutation({
    mutationFn: async (returnUrl: string) => {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ returnUrl }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create portal session');
      }

      const { url } = await response.json();
      window.location.href = url;
    },
  });
}

// Check if user has active subscription
export function useHasSubscription(examId: string) {
  const { data: subscription } = useSubscriptionStatus(examId);
  return {
    hasSubscription: subscription?.has_subscription ?? false,
    isPro: subscription?.plan_type === 'pro',
    isFree: subscription?.plan_type === 'free',
    isLoading: !subscription,
  };
}

// Check subscription limits
export function useSubscriptionLimits(examId: string) {
  const { data: subscription } = useSubscriptionStatus(examId);

  return {
    mockTests: subscription?.limits.mock_tests ?? 2,
    practiceQuestions: subscription?.limits.practice_questions ?? 50,
    hasUnlimitedMockTests: subscription?.limits.mock_tests === 'unlimited',
    hasUnlimitedPracticeQuestions: subscription?.limits.practice_questions === 'unlimited',
    isLoading: !subscription,
  };
}

// Invalidate subscription queries (useful after webhook updates)
export function useInvalidateSubscription() {
  const queryClient = useQueryClient();

  return (examId?: string) => {
    if (examId) {
      queryClient.invalidateQueries({ queryKey: ['subscription-status', examId] });
      queryClient.invalidateQueries({ queryKey: ['subscription-plans', examId] });
    } else {
      queryClient.invalidateQueries({ queryKey: ['subscription-status'] });
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
    }
  };
}