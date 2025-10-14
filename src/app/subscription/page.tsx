'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import {
  SubscriptionPlans,
  SubscriptionStatus,
} from '@/components/subscription';
import { useHasSubscription } from '@/hooks/use-subscription';

export const runtime = 'edge';

function SubscriptionPageWrapper() {
  const searchParams = useSearchParams();
  const examId = searchParams.get('exam_id');

  if (!examId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Missing Exam ID
          </h1>
          <p className="text-gray-600">
            Please select an exam to view subscription options.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SubscriptionPageContent examId={examId} />
      </div>
    </div>
  );
}

function SubscriptionPageContent({ examId }: { examId: string }) {
  const { hasSubscription, isLoading } = useHasSubscription(examId);

  const examDisplayName =
    examId === 'pte-academic' ? 'PTE Academic' : 'IELTS Academic';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-96 mb-8"></div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="h-96 bg-gray-200 rounded"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {examDisplayName} Subscription
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          {hasSubscription
            ? 'Manage your subscription and billing preferences'
            : 'Choose the perfect plan for your exam preparation journey'}
        </p>
      </div>

      {/* Subscription Status (for existing subscribers) */}
      {hasSubscription && (
        <div className="max-w-2xl mx-auto">
          <SubscriptionStatus examId={examId} />
        </div>
      )}

      {/* Subscription Plans */}
      <SubscriptionPlans examId={examId} />

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
          Frequently Asked Questions
        </h2>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Can I cancel anytime?
              </h3>
              <p className="text-gray-600">
                Yes, you can cancel your subscription anytime. You'll continue
                to have access until the end of your billing period.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600">
                We accept all major credit cards through our secure payment
                processor Stripe.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Do you offer refunds?
              </h3>
              <p className="text-gray-600">
                We offer a 7-day refund policy for new subscriptions. Contact
                support for assistance.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                How much can I save with annual billing?
              </h3>
              <p className="text-gray-600">
                Annual plans save you 40% compared to monthly billing. That's
                like getting 4 months free!
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Can I change my plan later?
              </h3>
              <p className="text-gray-600">
                Yes, you can upgrade or change your billing cycle through your
                account settings at any time.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                What happens to my progress if I cancel?
              </h3>
              <p className="text-gray-600">
                Your progress and account remain intact. You can resubscribe at
                any time to regain full access.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SubscriptionPage() {
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
      <SubscriptionPageWrapper />
    </Suspense>
  );
}
