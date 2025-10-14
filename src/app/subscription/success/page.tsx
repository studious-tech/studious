'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { CheckCircle, ArrowRight, Crown } from 'lucide-react';
import Link from 'next/link';
import { useInvalidateSubscription } from '@/hooks/use-subscription';

export const dynamic = 'force-dynamic';

function SubscriptionSuccessContent() {
  const searchParams = useSearchParams();
  const examId = searchParams.get('exam_id');
  const invalidateSubscription = useInvalidateSubscription();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Invalidate subscription cache to get fresh data
    if (examId) {
      invalidateSubscription(examId);
    }

    // Small delay to allow webhook processing
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [examId, invalidateSubscription]);

  if (!examId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Invalid Success Page
          </h1>
          <p className="text-gray-600 mb-8">Missing exam information.</p>
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Go Home
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </div>
      </div>
    );
  }

  const examDisplayName =
    examId === 'pte-academic' ? 'PTE Academic' : 'IELTS Academic';

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
    },
  };

  const currentColors = colors[colorScheme];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Activating Your Subscription...
          </h2>
          <p className="text-gray-600">
            Please wait while we process your payment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          {/* Success Icon */}
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to Pro!
          </h1>

          <p className="text-lg text-gray-600 mb-8">
            Your {examDisplayName} subscription has been successfully activated.
            You now have unlimited access to all premium features.
          </p>

          {/* Pro Benefits */}
          <div className={`rounded-lg p-6 mb-8 ${currentColors.secondary}`}>
            <div className="flex items-center justify-center mb-4">
              <Crown className={`h-6 w-6 ${currentColors.accent} mr-2`} />
              <h3 className="text-lg font-semibold text-gray-900">
                Pro Benefits Unlocked
              </h3>
            </div>

            <ul className="space-y-2 text-sm text-gray-700">
              <li>✓ Unlimited mock tests</li>
              <li>✓ Unlimited practice questions</li>
              <li>✓ AI-powered feedback and analysis</li>
              <li>✓ Advanced performance analytics</li>
              <li>✓ Study progress tracking</li>
              <li>✓ Expert tips and strategies</li>
              <li>✓ Priority support</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Link
              href={`/dashboard?exam=${examId}`}
              className={`w-full inline-flex items-center justify-center py-3 px-6 rounded-lg font-medium transition-colors ${currentColors.primary}`}
            >
              Start Your Preparation
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>

            <Link
              href={`/subscription?exam_id=${examId}`}
              className="w-full inline-flex items-center justify-center py-2 px-4 border border-gray-300 rounded-lg font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Manage Subscription
            </Link>
          </div>

          {/* Support Note */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              Questions about your subscription? Contact our support team
              anytime. We're here to help you succeed in your {examDisplayName}{' '}
              preparation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SubscriptionSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Loading...
            </h2>
          </div>
        </div>
      }
    >
      <SubscriptionSuccessContent />
    </Suspense>
  );
}
