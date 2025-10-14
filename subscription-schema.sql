-- ========================================
-- CLEAN SUBSCRIPTION SYSTEM FOR STRIPE
-- ========================================
-- This replaces the overly complex subscription system with a simple 2-tier approach:
-- FREE: Limited access (built into app logic, no database tracking needed)
-- PRO: Unlimited access via Stripe subscription

-- ========================================
-- 1. DROP EXISTING COMPLEX TABLES
-- ========================================

-- Drop the overly complex tables
DROP TABLE IF EXISTS public.subscription_payments CASCADE;
DROP TABLE IF EXISTS public.user_subscriptions CASCADE;
DROP TABLE IF EXISTS public.subscription_plans CASCADE;

-- ========================================
-- 2. SIMPLE SUBSCRIPTION PLANS
-- ========================================
-- Just store the available plans with Stripe price IDs
-- Only 2 plans per exam: monthly and yearly

CREATE TABLE public.subscription_plans (
  id text NOT NULL PRIMARY KEY,
  exam_id text NOT NULL REFERENCES public.exams(id),
  name text NOT NULL, -- 'monthly' or 'yearly'
  display_name text NOT NULL, -- 'Monthly Plan' or 'Annual Plan'
  description text,
  billing_interval text NOT NULL CHECK (billing_interval IN ('month', 'year')),
  price_amount integer NOT NULL, -- in cents (2999 = $29.99)
  currency text NOT NULL DEFAULT 'usd',
  stripe_price_id text NOT NULL UNIQUE, -- The key field for Stripe integration
  is_active boolean DEFAULT true,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now()
);

-- ========================================
-- 3. USER SUBSCRIPTIONS (STRIPE ONLY)
-- ========================================
-- Track active Stripe subscriptions only
-- All the complex logic is handled by Stripe

CREATE TABLE public.user_subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  exam_id text NOT NULL REFERENCES public.exams(id),
  plan_id text NOT NULL REFERENCES public.subscription_plans(id),

  -- Stripe Integration Fields
  stripe_customer_id text NOT NULL,
  stripe_subscription_id text NOT NULL UNIQUE,

  -- Subscription Details (synced from Stripe)
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'incomplete')),
  current_period_start timestamp without time zone NOT NULL,
  current_period_end timestamp without time zone NOT NULL,
  canceled_at timestamp without time zone,

  -- Metadata
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),

  -- Ensure one active subscription per user per exam
  UNIQUE(user_id, exam_id, status) DEFERRABLE INITIALLY DEFERRED
);

-- ========================================
-- 4. INSERT CLEAN SUBSCRIPTION PLANS
-- ========================================
-- Only 2 plans per exam with proper Stripe price IDs

INSERT INTO public.subscription_plans (
  id, exam_id, name, display_name, description,
  billing_interval, price_amount, currency, stripe_price_id
) VALUES
  -- PTE Academic Plans
  ('pte-monthly', 'pte-academic', 'monthly', 'Monthly Plan',
   'Complete PTE Academic preparation with unlimited access',
   'month', 2999, 'usd', 'price_pte_monthly_placeholder'),

  ('pte-yearly', 'pte-academic', 'yearly', 'Annual Plan',
   'Complete PTE Academic preparation with unlimited access - Save 40%',
   'year', 17999, 'usd', 'price_pte_yearly_placeholder'),

  -- IELTS Academic Plans
  ('ielts-monthly', 'ielts-academic', 'monthly', 'Monthly Plan',
   'Complete IELTS Academic preparation with unlimited access',
   'month', 2999, 'usd', 'price_ielts_monthly_placeholder'),

  ('ielts-yearly', 'ielts-academic', 'yearly', 'Annual Plan',
   'Complete IELTS Academic preparation with unlimited access - Save 40%',
   'year', 17999, 'usd', 'price_ielts_yearly_placeholder');

-- ========================================
-- 5. CREATE INDEXES FOR PERFORMANCE
-- ========================================

CREATE INDEX idx_subscription_plans_exam_id ON public.subscription_plans(exam_id);
CREATE INDEX idx_subscription_plans_stripe_price_id ON public.subscription_plans(stripe_price_id);

CREATE INDEX idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_exam_id ON public.user_subscriptions(exam_id);
CREATE INDEX idx_user_subscriptions_stripe_customer_id ON public.user_subscriptions(stripe_customer_id);
CREATE INDEX idx_user_subscriptions_stripe_subscription_id ON public.user_subscriptions(stripe_subscription_id);
CREATE INDEX idx_user_subscriptions_status ON public.user_subscriptions(status);

-- ========================================
-- 6. HELPER FUNCTIONS
-- ========================================

-- Function to check if user has active subscription for exam
CREATE OR REPLACE FUNCTION user_has_active_subscription(p_user_id uuid, p_exam_id text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_subscriptions
    WHERE user_id = p_user_id
    AND exam_id = p_exam_id
    AND status = 'active'
    AND current_period_end > now()
  );
END;
$$ LANGUAGE plpgsql;

-- Function to get user's subscription status for an exam
CREATE OR REPLACE FUNCTION get_user_subscription_status(p_user_id uuid, p_exam_id text)
RETURNS TABLE (
  has_subscription boolean,
  plan_name text,
  status text,
  current_period_end timestamp without time zone,
  stripe_customer_id text
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    CASE WHEN us.id IS NOT NULL THEN true ELSE false END as has_subscription,
    sp.name as plan_name,
    us.status,
    us.current_period_end,
    us.stripe_customer_id
  FROM public.user_subscriptions us
  JOIN public.subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = p_user_id
  AND us.exam_id = p_exam_id
  AND us.status = 'active'
  AND us.current_period_end > now()
  LIMIT 1;

  -- If no active subscription found, return free status
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, null::text, 'free'::text, null::timestamp, null::text;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 7. COMMENTS FOR CLARITY
-- ========================================

COMMENT ON TABLE public.subscription_plans IS 'Simple subscription plans with Stripe price IDs - only 2 plans per exam';
COMMENT ON TABLE public.user_subscriptions IS 'Active Stripe subscriptions - all complex logic handled by Stripe';

COMMENT ON COLUMN public.subscription_plans.stripe_price_id IS 'Stripe Price ID - the key field for Stripe Checkout integration';
COMMENT ON COLUMN public.subscription_plans.price_amount IS 'Price in cents (2999 = $29.99)';

COMMENT ON COLUMN public.user_subscriptions.stripe_customer_id IS 'Stripe Customer ID for billing portal access';
COMMENT ON COLUMN public.user_subscriptions.stripe_subscription_id IS 'Stripe Subscription ID for webhook updates';

-- ========================================
-- MIGRATION NOTES:
-- ========================================
-- 1. Update stripe_price_id values with real Stripe Price IDs from dashboard
-- 2. All subscription logic is now: FREE (no database record) or PRO (has active record)
-- 3. No more complex usage tracking - PRO users get unlimited everything
-- 4. Stripe webhooks will manage subscription status automatically
-- 5. Customer portal handles all billing, cancellation, etc.
--
-- ENVIRONMENT VARIABLES NEEDED:
-- STRIPE_PRICE_PTE_MONTHLY=price_xxx
-- STRIPE_PRICE_PTE_YEARLY=price_xxx
-- STRIPE_PRICE_IELTS_MONTHLY=price_xxx
-- STRIPE_PRICE_IELTS_YEARLY=price_xxx