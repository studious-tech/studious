'use client';

import { ReactNode } from 'react';
import { Lock, Crown, ArrowRight } from 'lucide-react';
import { useHasSubscription } from '@/hooks/use-subscription';
import Link from 'next/link';

interface SubscriptionGuardProps {
  examId: string;
  children: ReactNode;
  fallback?: ReactNode;
  feature?: string;
  className?: string;
}

export function SubscriptionGuard({
  examId,
  children,
  fallback,
  feature = 'this feature',
  className = ''
}: SubscriptionGuardProps) {
  const { hasSubscription, isPro, isLoading } = useHasSubscription(examId);

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

  if (isLoading) {
    return (
      <div className={`animate-pulse bg-gray-100 rounded-lg p-6 ${className}`}>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  // Show content if user has pro subscription
  if (isPro) {
    return <>{children}</>;
  }

  // Show custom fallback if provided
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default upgrade prompt
  return (
    <div className={`rounded-lg border-2 border-dashed border-gray-300 p-8 text-center ${className}`}>
      <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Lock className="h-8 w-8 text-gray-400" />
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Upgrade to Access {feature}
      </h3>

      <p className="text-gray-600 mb-6 max-w-sm mx-auto">
        Get unlimited access to all {examId.toUpperCase().replace('-', ' ')} features with our Pro plan.
      </p>

      <div className="space-y-3">
        <div className="flex items-center justify-center text-sm text-gray-500">
          <Crown className={`h-4 w-4 ${currentColors.accent} mr-2`} />
          <span>Pro features include:</span>
        </div>

        <ul className="text-sm text-gray-600 space-y-1 mb-6">
          <li>✓ Unlimited mock tests</li>
          <li>✓ Unlimited practice questions</li>
          <li>✓ AI-powered feedback</li>
          <li>✓ Performance analytics</li>
        </ul>

        <Link
          href={`/subscription?exam_id=${examId}`}
          className={`inline-flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${currentColors.primary}`}
        >
          Upgrade to Pro
          <ArrowRight className="h-4 w-4 ml-2" />
        </Link>
      </div>
    </div>
  );
}

// Convenience wrapper for limiting usage
interface UsageLimitGuardProps {
  examId: string;
  children: ReactNode;
  usageType: 'mock_tests' | 'practice_questions';
  currentUsage: number;
  className?: string;
}

export function UsageLimitGuard({
  examId,
  children,
  usageType,
  currentUsage,
  className = ''
}: UsageLimitGuardProps) {
  const { isPro } = useHasSubscription(examId);

  // Free tier limits
  const limits = {
    mock_tests: 2,
    practice_questions: 50,
  };

  const limit = limits[usageType];
  const hasReachedLimit = currentUsage >= limit;

  // Pro users have unlimited access
  if (isPro || !hasReachedLimit) {
    return <>{children}</>;
  }

  const featureName = usageType === 'mock_tests' ? 'mock tests' : 'practice questions';

  return (
    <SubscriptionGuard
      examId={examId}
      feature={`unlimited ${featureName}`}
      className={className}
      fallback={
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-6 text-center">
          <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="h-6 w-6 text-orange-600" />
          </div>

          <h3 className="text-lg font-semibold text-orange-900 mb-2">
            Usage Limit Reached
          </h3>

          <p className="text-orange-700 mb-4">
            You've used {currentUsage} of {limit} {featureName} in your free plan.
          </p>

          <Link
            href={`/subscription?exam_id=${examId}`}
            className="inline-flex items-center px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
          >
            Upgrade for Unlimited Access
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </div>
      }
    >
      {children}
    </SubscriptionGuard>
  );
}