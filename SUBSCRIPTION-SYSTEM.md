# Clean Subscription System

A simplified subscription system for PTE-Academic and IELTS-Academic exams with Stripe integration.

## Overview

This system implements a clean 2-tier subscription model:
- **Free**: Limited access (2 mock tests, 50 practice questions)
- **Pro**: Unlimited access via Stripe subscription

## Key Features

- Only 2 plans per exam: Monthly and Yearly
- No trial periods - users start free
- Full Stripe integration with webhooks
- Simplified database schema
- Clean React components and hooks

## Database Schema

### Core Tables

#### `subscription_plans`
```sql
- id (text, PK): Plan identifier (e.g., 'pte-monthly', 'ielts-yearly')
- exam_id (text): Links to exams table
- name (text): 'monthly' or 'yearly'
- display_name (text): User-friendly name
- billing_interval (text): 'month' or 'year'
- price_amount (integer): Price in cents
- stripe_price_id (text): Stripe Price ID for checkout
```

#### `user_subscriptions`
```sql
- id (uuid, PK): Subscription identifier
- user_id (uuid): Links to auth.users
- exam_id (text): Links to exams table
- plan_id (text): Links to subscription_plans
- stripe_customer_id (text): Stripe Customer ID
- stripe_subscription_id (text): Stripe Subscription ID
- status (text): 'active', 'canceled', 'past_due', 'incomplete'
- current_period_start (timestamp): Billing period start
- current_period_end (timestamp): Billing period end
```

## API Routes

### Subscription Status
`GET /api/subscription?exam_id={examId}`
- Returns user's subscription status for an exam
- Shows plan type (free/pro), limits, and expiration

### Subscription Plans
`GET /api/subscription/plans?exam_id={examId}`
- Returns available plans for an exam
- Includes pricing, features, and Stripe price IDs

### Checkout
`POST /api/stripe/checkout`
- Creates Stripe checkout session
- Requires: planId, examId, successUrl, cancelUrl

### Customer Portal
`POST /api/stripe/portal`
- Creates Stripe customer portal session
- Requires: returnUrl

### Webhooks
`POST /api/stripe/webhook`
- Handles Stripe subscription events
- Updates database based on Stripe changes

## React Components

### `SubscriptionPlans`
- Displays available plans with pricing
- Handles checkout flow
- Color-coded by exam (blue for PTE, green for IELTS)

### `SubscriptionStatus`
- Shows current subscription status
- Links to customer portal for management

### `SubscriptionGuard`
- Protects premium content
- Shows upgrade prompts for free users

### `UsageLimitGuard`
- Limits usage for free tier
- Tracks mock tests and practice questions

## React Hooks

### `useSubscriptionPlans(examId)`
- Fetches available plans for exam

### `useSubscriptionStatus(examId)`
- Gets current subscription status

### `useHasSubscription(examId)`
- Boolean check for active subscription

### `useSubscriptionLimits(examId)`
- Returns usage limits for current plan

### `useCreateCheckout()`
- Creates Stripe checkout session

### `useCustomerPortal()`
- Redirects to Stripe customer portal

## Environment Variables

Required Stripe configuration:
```env
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Price IDs for each plan
STRIPE_PTE_MONTHLY_PRICE_ID=price_...
STRIPE_PTE_YEARLY_PRICE_ID=price_...
STRIPE_IELTS_MONTHLY_PRICE_ID=price_...
STRIPE_IELTS_YEARLY_PRICE_ID=price_...
```

## Usage Examples

### Basic subscription page
```tsx
import { SubscriptionPlans } from '@/components/subscription';

export default function SubscriptionPage() {
  const examId = 'pte-academic';
  return <SubscriptionPlans examId={examId} />;
}
```

### Protecting premium content
```tsx
import { SubscriptionGuard } from '@/components/subscription';

export default function PremiumFeature() {
  return (
    <SubscriptionGuard examId="pte-academic" feature="unlimited mock tests">
      <PremiumContent />
    </SubscriptionGuard>
  );
}
```

### Limiting free tier usage
```tsx
import { UsageLimitGuard } from '@/components/subscription';

export default function MockTest({ currentUsage }) {
  return (
    <UsageLimitGuard
      examId="pte-academic"
      usageType="mock_tests"
      currentUsage={currentUsage}
    >
      <MockTestContent />
    </UsageLimitGuard>
  );
}
```

## Database Migration

Run the subscription schema:
```sql
-- Apply subscription-schema.sql
-- Update stripe_price_id values with real Stripe Price IDs
```

## Stripe Setup

1. Create products and prices in Stripe Dashboard
2. Copy Price IDs to environment variables
3. Configure webhook endpoint: `/api/stripe/webhook`
4. Enable customer portal in Stripe settings

## Key Simplifications

- Removed complex usage tracking (mock_tests_used, practice_questions_used)
- Eliminated payment history table (Stripe handles this)
- No trial logic - users start free
- Only 2 plans per exam (monthly/yearly)
- Single payment provider (Stripe only)
- Removed unnecessary metadata fields
- Simplified status management

## File Structure

```
src/
├── app/api/subscription/
│   ├── route.ts                 # Subscription status
│   └── plans/route.ts           # Available plans
├── app/api/stripe/
│   ├── checkout/route.ts        # Create checkout session
│   ├── portal/route.ts          # Customer portal
│   └── webhook/route.ts         # Stripe webhooks
├── components/subscription/
│   ├── subscription-plans.tsx
│   ├── subscription-status.tsx
│   ├── subscription-guard.tsx
│   └── index.ts                 # Exports
├── hooks/
│   └── use-subscription.ts
└── lib/
    └── stripe.ts                # Stripe configuration
```

## Key Changes from Complex System

- Removed unnecessary usage tracking fields
- Eliminated payment history table (Stripe handles this)
- Simplified to 2 plans per exam (monthly/yearly only)
- Removed trial logic - users start free
- Single payment provider (Stripe only)
- Clean component and hook naming
- Proper Stripe Price ID integration